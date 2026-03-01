#pragma once
#include <string>
#include <vector>

namespace ec5 {

struct MortiseTenonGeometry {
    double beam_width    = 100.0; // mm
    double beam_height   = 200.0; // mm
    double tenon_width   = 40.0;  // mm
    double tenon_height  = 100.0; // mm
    double tenon_length  = 80.0;  // mm
    double member_length = 2000.0;// mm
};

struct MaterialConfig {
    std::string grade              = "C24";
    int         service_class      = 2;
    std::string load_duration_class = "medium-term";
};

struct LoadCase {
    double Fv_Ed = 0.0; // kN — design shear
    double Ft_Ed = 0.0; // kN — design axial
};

struct MortiseTenonInput {
    MortiseTenonGeometry geometry;
    MaterialConfig        material;
    LoadCase              loads;
};

struct CheckResult {
    std::string id;
    std::string label;
    double      Rd          = 0.0;
    double      Ed          = 0.0;
    double      utilisation = 0.0;
    std::string unit        = "kN";
    bool        passed      = false;
};

struct SummaryResult {
    bool        passed           = false;
    double      max_utilisation  = 0.0;
    std::string governing_check;
};

struct CalculationIntermediates {
    std::string grade_used;
    double fv_k    = 0.0;  // MPa — characteristic shear strength
    double fc90_k  = 0.0;  // MPa — characteristic compression perp.
    double kmod    = 0.0;  // modification factor
    double gamma_M = 0.0;  // partial material factor
    double fv_d    = 0.0;  // MPa — design shear strength
    double fc90_d  = 0.0;  // MPa — design compression perp.
    double A_shear   = 0.0; // mm²
    double A_bearing = 0.0; // mm²
};

struct MortiseTenonResult {
    SummaryResult             summary;
    std::vector<CheckResult>  checks;
    CalculationIntermediates  intermediates;
};

/**
 * Run EC5 capacity checks for a mortise-tenon joint.
 * Throws std::invalid_argument if geometry is inconsistent.
 */
MortiseTenonResult calculate(const MortiseTenonInput& input);

} // namespace ec5
