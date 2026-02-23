#include "ipc/Protocol.h"
#include "ec5/MortiseTenon.h"
#include <nlohmann/json.hpp>
#include <string>
#include <iostream>
#include <stdexcept>

using json = nlohmann::json;

namespace ipc {

// ─── Parse helpers ────────────────────────────────────────────────────────
static ec5::MortiseTenonGeometry parseGeometry(const json& j) {
    ec5::MortiseTenonGeometry g;
    g.beam_width    = j.at(F_BEAM_WIDTH).get<double>();
    g.beam_height   = j.at(F_BEAM_HEIGHT).get<double>();
    g.tenon_width   = j.at(F_TENON_WIDTH).get<double>();
    g.tenon_height  = j.at(F_TENON_HEIGHT).get<double>();
    g.tenon_length  = j.at(F_TENON_LENGTH).get<double>();
    g.member_length = j.at(F_MEMBER_LENGTH).get<double>();
    return g;
}

static ec5::MaterialConfig parseMaterial(const json& j) {
    ec5::MaterialConfig m;
    m.grade               = j.at(F_GRADE).get<std::string>();
    m.service_class       = j.at(F_SERVICE_CLASS).get<int>();
    m.load_duration_class = j.at(F_LOAD_DURATION).get<std::string>();
    return m;
}

static ec5::LoadCase parseLoads(const json& j) {
    ec5::LoadCase l;
    l.Fv_Ed = j.at(F_FV_ED).get<double>();
    l.Ft_Ed = j.at(F_FT_ED).get<double>();
    return l;
}

// ─── Serialise result ─────────────────────────────────────────────────────
static json serialiseResult(const ec5::MortiseTenonResult& r) {
    json checks = json::array();
    for (const auto& c : r.checks) {
        json item;
        item[std::string(F_CHECK_ID)]    = c.id;
        item[std::string(F_CHECK_LABEL)] = c.label;
        item[std::string(F_RD)]          = c.Rd;
        item[std::string(F_ED)]          = c.Ed;
        item[std::string(F_UTILISATION)] = c.utilisation;
        item[std::string(F_UNIT)]        = c.unit;
        item[std::string(F_PASSED)]      = c.passed;
        checks.push_back(item);
    }

    json summary;
    summary[std::string(F_PASSED)]   = r.summary.passed;
    summary[std::string(F_MAX_UTIL)] = r.summary.max_utilisation;
    summary[std::string(F_GOVERNING)]= r.summary.governing_check;

    json result;
    result[std::string(F_SUMMARY)] = summary;
    result[std::string(F_CHECKS)]  = checks;
    return result;
}

// ─── Main dispatch ────────────────────────────────────────────────────────
void dispatch(const std::string& line) {
    json req;
    try {
        req = json::parse(line);
    } catch (const std::exception& e) {
        // Can't reply with id — write a generic error
        json errPayload;
        errPayload[std::string(F_CODE)]    = "PARSE_ERROR";
        errPayload[std::string(F_MESSAGE)] = e.what();
        json err;
        err[std::string(F_ID)]      = "";
        err[std::string(F_TYPE)]    = std::string(T_ERROR);
        err[std::string(F_PAYLOAD)] = errPayload;
        std::cout << err.dump() << "\n";
        std::cout.flush();
        return;
    }

    const std::string id   = req.value(std::string(F_ID),   "");
    const std::string type = req.value(std::string(F_TYPE), "");

    auto writeError = [&](const std::string& code, const std::string& msg, const std::string& field = "") {
        json payload;
        payload[std::string(F_CODE)]    = code;
        payload[std::string(F_MESSAGE)] = msg;
        if (!field.empty()) payload[std::string(F_FIELD)] = field;

        json resp;
        resp[std::string(F_ID)]      = id;
        resp[std::string(F_TYPE)]    = std::string(T_ERROR);
        resp[std::string(F_PAYLOAD)] = payload;
        std::cout << resp.dump() << "\n";
        std::cout.flush();
    };

    if (type != std::string(T_CALCULATE)) {
        writeError("UNKNOWN_TYPE", "Unknown request type: " + type);
        return;
    }

    try {
        const auto& payload  = req.at(std::string(F_PAYLOAD));
        const auto& jointJ   = payload.at(std::string(F_JOINT));
        const auto& geomJ    = jointJ.at(std::string(F_GEOMETRY));
        const auto& matJ     = jointJ.at(std::string(F_MATERIAL));
        const auto& loadsJ   = payload.at(std::string(F_LOADS));

        ec5::MortiseTenonInput input;
        input.geometry = parseGeometry(geomJ);
        input.material = parseMaterial(matJ);
        input.loads    = parseLoads(loadsJ);

        const auto result = ec5::calculate(input);

        json resp;
        resp[std::string(F_ID)]      = id;
        resp[std::string(F_TYPE)]    = std::string(T_RESULT);
        resp[std::string(F_PAYLOAD)] = serialiseResult(result);
        std::cout << resp.dump() << "\n";
        std::cout.flush();

    } catch (const std::invalid_argument& e) {
        const std::string msg = e.what();
        // Try to extract field hint from message
        std::string field;
        auto pos = msg.find("(field: ");
        if (pos != std::string::npos) {
            auto end = msg.find(')', pos);
            if (end != std::string::npos)
                field = msg.substr(pos + 8, end - pos - 8);
        }
        writeError("INVALID_GEOMETRY", msg, field);
    } catch (const std::exception& e) {
        writeError("ENGINE_ERROR", e.what());
    }
}

} // namespace ipc
