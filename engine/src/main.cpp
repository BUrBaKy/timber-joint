#include "ipc/Protocol.h"
#include <iostream>
#include <string>

// Forward declaration
namespace ipc {
    void dispatch(const std::string& line);
}

int main() {
    // Disable sync with C stdio for speed
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(nullptr);

    // Unbuffered stdout so JSON-Lines arrive immediately
    std::cout.setf(std::ios::unitbuf);

    std::string line;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;
        ipc::dispatch(line);
    }

    return 0;
}
