#pragma once
#include <string_view>

namespace ipc {

// Request fields
constexpr std::string_view F_ID      = "id";
constexpr std::string_view F_TYPE    = "type";
constexpr std::string_view F_PAYLOAD = "payload";

// Request types
constexpr std::string_view T_CALCULATE = "calculate";

// Response types
constexpr std::string_view T_RESULT = "result";
constexpr std::string_view T_ERROR  = "error";

// Joint payload
constexpr std::string_view F_JOINT            = "joint";
constexpr std::string_view F_JOINT_TYPE       = "type";
constexpr std::string_view F_GEOMETRY         = "geometry";
constexpr std::string_view F_MATERIAL         = "material";
constexpr std::string_view F_LOADS            = "loads";

// Geometry fields
constexpr std::string_view F_BEAM_WIDTH       = "beam_width";
constexpr std::string_view F_BEAM_HEIGHT      = "beam_height";
constexpr std::string_view F_TENON_WIDTH      = "tenon_width";
constexpr std::string_view F_TENON_HEIGHT     = "tenon_height";
constexpr std::string_view F_TENON_LENGTH     = "tenon_length";
constexpr std::string_view F_MEMBER_LENGTH    = "member_length";

// Material fields
constexpr std::string_view F_GRADE            = "grade";
constexpr std::string_view F_SERVICE_CLASS    = "service_class";
constexpr std::string_view F_LOAD_DURATION    = "load_duration_class";

// Load fields
constexpr std::string_view F_FV_ED            = "Fv_Ed";
constexpr std::string_view F_FT_ED            = "Ft_Ed";

// Result / Summary fields
constexpr std::string_view F_SUMMARY          = "summary";
constexpr std::string_view F_PASSED           = "passed";
constexpr std::string_view F_MAX_UTIL         = "max_utilisation";
constexpr std::string_view F_GOVERNING        = "governing_check";
constexpr std::string_view F_CHECKS           = "checks";

// Check fields
constexpr std::string_view F_CHECK_ID         = "id";
constexpr std::string_view F_CHECK_LABEL      = "label";
constexpr std::string_view F_RD               = "Rd";
constexpr std::string_view F_ED               = "Ed";
constexpr std::string_view F_UTILISATION      = "utilisation";
constexpr std::string_view F_UNIT             = "unit";

// Error fields
constexpr std::string_view F_CODE             = "code";
constexpr std::string_view F_MESSAGE          = "message";
constexpr std::string_view F_FIELD            = "field";

} // namespace ipc
