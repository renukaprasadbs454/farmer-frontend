@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Farmer Mate - Local Android APK Build Script
echo ===================================================
echo.

:: 1. Check if android folder exists, if not generate it using expo prebuild
if not exist "android" (
    echo [*] Android native project not found. Running expo prebuild...
    call npx expo prebuild --platform android --clean
    if errorlevel 1 (
        echo [!] Failed to run expo prebuild.
        pause
        exit /b 1
    )
) else (
    echo [*] Android project found.
)

:: 2. Navigate to android directory
cd android

:: 3. Check for gradlew.bat
if not exist "gradlew.bat" (
    echo [!] gradlew.bat not found inside android directory.
    cd ..
    pause
    exit /b 1
)

:: 4. Clean and assemble Release APK
echo.
echo [*] Cleaning previous build artifacts...
call gradlew.bat clean

echo.
echo [*] Building Release APK (assembleRelease)...
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo.
    echo [*] Release build failed, attempting assembleDebug instead...
    call gradlew.bat assembleDebug
    if errorlevel 1 (
        echo [!] APK build failed. Please verify Android SDK/JDK installation in Android Studio.
        cd ..
        pause
        exit /b 1
    )
    set "APK_DIR=app\build\outputs\apk\debug"
    set "BUILD_TYPE=Debug"
) else (
    set "APK_DIR=app\build\outputs\apk\release"
    set "BUILD_TYPE=Release"
)

cd ..

echo.
echo ===================================================
echo   Build Successful! [%BUILD_TYPE% APK]
echo ===================================================
echo Output APK location:
echo android\%APK_DIR%
echo.

:: Open output folder in explorer if it exists
if exist "android\%APK_DIR%" (
    explorer "android\%APK_DIR%"
)

pause
