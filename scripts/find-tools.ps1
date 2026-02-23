$machinePath = [Environment]::GetEnvironmentVariable('PATH','Machine') -split ';'
$userPath = [Environment]::GetEnvironmentVariable('PATH','User') -split ';'
$allPaths = $machinePath + $userPath
Write-Host "=== PATH entries containing build tools ==="
$allPaths | Where-Object { $_ -and ($_ -match 'CMake|Ninja|WinLib|MinGW|GCC|mingw' )} | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "=== Checking known locations ==="
$candidates = @(
    "C:\Program Files\CMake\bin\cmake.exe",
    "C:\Program Files (x86)\CMake\bin\cmake.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Kitware.CMake_Microsoft.Winget.Source_8wekyb3d8bbwe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links"
)
foreach ($c in $candidates) {
    if (Test-Path $c) { Write-Host "FOUND: $c" }
}
Write-Host ""
Write-Host "=== WinGet packages dir ==="
$wg = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages"
if (Test-Path $wg) { Get-ChildItem $wg | Where-Object { $_.Name -match 'CMake|Ninja|WinLib|MinGW' } | Select-Object Name }
