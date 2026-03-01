#include "ec5/MortiseTenon.h"
#include <stdexcept>
#include <algorithm>
#include <unordered_map>
#include <string>

namespace ec5 {

// ─── Material lookup tables ────────────────────────────────────────────────
// Characteristic values per EN 338 / EN 14080
struct CharValues {
    double fv_k;    // MPa — characteristic shear strength
    double fc90_k;  // MPa — characteristic compression perpendicular to grain
};

static const std::unordered_map<std::string, CharValues> CHAR_VALUES = {
    {"C14",  {2.0, 2.0}},
    {"C16",  {2.5, 2.2}},
    {"C18",  {3.4, 2.2}},
    {"C20",  {3.4, 2.3}},
    {"C22",  {3.4, 2.4}},
    {"C24",  {4.0, 2.5}},
    {"C27",  {4.0, 2.6}},
    {"C30",  {4.0, 2.7}},
    {"C35",  {4.0, 2.8}},
    {"C40",  {4.0, 2.9}},
    {"GL24h",{3.5, 2.5}},
    {"GL28h",{3.5, 2.5}},
    {"GL32h",{3.5, 2.5}},
    {"GL36h",{4.0, 2.8}},
};

// γM = 1.3 for solid timber, 1.25 for glulam
static double gammaM(const std::string& grade) {
    if (grade.size() >= 2 && grade[0] == 'G' && grade[1] == 'L') return 1.25;
    return 1.30;
}

// kmod table (service class × load duration class)
// EN 1995-1-1 Table 3.1
static double kmod(int sc, const std::string& ldc) {
    // service class 1
    if (sc == 1) {
        if (ldc == "permanent")      return 0.60;
        if (ldc == "long-term")      return 0.70;
        if (ldc == "medium-term")    return 0.80;
        if (ldc == "short-term")     return 0.90;
        if (ldc == "instantaneous")  return 1.10;
    }
    // service class 2
    if (sc == 2) {
        if (ldc == "permanent")      return 0.56;
        if (ldc == "long-term")      return 0.64;
        if (ldc == "medium-term")    return 0.73;
        if (ldc == "short-term")     return 0.82;
        if (ldc == "instantaneous")  return 1.00;
    }
    // service class 3
    {
        if (ldc == "permanent")      return 0.50;
        if (ldc == "long-term")      return 0.55;
        if (ldc == "medium-term")    return 0.65;
        if (ldc == "short-term")     return 0.70;
        if (ldc == "instantaneous")  return 0.90;
    }
    return 0.65; // safe fallback
}

// ─── Main calculation ──────────────────────────────────────────────────────
MortiseTenonResult calculate(const MortiseTenonInput& inp) {
    const auto& g = inp.geometry;
    const auto& m = inp.material;
    const auto& l = inp.loads;

    // --- Geometry validation
    if (g.tenon_width >= g.beam_width)
        throw std::invalid_argument("Tenon width must be less than beam width (field: geometry.tenon_width)");
    if (g.tenon_height >= g.beam_height)
        throw std::invalid_argument("Tenon height must be less than beam height (field: geometry.tenon_height)");
    if (g.tenon_length <= 0 || g.tenon_length >= g.beam_height)
        throw std::invalid_argument("Tenon length must be positive and less than beam height (field: geometry.tenon_length)");
    if (g.beam_width <= 0 || g.beam_height <= 0 || g.tenon_width <= 0 || g.tenon_height <= 0)
        throw std::invalid_argument("All dimensions must be positive");

    // --- Look up material
    auto it = CHAR_VALUES.find(m.grade);
    if (it == CHAR_VALUES.end())
        throw std::invalid_argument("Unknown timber grade: " + m.grade);

    const double fv_k   = it->second.fv_k;
    const double fc90_k = it->second.fc90_k;

    const double km  = kmod(m.service_class, m.load_duration_class);
    const double gM  = gammaM(m.grade);

    // Design values (MPa)
    const double fv_d   = (km / gM) * fv_k;
    const double fc90_d = (km / gM) * fc90_k;

    // --- Areas (mm²)
    // Shear area of tenon = tenon_width × tenon_height / 1.5 (reduced for shear)
    const double A_shear    = (g.tenon_width * g.tenon_height) / 1.5;
    // Bearing area on tenon shoulder = beam_width × tenon_height
    const double A_bearing  = g.beam_width * g.tenon_height;

    // --- Capacities (N → kN)
    const double Fv_Rd  = (fv_d   * A_shear)   / 1000.0; // kN
    const double Fc_Rd  = (fc90_d * A_bearing)  / 1000.0; // kN

    // --- Checks
    CheckResult shearCheck;
    shearCheck.id          = "shear";
    shearCheck.label       = "Shear capacity of tenon";
    shearCheck.Rd          = Fv_Rd;
    shearCheck.Ed          = l.Fv_Ed;
    shearCheck.utilisation = (Fv_Rd > 0) ? (l.Fv_Ed / Fv_Rd) : 1.0;
    shearCheck.unit        = "kN";
    shearCheck.passed      = shearCheck.utilisation <= 1.0;

    CheckResult bearingCheck;
    bearingCheck.id          = "bearing";
    bearingCheck.label       = "Bearing on tenon shoulder";
    bearingCheck.Rd          = Fc_Rd;
    bearingCheck.Ed          = l.Ft_Ed;
    bearingCheck.utilisation = (Fc_Rd > 0) ? (l.Ft_Ed / Fc_Rd) : 1.0;
    bearingCheck.unit        = "kN";
    bearingCheck.passed      = bearingCheck.utilisation <= 1.0;

    // --- Summary
    SummaryResult summary;
    summary.max_utilisation = std::max(shearCheck.utilisation, bearingCheck.utilisation);
    summary.governing_check = (shearCheck.utilisation >= bearingCheck.utilisation)
                              ? "shear" : "bearing";
    summary.passed          = shearCheck.passed && bearingCheck.passed;

    MortiseTenonResult result;
    result.summary = summary;
    result.checks  = {shearCheck, bearingCheck};
    result.intermediates = { m.grade, fv_k, fc90_k, km, gM, fv_d, fc90_d, A_shear, A_bearing };
    return result;
}

} // namespace ec5
