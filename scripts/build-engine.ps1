$ErrorActionPreference = 'Stop'

$cmake  = "C:\Program Files\CMake\bin\cmake.exe"
$ninja  = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ninja-build.Ninja_Microsoft.Winget.Source_8wekyb3d8bbwe\ninja.exe"
$mingw  = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\BrechtSanders.WinLibs.POSIX.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\mingw64\bin"

# Add mingw to PATH for this session so cmake can find g++
$env:PATH = "$mingw;$env:PATH"

$root   = Split-Path $PSScriptRoot -Parent
$engine = Join-Path $root "engine"
$build  = Join-Path $engine "build\debug"

Write-Host "[build-engine] Verifying tools..."
& $cmake --version | Select-Object -First 1
& $ninja --version | ForEach-Object { "ninja $_" }
& (Join-Path $mingw "g++.exe") --version | Select-Object -First 1

Write-Host ""
Write-Host "[build-engine] Configuring (debug preset)..."
& $cmake -S $engine -B $build -G Ninja `
    -DCMAKE_BUILD_TYPE=Debug `
    "-DCMAKE_C_COMPILER=$(Join-Path $mingw 'gcc.exe')" `
    "-DCMAKE_CXX_COMPILER=$(Join-Path $mingw 'g++.exe')" `
    "-DCMAKE_MAKE_PROGRAM=$ninja"

if ($LASTEXITCODE -ne 0) { throw "CMake configure failed" }

Write-Host ""
Write-Host "[build-engine] Building..."
& $cmake --build $build

if ($LASTEXITCODE -ne 0) { throw "CMake build failed" }

Write-Host ""
Write-Host "[build-engine] Done. Copying binary..."
$binName = "timber-engine.exe"
$src = Join-Path $build $binName
$destDir = Join-Path $root "resources\bin"
$dest = Join-Path $destDir $binName

if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
Copy-Item $src $dest -Force
Write-Host "[build-engine] Copied $src -> $dest"
Write-Host "[build-engine] SUCCESS"
