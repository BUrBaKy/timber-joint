cmake_minimum_required(VERSION 3.20)
project(timber_engine VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# ─── Dependencies via FetchContent ────────────────────────────────────────
include(FetchContent)

# nlohmann/json — header-only
FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG        v3.11.3
)
FetchContent_MakeAvailable(nlohmann_json)

# spdlog — optional structured logging
FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG        v1.14.1
)
FetchContent_MakeAvailable(spdlog)

# ─── Sources ───────────────────────────────────────────────────────────────
add_executable(timber-engine
    src/main.cpp
    src/ec5/MortiseTenon.cpp
    src/ipc/MessageDispatcher.cpp
)

target_include_directories(timber-engine
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(timber-engine
    PRIVATE
        nlohmann_json::nlohmann_json
        spdlog::spdlog
)

# Compiler warnings
if (MSVC)
    target_compile_options(timber-engine PRIVATE /W4)
else()
    target_compile_options(timber-engine PRIVATE -Wall -Wextra -Wpedantic)
endif()

# Install target (used by copy-engine.js)
install(TARGETS timber-engine DESTINATION bin)
