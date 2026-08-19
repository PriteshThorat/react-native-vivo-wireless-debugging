# React Native Wireless Debugging - Troubleshooting Guide

A practical troubleshooting guide for running React Native applications
on a physical Android device using wireless ADB.

> This guide is based on an Android 8.1.0 device.
> Commands and settings may differ on newer Android versions.

## Table of Contents

- [Device Information](#device-information)
- [First-Time Wireless ADB Setup](#1-first-time-wireless-adb-setup)
- [ADB Connection Problems](#2-adb-connection-problems)
- [React Native SDK Problems](#3-react-native-sdk-problems)
- [APK Installation Problems](#4-apk-installation-problems)
- [Metro and Port 8081 Problems](#5-metro-and-port-8081-problems)
- [Quick Troubleshooting Flow](#quick-troubleshooting-flow)
- [Important Commands](#important-commands)

## Device Information

This troubleshooting guide was created and tested using the following setup:

| Component        | Details                 |
| ---------------- | ----------------------- |
| Device           | Android Device          |
| Android Version  | Android 8.1.0           |
| Debugging Method | ADB over Wi-Fi (TCP/IP) |
| ADB Port         | `5555`                  |
| Operating System | Windows 10              |
| Framework        | React Native            |
| Metro            | `0.84.4`                |
| Java             | `17.0.18`               |
| ADB              | `36.0.0-13206524`       |

### Important

This device uses an older Android version and does **not provide the newer Android Wireless Debugging / pairing workflow** found on modern Android versions.

Therefore, this guide uses the traditional ADB TCP/IP method:

```bash
adb tcpip 5555
adb connect PHONE_IP:5555
```

> Note: The phone's IP address may change depending on the Wi-Fi network. Do not assume that `192.168.1.15` will always be the correct IP address.

I recommend keeping the **exact ADB, Java, Metro, and OS versions** because they make the guide more reproducible for someone debugging the same type of setup.

## 1. First-Time Wireless ADB Setup

This method is useful on devices where Android's Wireless Debugging feature is unavailable.

> **Important:** This method is intended for older Android devices that do not have the newer **Wireless Debugging / Pairing** option.

### Step 1 - Enable Developer Options

On your device, open:

**Settings → More settings → Developer options**

Enable:

```text
USB debugging
```

If Developer options is not visible:
**Settings → About phone → Software version / Build number**

Tap the Build number repeatedly until Developer Options are enabled.

### Step 2 - Connect the Phone Using USB

Connect your device to your PC using a USB cable.

Check whether ADB detects the device:

```bash
adb devices
```

Expected:

```text
List of devices attached
b4t543re    device
```

If the device appears as:

```bash
b4t543re    offline
```

ADB is not communicating properly with the phone.

Try:

```bash
adb kill-server
adb start-server
adb devices
```

Then reconnect the USB cable.

On the phone, you may see:

```text
Allow USB debugging?
```

Tap:

**Allow**

You should eventually get:

```bash
b4t543re    device
```

> Do not continue until the device shows `device`, not `offline`.

### Step 3 - Enable ADB TCP/IP Mode

Keep the phone connected through USB and run:

```bash
adb tcpip 5555
```

Expected:

```text
restarting in TCP mode port: 5555
```

This changes ADB from USB communication to TCP/IP communication over the local network.

### Step 4 - Find the Phone's Current IP Address

While USB is still connected, run:

```bash
adb shell ip addr show wlan0
```

Look for a line similar to:

```text
inet 192.168.1.x/24
```

For example:

```text
inet 192.168.1.15/24
```

The `192.168.1.15` address is only an example.

Use your phone's current IP address.

> Important: Do not permanently use `192.168.1.15`. The phone's local IP can change when reconnecting to Wi-Fi.

### Step 5 - Disconnect the USB Cable

Once TCP/IP mode has been enabled and you know the phone's IP address, disconnect the USB cable.

Make sure:

- The PC is connected to Wi-Fi.
- The device is connected to the same local network.
- The phone remains powered on.
- USB debugging remains enabled.

### Step 6 - Connect to the Phone Wirelessly

Run:

```bash
adb connect PHONE_IP:5555
```

For example:

```bash
adb connect 192.168.1.15:5555
```

Expected:

```text
connected to 192.168.1.15:5555
```

### Step 7 - Verify the Wireless Connection

Run:

```bash
adb devices
```

Expected:

```text
List of devices attached
192.168.1.15:5555    device
```

The important part is:

```text
device
```

If you see:

```text
offline
```

the wireless ADB connection is not working correctly.

### Step 8 - Run React Native

Once the device appears as device, go to your React Native project:

```bash
cd C:\MyProject\ReactNativeProject
```

Then run:

```
npx react-native run-android
```

React Native should detect the connected device and install the debug APK.

### Successful Setup

The complete process is:

```text
Enable USB debugging
        ↓
Connect USB
        ↓
adb devices
        ↓
device
        ↓
adb tcpip 5555
        ↓
Find phone IP
        ↓
Disconnect USB
        ↓
adb connect PHONE_IP:5555
        ↓
adb devices
        ↓
PHONE_IP:5555    device
        ↓
npx react-native run-android
```

### Commands to Remember

```text
adb devices
adb tcpip 5555
adb shell ip addr show wlan0
adb connect PHONE_IP:5555
adb devices
npx react-native run-android
```

> Tip: You normally only need the USB connection for the initial adb tcpip 5555 setup. After that, you can use ADB wirelessly as long as the phone and PC can communicate over the same network.

## 2. ADB Connection Problems

This section covers common problems when connecting the device to the PC using ADB.

---

### Problem 1 — `adb connect` gives Error 10060

Example:

```text
cannot connect to 192.168.1.15:5555:
A connection attempt failed because the connected party
did not properly respond after a period of time.
```

This usually means that the PC cannot reach the phone at the specified IP address and port.

**Check 1 — Make sure both devices are on the same network**

The PC and phone should be connected to the same local network.

For example:

```text
PC     → Wi-Fi Router
Phone  → Wi-Fi Router
```

They should normally have addresses in the same subnet, such as:

```text
PC:    192.168.1.x
Phone: 192.168.1.x
```

> Note: The exact IP addresses do not have to be identical. Only the network/subnet needs to allow communication between them.

**Check 2 - Find the phone's current IP**

Connect the phone through USB and run:

```bash
adb shell ip addr show wlan0
```

Look for:

```text
inet 192.168.1.x/24
```

Then use that IP:

```bash
adb connect PHONE_IP:5555
```

For example:

```bash
adb connect 192.168.1.15:5555
```

> Do not assume that `192.168.1.15` is always the phone's IP. The address can change when the phone reconnects to Wi-Fi.

**Check 3 — Restart ADB TCP/IP mode**

With USB connected:

```bash
adb tcpip 5555
```

Expected:

```text
restarting in TCP mode port: 5555
```

Then disconnect USB and try:

```bash
adb connect PHONE_IP:5555
```

---

### Problem 2 - `adb devices` shows `offline`

Example:

```text
List of devices attached
b4t543re    offline
```

This means ADB can see the device but cannot communicate with it correctly.

Try restarting the ADB server:

```bash
adb kill-server
adb start-server
adb devices
```

If it still shows `offline`:

1. Disconnect the USB cable.
2. Turn USB debugging off.
3. Turn USB debugging back on.
4. Reconnect the USB cable.
5. Accept the Allow USB debugging? prompt on the phone.
6. Run:

```bash
adb devices
```

Expected:

```text
List of devices attached
b4t543re    device
```

> Do not continue to wireless setup until the USB device shows `device` instead of `offline`.

---

### Problem 3 - `adb devices` shows no device

Example:

```text
List of devices attached
```

with nothing underneath it.

Check the following:

- USB cable is properly connected.
- USB debugging is enabled.
- Phone is unlocked.
- USB debugging authorization was accepted.
- Try another USB port.
- Try another USB cable.
- Restart the ADB server.

Run:

```bash
adb kill-server
adb start-server
adb devices
```

If the phone asks:

```text
Allow USB debugging?
```

tap:

**Allow**

---

### Problem 4 - `adb` says `more than one device/emulator`

Example:

```text
adb.exe: error: more than one device/emulator
```

This can happen when ADB detects multiple devices, emulators, or stale ADB connections.

First check:

```text
adb devices -l
```

Example:

```text
List of devices attached
192.168.1.15:5555    device
emulator-5554        device
```

If multiple devices are listed, specify the target device:

```bash
adb -s DEVICE_SERIAL shell
```

For example:

```bash
adb -s 192.168.1.15:5555 shell
```

For React Native, you can also specify the device when supported by the React Native CLI.

> Important: If `adb devices -l` shows only one device but ADB still reports `more than one device/emulator`, this may indicate an ADB-server or toolchain issue rather than an actual second device. Restarting the ADB server is a good first step:

```bash
adb kill-server
adb start-server
adb devices -l
```

### Problem 5 - Multiple `adb.exe` installations

Check which ADB executables are available:

```bash
where adb
```

You may see something like:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe
C:\scrcpy-win64-v3.3.3\adb.exe
```

Multiple copies of ADB can sometimes make troubleshooting confusing.

Check the version of the Android SDK ADB:

```text
"C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe" version
```

Example:

```text
Android Debug Bridge version 1.0.41
Version 36.0.0-13206524
```

If you have multiple ADB installations, preferably use the ADB from:

```text
Android SDK → platform-tools
```

You can also check which ADB server is currently running:

```bash
tasklist | findstr /i "adb"
```

If necessary, stop and restart it:

```bash
adb kill-server
adb start-server
```

---

### Problem 6 - `adb reverse` gives `more than one device/emulator`

React Native may show:

```text
adb.exe: error: more than one device/emulator
```

when trying:

```bash
adb reverse tcp:8081 tcp:8081
```

If multiple devices are connected, specify the device:

```bash
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

For example:

```bash
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```

Then verify:

```bash
adb -s 192.168.1.15:5555 reverse --list
```

Expected:

```bash
192.168.1.15:5555 tcp:8081 tcp:8081
```

> Note: `adb reverse` is normally useful when the device is connected through ADB and the Android device needs to access a service running on the PC.

---

### Problem 7 - ADB connects but React Native says "No apps connected"

You may see:

```text
INFO  Dev server ready.
```

followed by:

```text
warn No apps connected.
```

This does not necessarily mean ADB is broken.

First check:

```bash
adb devices
```

You need to see:

```text
PHONE_IP:5555    device
```

Then make sure the React Native application has actually been installed and launched.

If the APK was successfully installed but Metro cannot connect, continue to the **Metro / Port 8081 troubleshooting section**.

---

### Problem 8 - ADB connection works but APK installation fails

If you see:

```text
Installing APK 'app-debug.apk'
```

then ADB has already detected the phone.

At this point, don't immediately troubleshoot the Wi-Fi connection.

Instead, read the actual installation error.

For example:

```text
InstallException: EOF
```

or:

```text
Requested internal only, but not enough space
```

These are installation/device problems and should be investigated separately.

---

### Quick ADB Recovery

If ADB starts behaving strangely, try this sequence:

```bash
adb kill-server
adb start-server
adb devices
```

If using USB:

```bash
adb tcpip 5555
```

Find the phone's IP:

```bash
adb shell ip addr show wlan0
```

Disconnect USB and reconnect:

```bash
adb connect PHONE_IP:5555
```

Finally verify:

```bash
adb devices
```

Expected:

```text
List of devices attached
PHONE_IP:5555    device
```

---

### ADB Connection Checklist

Before moving to React Native:

- Developer Options enabled
- USB debugging enabled
- USB connection works
- `adb devices` shows `device`
- `adb tcpip 5555` succeeds
- Phone and PC are on the same network
- Current phone IP was checked
- `adb connect PHONE_IP:5555` succeeds
- `adb devices` shows `PHONE_IP:5555 device`
- No unexpected extra devices/emulators are connected

Once all of these are working, ADB wireless debugging is ready for React Native.

## 3. React Native SDK Problems

This section covers common Android SDK-related problems that can prevent a React Native project from building or installing.

---

### Problem 1 — `SDK location not found`

Example:

```text
SDK location not found. Define a valid SDK location
with an ANDROID_HOME environment variable or by setting
the sdk.dir path in your project's local properties file.
```

This means Gradle cannot find the Android SDK.

#### Check the Android SDK location

On a typical Windows installation, the Android SDK is located at:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk
```

You can verify it from:

**Android Studio → Settings → Languages & Frameworks → Android SDK**

---

### Solution A — Create `local.properties`

Inside your React Native project, open:

```text
android/local.properties
```

If the file does not exist, create it.

Add:

```properties
sdk.dir=C:/Users/Admin/AppData/Local/Android/Sdk
```

> **Important:** On Windows, using `/` instead of `\` avoids many path-escaping problems.

Then clean the project:

```cmd
cd android
gradlew clean
cd ..
```

Run React Native again:

```bash
npx react-native run-android
```

---

### Problem 2 — Incorrect Windows path in `local.properties`

A common mistake is:

```properties
sdk.dir=C:\Users\<USERNAME>\AppData\Local\Android\Sdk
```

This can cause errors such as:

```text
The filename, directory name, or volume label syntax is incorrect.
```

Use:

```properties
sdk.dir=C:/Users/Admin/AppData/Local/Android/Sdk
```

instead.

Alternatively, escape the backslashes:

```properties
sdk.dir=C:\\Users\\Admin\\AppData\\Local\\Android\\Sdk
```

The first format is generally simpler:

```properties
sdk.dir=C:/Users/Admin/AppData/Local/Android/Sdk
```

---

### Problem 3 — Android SDK components are missing

Even if Gradle can find the SDK, the project may fail because required SDK components are not installed.

For example:

```text
Failed to find Build Tools revision ...
```

or:

```text
Failed to install the following Android SDK packages
```

Open:

**Android Studio → SDK Manager**

Check that the required components are installed.

Common components include:

- Android SDK Platform
- Android SDK Build-Tools
- Android SDK Platform-Tools
- Android SDK Command-line Tools
- Android SDK Tools required by the project

> The exact Android API level and Build Tools version required depends on your React Native project's Gradle configuration.

After installing the required components, try:

```bash
npx react-native run-android
```

---

### Problem 4 — Check whether ADB is installed correctly

ADB is included in Android SDK Platform-Tools.

Run:

```cmd
adb version
```

Example:

```text
Android Debug Bridge version 1.0.41
Version 36.0.0-13206524
```

Check where Windows is finding ADB:

```cmd
where adb
```

Example:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

If `adb` is not recognized, add the Android SDK `platform-tools` directory to your Windows `PATH`.

Typical path:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools
```

After changing `PATH`, open a new terminal and run:

```cmd
adb version
```

---

### Problem 5 — Check the Java version

React Native's Android build system also depends on Java.

Check the installed version:

```cmd
java -version
```

For the environment used while creating this guide:

```text
java version "17.0.18"
```

You can also check:

```cmd
echo %JAVA_HOME%
```

If Gradle reports Java-related errors, verify that `JAVA_HOME` points to the intended JDK installation.

> **Important:** Do not blindly change Java versions just because a different version is mentioned online. Use the Java version supported by your specific React Native/Android Gradle Plugin setup.

---

### Problem 6 — Clean the Android build

If the SDK configuration has been corrected but Gradle still behaves as if the old configuration is being used, clean the Android project:

```cmd
cd android
gradlew clean
cd ..
```

Then run:

```bash
npx react-native run-android
```

If you use the Gradle wrapper directly from the Android directory, the command is:

```cmd
gradlew clean
```

---

### Problem 7 — `react-native doctor`

React Native provides a diagnostic command that can detect common development-environment problems.

Run:

```bash
npx react-native doctor
```

Depending on the project/package-manager setup, you may also use:

```bash
npx react-native doctor
```

The doctor command can help identify problems with:

- Android SDK
- Android SDK tools
- JDK
- Android Studio
- Environment variables
- Connected Android devices

Follow the specific recommendations reported by the command rather than changing unrelated configuration.

---

## Verify the Complete Android Environment

Before troubleshooting the React Native application itself, verify:

### 1. Java

```cmd
java -version
```

### 2. ADB

```cmd
adb version
```

### 3. Android SDK

Check:

```text
android/local.properties
```

and make sure it contains the correct SDK path:

```properties
sdk.dir=C:/Users/Admin/AppData/Local/Android/Sdk
```

### 4. Connected device

```cmd
adb devices
```

Expected:

```text
List of devices attached
PHONE_IP:5555    device
```

### 5. React Native environment

```bash
npx react-native doctor
```

---

## Recommended Recovery Sequence

If the project suddenly starts reporting SDK-related errors:

```cmd
cd android
gradlew clean
cd ..
```

Then verify:

```cmd
java -version
adb version
adb devices
```

Check:

```text
android/local.properties
```

Make sure the SDK path is correct:

```properties
sdk.dir=C:/Users/Admin/AppData/Local/Android/Sdk
```

Then run:

```bash
npx react-native run-android
```

---

## Important: Don't Confuse SDK Errors with ADB Errors

These are different problems.

### SDK/build problem

Examples:

```text
SDK location not found
```

```text
Failed to find Build Tools
```

```text
Could not determine the dependencies
```

Investigate:

**Android SDK / Gradle / Java / project configuration**

### ADB/device problem

Examples:

```text
offline
```

```text
cannot connect to PHONE_IP:5555
```

```text
more than one device/emulator
```

Investigate:

**ADB / USB / Wi-Fi / connected devices**

### APK installation problem

Examples:

```text
InstallException: EOF
```

```text
Requested internal only, but not enough space
```

Investigate:

**Phone storage / APK installation / device communication**

> **Most important rule:** If Gradle successfully builds the APK and reaches `installDebug`, the Android SDK/build process has already progressed far enough. Read the installation error before changing SDK configuration.

## 4. APK Installation Problems

This section covers problems that occur **after Gradle successfully builds the APK**, but React Native fails while installing it on the Android device.

---

### Problem 1 — `InstallException: EOF`

Example:

```text
> Task :app:installDebug FAILED

[Device]: Error during Sync: EOF

com.android.ddmlib.InstallException: EOF

Caused by: java.io.EOFException: EOF
at com.android.ddmlib.SyncService.doPushFile(...)
```

This means the APK was built successfully, but ADB failed while transferring/installing the APK on the device.

The important part is:

```text
Error during Sync: EOF
```

and:

```text
SyncService.doPushFile
```

This is usually an **ADB/device communication or device-side installation problem**, not a React Native JavaScript problem.

---

### Step 1 — Check whether the device is still connected

Run:

```cmd
adb devices
```

Expected:

```text
List of devices attached
192.168.x.x:5555    device
```

If it shows:

```text
offline
```

restart ADB:

```cmd
adb kill-server
adb start-server
adb devices
```

If using wireless ADB, reconnect:

```cmd
adb connect PHONE_IP:5555
```

---

### Step 2 — Try installing the APK manually

First make sure the APK exists:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Then install it manually:

```cmd
adb install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

If it succeeds:

```text
Performing Streamed Install
Success
```

then:

- APK was built correctly
- Android SDK is working
- ADB can communicate with the phone
- APK installation itself works

This is a very useful diagnostic test.

---

### Problem 2 — `Requested internal only, but not enough space`

Example:

```text
Requested internal only, but not enough space
```

This means the phone does not have enough **internal storage** to install the APK.

It is generally **not**:

- React Native code problem
- Gradle problem
- Android SDK problem
- Metro problem
- Wi-Fi problem

### Check phone storage

You can use:

```cmd
adb shell df -h /data
```

If the available space is very low, free storage on the phone.

Remove or move:

- Large videos
- Downloads
- WhatsApp media
- Unused applications
- Old APK files
- Other large files

Then try:

```bash
npx react-native run-android
```

---

### Problem 3 — Installation works manually but `run-android` fails

Sometimes this works:

```cmd
adb install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

but:

```bash
npx react-native run-android
```

fails during installation.

If manual installation succeeds, check the ADB connection used by React Native/Gradle.

Run:

```cmd
adb devices -l
```

Then verify the exact device serial.

Example:

```text
192.168.1.15:5555    device
```

You can also start the application manually:

```cmd
adb -s 192.168.1.15:5555 shell am start -n com.yourapp/.MainActivity
```

If the app opens, the APK installation is working.

---

### Problem 4 — `more than one device/emulator`

Example:

```text
adb.exe: error: more than one device/emulator
```

This happens when ADB sees multiple devices/emulators.

Check:

```cmd
adb devices -l
```

Example:

```text
List of devices attached
emulator-5554          device
192.168.1.15:5555      device
```

Specify the device explicitly:

```cmd
adb -s 192.168.1.15:5555 install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

For other ADB commands:

```cmd
adb -s 192.168.1.15:5555 shell
```

```cmd
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```

### Important

If `adb devices -l` shows only one device but ADB still reports:

```text
more than one device/emulator
```

do **not** immediately assume that there are actually two phones.

Check for multiple ADB installations/processes.

```cmd
where adb
```

For example:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe
C:\scrcpy-win64-v3.3.3\adb.exe
```

Also check:

```cmd
tasklist | findstr /i "adb scrcpy"
```

If necessary, close applications using ADB, such as:

- Android Studio
- scrcpy
- VS Code terminals running ADB commands
- Other Android debugging tools

Then restart ADB:

```cmd
adb kill-server
adb start-server
adb devices -l
```

---

### Problem 5 — `adb reverse` fails

React Native normally uses port `8081` for Metro.

For a USB-connected device, you can use:

```cmd
adb reverse tcp:8081 tcp:8081
```

Then the phone can access Metro through the reverse ADB connection.

For a wireless device:

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

Example:

```cmd
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```

If you receive:

```text
adb.exe: error: more than one device/emulator
```

check:

```cmd
adb devices -l
```

and investigate multiple ADB connections/processes.

---

### Problem 6 — App installs but shows `Unable to load script`

Example:

```text
Unable to load script.

If you're using USB on a physical device, make sure you
also run this command:

adb reverse tcp:8081 tcp:8081
```

This means the APK was installed and launched, but the React Native application cannot reach the **Metro development server**.

This is different from an APK installation failure.

First check that Metro is running:

```text
Welcome to Metro v0.84.4

INFO  Dev server ready.
```

Then check:

```cmd
adb devices
```

If the device is connected, try:

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

---

### Problem 7 — Metro says `No apps connected`

Example:

```text
INFO  Reloading connected app(s)...

warn No apps connected.
```

This means Metro is running, but it does not currently detect a React Native app connection.

First check:

```cmd
adb devices
```

The phone should show:

```text
PHONE_IP:5555    device
```

Then make sure the application is actually running on the phone.

If necessary, launch it manually:

```cmd
adb -s PHONE_IP:5555 shell am start -n com.yourapp/.MainActivity
```

---

### Problem 8 — Browser works but React Native still cannot load Metro

If opening:

```text
http://PC_IP:8081
```

on the phone shows the Metro page, that proves the phone can reach the computer over the network.

For example, if the PC's Wi-Fi IPv4 address is:

```text
192.168.1.14
```

the phone can try:

```text
http://192.168.1.14:8081
```

If this opens successfully:

Phone can reach the PC
Port `8081` is reachable
Metro is running

If React Native still shows:

```text
Unable to load script
```

then investigate the React Native/ADB connection configuration rather than assuming the router is blocking Metro.

---

## Problem 9 — Wi-Fi/router prevents Metro access

If the phone **cannot open**:

```text
http://PC_IP:8081
```

check:

### A. Same network

The phone and PC should normally be connected to the same LAN.

Example:

```text
PC:    192.168.1.14
Phone: 192.168.1.15
```

Both are on:

```text
192.168.1.x
```

with:

```text
Subnet mask: 255.255.255.0
```

### B. Windows Firewall

Windows Firewall can prevent other devices from accessing Metro.

Make sure Node.js/Metro is allowed through the Windows Firewall, or allow the required connection when Windows asks.

### C. Router client isolation

Some routers have features such as:

- AP Isolation
- Client Isolation
- Wireless Isolation

These can prevent devices connected to the same Wi-Fi from communicating with each other.

If the phone and PC cannot communicate directly, check the router settings.

---

## Problem 10 — Manually install APK to separate the problems

This is one of the most useful troubleshooting techniques.

Build the APK:

```bash
npx react-native run-android
```

If the command fails specifically at:

```text
:app:installDebug
```

try installing the generated APK manually:

```cmd
adb install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

### If manual installation succeeds

The APK itself is valid and installation works.

Focus on:

- React Native CLI
- Gradle install task
- ADB device selection
- ADB connection
- `adb reverse`

### If manual installation fails

Read the exact ADB error.

For example:

```text
not enough space
```

→ Free phone storage.

```text
device offline
```

→ Fix ADB connection.

```text
INSTALL_FAILED_...
```

→ Investigate the specific Android package/install error.

---

# APK Installation Troubleshooting Flow

```text
                 START
                   ↓
          Gradle builds APK?
                   ↓
                 YES
                   ↓
          :app:installDebug
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
   Installation          Installation
     succeeds               fails
        ↓                     ↓
    App starts?          Read exact error
        ↓                     ↓
       YES           ┌───────┼────────┐
        ↓            ↓       ↓        ↓
  Metro problem    EOF   No space   Offline
        ↓            ↓       ↓        ↓
   Check Metro    ADB     Free      Fix ADB
   / port 8081   issue   storage   connection
```

---

# Important Diagnostic Rule

Do not treat every `run-android` failure as a build failure.

There are three separate stages:

```text
React Native
     ↓
Gradle builds APK
     ↓
APK installation
     ↓
App launches
     ↓
Metro connection
```

For example:

```text
BUILD SUCCESSFUL
```

followed by:

```text
Unable to install app
```

means the **build succeeded** but installation failed.

Likewise:

```text
BUILD SUCCESSFUL
```

and:

```text
App launches
```

followed by:

```text
Unable to load script
```

means the APK installation succeeded and the problem is now **Metro connectivity**, not APK installation.

---

## Quick Commands

### Check connected devices

```cmd
adb devices -l
```

### Restart ADB

```cmd
adb kill-server
adb start-server
```

### Install APK manually

```cmd
adb install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

### Check phone storage

```cmd
adb shell df -h /data
```

### Set up Metro reverse

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

### Start the application manually

```cmd
adb -s PHONE_IP:5555 shell am start -n com.yourapp/.MainActivity
```

---

> **Most important rule:** Always read the **actual error at the bottom of the installation step**. Warnings such as Gradle deprecation messages are usually unrelated to an APK installation failure. In the previous troubleshooting case, the real installation problem was **insufficient internal storage on the device**, not Gradle or React Native.

## 5. Metro and Port 8081 Problems

React Native uses **Metro** as its JavaScript bundler during development.

By default, Metro runs on:

```text
http://localhost:8081
```

When using a physical Android device, the phone must be able to communicate with Metro on the computer.

---

### Problem 1 — Metro is not running

Example:

```text
Unable to load script.

Make sure Metro is running or that your device can
connect to the development server.
```

Start Metro manually:

```bash
npx react-native start
```

You should see something similar to:

```text
Welcome to Metro v0.84.4

INFO  Dev server ready.
```

Keep this terminal open.

Then run the application from another terminal:

```bash
npx react-native run-android
```

---

### Problem 2 — Metro is running but says `No apps connected`

Example:

```text
INFO  Reloading connected app(s)...

warn No apps connected.
Sending "reload" to all React Native apps failed.
```

This does **not necessarily mean Metro is broken**.

It means Metro currently does not have a React Native application connected to it.

First check:

```cmd
adb devices
```

Expected:

```text
List of devices attached
192.168.1.15:5555    device
```

Then make sure the React Native app is actually running on the phone.

---

### Problem 3 — `Unable to load script`

Example:

```text
Unable to load script.

If you're using USB on a physical device, make sure you
also run this command:

adb reverse tcp:8081 tcp:8081
```

This means the application cannot reach Metro.

There are two common ways to solve this:

1. **ADB reverse**
2. **Connect directly to the PC's IP address**

---

# Method A — ADB Reverse

For a USB-connected device:

```cmd
adb reverse tcp:8081 tcp:8081
```

For a specific device:

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

Example:

```cmd
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```

Check the reverse configuration:

```cmd
adb -s 192.168.1.15:5555 reverse --list
```

Expected output should contain:

```text
tcp:8081 tcp:8081
```

> If `adb reverse` works, the phone does not need to access the PC's `192.168.x.x:8081` address directly. ADB forwards the phone's port 8081 to the computer's port 8081.

---

# Method B — Connect Directly Using the PC IP

This is particularly useful when using **wireless ADB**.

Find the PC's IPv4 address:

```cmd
ipconfig
```

Example:

```text
Wireless LAN adapter Wi-Fi:

   IPv4 Address. . . . . . . : 192.168.1.14
   Subnet Mask . . . . . . . : 255.255.255.0
```

In this example:

```text
PC IP = 192.168.1.14
```

Do **not** use the phone's IP.

For example:

```text
Phone = 192.168.1.15
PC    = 192.168.1.14
```

The phone should connect to:

```text
192.168.1.14:8081
```

---

## Problem 4 — Which IP should be used?

This is an easy mistake to make.

Suppose:

```text
Phone:
192.168.1.15
```

and:

```text
PC:
192.168.1.14
```

Then:

### ADB connection

You connect **to the phone's IP**:

```cmd
adb connect 192.168.1.15:5555
```

### Metro connection

The phone connects **to the PC's IP**:

```text
192.168.1.14:8081
```

So remember:

```text
ADB:
PC → Phone
     ↓
192.168.1.15:5555

Metro:
Phone → PC
     ↓
192.168.1.14:8081
```

---

# Problem 5 — Test whether the phone can reach Metro

First make sure Metro is running:

```bash
npx react-native start
```

Then find the PC's Wi-Fi IPv4 address:

```cmd
ipconfig
```

For example:

```text
192.168.1.14
```

On your device, open the browser and enter:

```text
http://192.168.1.14:8081
```

If Metro is accessible, you should see a Metro-related response/page instead of:

```text
This site can't be reached
```

### If the page opens

This proves:

- Phone can reach the PC
- PC is reachable over the local network
- Metro is running
- Port 8081 is reachable

If React Native still says `Unable to load script`, investigate the React Native server configuration or ADB connection.

### If the page does not open

Investigate:

- Windows Firewall
- Router restrictions
- Wi-Fi isolation
- Whether Metro is actually running
- Whether the PC and phone are on the same network
- Whether the PC IP address is correct

---

# Problem 6 — Windows Firewall blocks port 8081

If the phone cannot open:

```text
http://PC_IP:8081
```

Windows Firewall may be blocking incoming connections.

Check whether Windows displayed a firewall prompt when Metro/Node.js was first started.

If necessary, allow Node.js through Windows Defender Firewall for the appropriate network profile.

You can also check whether something is listening on port 8081:

```cmd
netstat -ano | findstr :8081
```

Example:

```text
TCP    0.0.0.0:8081    0.0.0.0:0    LISTENING    12345
```

`LISTENING` indicates that a process is listening on port 8081.

---

# Problem 7 — Port 8081 is already in use

Example:

```text
Error: listen EADDRINUSE: address already in use :::8081
```

This means another process is already using port 8081.

Find the process:

```cmd
netstat -ano | findstr :8081
```

Example:

```text
TCP    0.0.0.0:8081    0.0.0.0:0    LISTENING    12345
```

The last number is the PID:

```text
12345
```

Find the process:

```cmd
tasklist | findstr 12345
```

If it is an old Metro/Node process that you no longer need, you can terminate it:

```cmd
taskkill /PID 12345 /F
```

Then start Metro again:

```bash
npx react-native start
```

> Do not terminate a process unless you know what it is.

---

# Problem 8 — Use another Metro port

If port 8081 cannot be used, Metro can run on another port.

For example:

```bash
npx react-native start --port 8082
```

Now Metro runs on:

```text
http://localhost:8082
```

The application must also be configured to use the same port.

For example, with ADB reverse:

```cmd
adb reverse tcp:8082 tcp:8082
```

Then run the React Native application using the corresponding Metro port.

> Changing the Metro port is usually unnecessary unless port 8081 is occupied or there is another specific reason to use a different port.

---

# Problem 9 — `adb reverse` says `more than one device/emulator`

Example:

```text
adb.exe: error: more than one device/emulator
```

First check:

```cmd
adb devices -l
```

If multiple devices are listed:

```text
List of devices attached
emulator-5554          device
192.168.1.15:5555      device
```

specify the phone:

```cmd
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```

If only one device appears but ADB still reports:

```text
more than one device/emulator
```

check for multiple ADB installations:

```cmd
where adb
```

Example:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe
C:\scrcpy-win64-v3.3.3\adb.exe
```

Also check:

```cmd
tasklist | findstr /i "adb scrcpy"
```

If necessary:

```cmd
adb kill-server
adb start-server
adb devices -l
```

---

# Problem 10 — `adb reverse` succeeds but Metro still doesn't work

If:

```cmd
adb reverse tcp:8081 tcp:8081
```

succeeds, check that Metro is running:

```bash
npx react-native start
```

Then restart the application.

You can also verify the reverse rule:

```cmd
adb reverse --list
```

Expected:

```text
tcp:8081 tcp:8081
```

If the reverse rule exists but the app still cannot load JavaScript, investigate whether:

- Metro is running
- The app is a debug build
- The correct Metro port is being used
- A stale application instance is running
- ADB is connected to the correct device

---

# Problem 11 — Phone browser says `This site can't be reached`

If the phone shows:

```text
This site can't be reached
```

when opening:

```text
http://PC_IP:8081
```

check the following in order.

### 1. Check Metro

```bash
npx react-native start
```

### 2. Check PC IP

```cmd
ipconfig
```

Use the **Wi-Fi IPv4 address of the PC**.

Example:

```text
PC = 192.168.1.14
```

### 3. Check phone IP

Your phone's IP should normally be on the same local network.

Example:

```text
PC    = 192.168.1.14
Phone = 192.168.1.15
```

### 4. Check port 8081 on the PC

```cmd
netstat -ano | findstr :8081
```

### 5. Check Windows Firewall

Make sure incoming connections to Metro/Node.js are not being blocked.

### 6. Check router isolation

Some routers prevent Wi-Fi clients from communicating with each other.

Look for settings such as:

```text
AP Isolation
Client Isolation
Wireless Isolation
```

---

# Problem 12 — Airtel router/network restrictions

If both devices are connected to the same Airtel router but:

```text
Phone → http://PC_IP:8081
```

does not work, the router may be preventing communication between wireless clients.

Before changing router settings, test the simpler possibilities:

```text
Metro running?
        ↓
Correct PC IP?
        ↓
Port 8081 listening?
        ↓
Windows Firewall?
        ↓
Same Wi-Fi network?
        ↓
Router client isolation?
```

If the browser can open Metro successfully, the router is **not blocking that connection**.

---

# Problem 13 — Metro starts but the app still uses an old server

If Metro is running on a different port or the app has stale configuration, restart Metro and the application.

Stop Metro:

```text
Ctrl + C
```

Start it again:

```bash
npx react-native start
```

Then restart the app:

```bash
npx react-native run-android
```

For wireless ADB, verify the device first:

```cmd
adb devices
```

---

# Quick Metro Troubleshooting Flow

```text
                START
                  ↓
           Is Metro running?
             ↓          ↓
            NO          YES
             ↓           ↓
     npx react-native   Check device
          start          connection
                          ↓
                    adb devices
                          ↓
                  Device = device?
                    ↓          ↓
                   NO         YES
                    ↓          ↓
              Fix ADB       App launches?
                               ↓
                         ┌─────┴─────┐
                         ↓           ↓
                        NO          YES
                         ↓           ↓
                   Check APK       Unable to
                   installation    load script
                                     ↓
                              Check port 8081
                                     ↓
                           ┌─────────┴─────────┐
                           ↓                   ↓
                     adb reverse          Direct Wi-Fi
                           ↓                   ↓
                    tcp:8081              PC_IP:8081
                           ↓                   ↓
                       Works?             Browser test
                           ↓                   ↓
                          YES                 FAIL
                           ↓                   ↓
                       Metro OK       Firewall/router/
                                      network problem
```

---

# Most Important IP Rule

For wireless React Native development, there are **two different IP addresses** to remember.

Suppose:

```text
PC Wi-Fi IPv4:
192.168.1.14

Device Wi-Fi IPv4:
192.168.1.15
```

### ADB

Use the **phone IP**:

```cmd
adb connect 192.168.1.15:5555
```

### Metro direct connection

Use the **PC IP**:

```text
http://192.168.1.14:8081
```

Never confuse:

```text
Phone IP  → ADB
PC IP     → Metro
```

---

## Important Diagnostic Rule

Separate these three problems:

### ADB problem

```text
adb connect
adb devices
adb reverse
```

### APK installation problem

```text
adb install
:app:installDebug
InstallException
```

### Metro problem

```text
Unable to load script
No apps connected
Port 8081
Metro
```

Fix the problem belonging to the stage that actually failed.

---

## Quick Commands

### Start Metro

```bash
npx react-native start
```

### Check port 8081

```cmd
netstat -ano | findstr :8081
```

### Check ADB devices

```cmd
adb devices -l
```

### ADB reverse

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

### Check reverse rules

```cmd
adb -s PHONE_IP:5555 reverse --list
```

### Find PC IP

```cmd
ipconfig
```

### Test Metro from phone

Open:

```text
http://PC_IP:8081
```

### Run React Native

```bash
npx react-native run-android
```

> **Most important rule:** If the APK installs and launches but shows **`Unable to load script`**, stop troubleshooting APK installation. The next thing to investigate is **Metro and port 8081 connectivity**.

# Quick Troubleshooting Flow

Use this flow when React Native wireless debugging stops working.

```text
                         START
                           ↓
                    adb devices -l
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
          No device                  device
              ↓                         ↓
       Check ADB/USB/Wi-Fi        Run React Native
              ↓                         ↓
       adb connect IP:5555          run-android
              ↓                         ↓
           device              ┌───────┴────────┐
                                ↓                ↓
                          Build error       Build successful
                                ↓                ↓
                         SDK/Gradle/Java    APK installation
                                                 ↓
                                        ┌────────┴────────┐
                                        ↓                 ↓
                                   Installation       Installation
                                     fails             succeeds
                                        ↓                 ↓
                                  Read exact          App launches
                                     error                 ↓
                                        ↓           ┌──────┴──────┐
                             ┌──────────┼──────────┐ ↓             ↓
                             ↓          ↓          ↓ Works       Doesn't
                           EOF     No space   offline             ↓
                             ↓          ↓          ↓          Metro problem
                           ADB      Free phone   Fix ADB          ↓
                          problem    storage     connection   Metro running?
                                                               ↓
                                                         ┌─────┴─────┐
                                                         ↓           ↓
                                                        NO          YES
                                                         ↓           ↓
                                                 npx react-    Check port
                                                 native start      8081
                                                                    ↓
                                                         ┌──────────┴──────────┐
                                                         ↓                     ↓
                                                     adb reverse          Direct Wi-Fi
                                                         ↓                     ↓
                                                tcp:8081 tcp:8081       PC_IP:8081
                                                         ↓                     ↓
                                                       Works?              Browser test
                                                         ↓                     ↓
                                                    ┌────┴────┐          ┌─────┴─────┐
                                                    ↓         ↓          ↓           ↓
                                                   YES       NO         Works       Fails
                                                    ↓         ↓          ↓           ↓
                                                 Metro OK   ADB/       Network     Firewall/
                                                            config     OK          router/
                                                                       ↓           isolation
                                                                    Check RN      Check
                                                                    config       network
```

---

## 1. Check the Device

```cmd
adb devices -l
```

Expected:

```text
192.168.1.15:5555    device
```

### If `offline`

```cmd
adb kill-server
adb start-server
adb devices
```

If necessary, reconnect the phone:

```cmd
adb connect PHONE_IP:5555
```

### If no device appears

Check:

- Phone is connected to the same Wi-Fi.
- USB debugging is enabled when using USB.
- Phone's IP address is correct.
- ADB TCP mode is enabled.

```cmd
adb tcpip 5555
adb connect PHONE_IP:5555
```

---

# 2. Run React Native

```bash
npx react-native run-android
```

Now identify **where the command fails**.

---

## 3. Build Fails

If Gradle fails before installing the APK, investigate:

- Android SDK
- `android/local.properties`
- Java/JDK
- Gradle
- Build Tools
- Project dependencies

For example:

```text
SDK location not found
```

→ Check Android SDK configuration.

Then:

```cmd
cd android
gradlew clean
cd ..
```

Try again:

```bash
npx react-native run-android
```

---

# 4. Build Successful → Installation Fails

If you see:

```text
BUILD SUCCESSFUL
```

but:

```text
:app:installDebug FAILED
```

the build itself succeeded.

Read the **actual installation error**.

### `Requested internal only, but not enough space`

→ Free storage on the device.

```cmd
adb shell df -h /data
```

### `InstallException: EOF`

→ Investigate ADB/device communication.

Try:

```cmd
adb devices
```

Then manually install the APK:

```cmd
adb install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

If manual installation succeeds, the APK is valid.

---

# 5. APK Installs Successfully

If:

```text
Performing Streamed Install
Success
```

then APK installation is working.

Launch the app if necessary:

```cmd
adb -s PHONE_IP:5555 shell am start -n com.yourapp/.MainActivity
```

If the app launches but shows:

```text
Unable to load script
```

move to **Metro troubleshooting**.

---

# 6. Metro Troubleshooting

Start Metro:

```bash
npx react-native start
```

You should see:

```text
Welcome to Metro
INFO  Dev server ready.
```

If Metro says:

```text
No apps connected
```

check:

```cmd
adb devices
```

---

# 7. Try ADB Reverse

For the connected device:

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

Check:

```cmd
adb -s PHONE_IP:5555 reverse --list
```

Expected:

```text
tcp:8081 tcp:8081
```

Then reload/restart the app.

---

# 8. If `adb reverse` Doesn't Work

Try accessing Metro directly from the phone.

Find the **PC's IP**:

```cmd
ipconfig
```

Example:

```text
PC     = 192.168.1.14
Phone  = 192.168.1.15
```

Remember:

```text
Phone IP → ADB
PC IP    → Metro
```

Open on the phone:

```text
http://192.168.1.14:8081
```

---

# 9. Phone Browser Can't Open `PC_IP:8081`

Check in this order:

```text
Metro running?
      ↓
Correct PC IP?
      ↓
Port 8081 listening?
      ↓
Windows Firewall?
      ↓
Same Wi-Fi?
      ↓
Router/client isolation?
```

Check port:

```cmd
netstat -ano | findstr :8081
```

If nothing is listening, Metro is probably not running on port 8081.

---

# 10. Phone Browser Can Open Metro

If:

```text
http://PC_IP:8081
```

opens successfully:

```text
Phone → PC network connection works
Port 8081 is reachable
Metro is running
```

If React Native still shows:

```text
Unable to load script
```

investigate the React Native development-server configuration rather than the router.

---

# The 5-Step Rule

When something fails, identify the stage first:

```text
1. ADB
   ↓
2. Gradle Build
   ↓
3. APK Installation
   ↓
4. App Launch
   ↓
5. Metro / Port 8081
```

Don't troubleshoot all five at once.

---

# Quick Command Checklist

```cmd
:: 1. Check device
adb devices -l

:: 2. Check ADB version
adb version

:: 3. Connect wireless device
adb connect PHONE_IP:5555

:: 4. Check PC IP
ipconfig

:: 5. Check port 8081
netstat -ano | findstr :8081

:: 6. Reverse Metro
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081

:: 7. Check reverse
adb -s PHONE_IP:5555 reverse --list

:: 8. Manually install APK
adb install -r "PATH_TO_APP_DEBUG_APK.apk"
```

Then:

```bash
# Start Metro
npx react-native start

# Run React Native
npx react-native run-android
```

---

## Most Important Rule

**Always find the last stage that succeeded before troubleshooting.**

For example:

```text
BUILD SUCCESSFUL
       ↓
APK installation FAILED
```

→ Don't troubleshoot Metro yet.

Or:

```text
BUILD SUCCESSFUL
       ↓
APK installation SUCCESSFUL
       ↓
App launches
       ↓
Unable to load script
```

→ Don't troubleshoot Gradle or APK installation anymore. Focus on **Metro and port 8081**.

# Important Commands

These are the most useful commands for React Native wireless debugging.

---

## ADB Device Commands

### Check connected devices

```cmd
adb devices
```

More detailed information:

```cmd
adb devices -l
```

Expected:

```text
192.168.1.15:5555    device product:generic model:android_device device:generic
```

---

### Check ADB version

```cmd
adb version
```

---

### Restart ADB

Useful when the device is `offline` or ADB behaves unexpectedly.

```cmd
adb kill-server
adb start-server
adb devices
```

---

## USB ADB → Wireless ADB

### Enable ADB TCP mode

Connect the phone through USB first:

```cmd
adb tcpip 5555
```

Expected:

```text
restarting in TCP mode port: 5555
```

---

### Find the phone's Wi-Fi IP

```cmd
adb shell ip addr show wlan0
```

Look for:

```text
inet 192.168.x.x
```

---

### Connect to the phone wirelessly

Replace `PHONE_IP` with the phone's current IP address:

```cmd
adb connect PHONE_IP:5555
```

Example:

```cmd
adb connect 192.168.1.15:5555
```

---

### Disconnect a wireless device

```cmd
adb disconnect PHONE_IP:5555
```

Example:

```cmd
adb disconnect 192.168.1.15:5555
```

---

## ADB Reverse for Metro

### Forward Metro port to the phone

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

Example:

```cmd
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```

---

### Check reverse connections

```cmd
adb -s PHONE_IP:5555 reverse --list
```

Expected:

```text
tcp:8081 tcp:8081
```

---

### Remove the reverse connection

```cmd
adb -s PHONE_IP:5555 reverse --remove tcp:8081
```

---

### Remove all reverse connections

```cmd
adb -s PHONE_IP:5555 reverse --remove-all
```

---

## APK Commands

### Install an APK manually

```cmd
adb install -r "PATH_TO_APP_DEBUG_APK.apk"
```

Example:

```cmd
adb install -r "C:\<YourProject>\android\app\build\outputs\apk\debug\app-debug.apk"
```

Expected:

```text
Performing Streamed Install
Success
```

---

### Launch the React Native app

Replace the package/activity with your application's values:

```cmd
adb -s PHONE_IP:5555 shell am start -n PACKAGE_NAME/.MainActivity
```

Example:

```cmd
adb -s 192.168.1.15:5555 shell am start -n com.yourapp/.MainActivity
```

---

## Metro Commands

### Start Metro

```bash
npx react-native start
```

---

### Start Metro and clear cache

```bash
npx react-native start --reset-cache
```

---

### Run React Native on Android

```bash
npx react-native run-android
```

---

### Run with verbose output

```bash
npx react-native run-android --verbose
```

---

## Network Commands

### Find the PC's IP address

Windows:

```cmd
ipconfig
```

Look under the active Wi-Fi adapter for:

```text
IPv4 Address
```

Example:

```text
IPv4 Address. . . . . . . . . . . : 192.168.1.14
```

---

### Check whether Metro is listening on port 8081

```cmd
netstat -ano | findstr :8081
```

If Metro is running, you should see a listening entry such as:

```text
TCP    0.0.0.0:8081    0.0.0.0:0    LISTENING
```

---

## Device Storage

Check available space on the phone:

```cmd
adb shell df -h /data
```

This is especially useful when installation fails with:

```text
Requested internal only, but not enough space
```

---

## React Native / Gradle Cleanup

From the project directory:

```cmd
cd android
gradlew clean
cd ..
```

Then:

```bash
npx react-native run-android
```

---

## Check Which ADB Is Being Used

Windows:

```cmd
where adb
```

Example:

```text
C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe
C:\scrcpy-win64-v3.3.3\adb.exe
```

If multiple ADB installations exist, explicitly use the Android SDK version:

```cmd
"C:\Users\<USERNAME>\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```

---

# Most Important Commands

If you don't want to remember everything, remember these:

### 1. Check device

```cmd
adb devices -l
```

### 2. Enable wireless ADB

```cmd
adb tcpip 5555
```

### 3. Find phone IP

```cmd
adb shell ip addr show wlan0
```

### 4. Connect wirelessly

```cmd
adb connect PHONE_IP:5555
```

### 5. Check PC IP

```cmd
ipconfig
```

### 6. Start Metro

```bash
npx react-native start
```

### 7. Reverse Metro port

```cmd
adb -s PHONE_IP:5555 reverse tcp:8081 tcp:8081
```

### 8. Run the app

```bash
npx react-native run-android
```

### 9. Manually install APK

```cmd
adb install -r "PATH_TO_APP_DEBUG_APK.apk"
```

### 10. Check Metro port

```cmd
netstat -ano | findstr :8081
```

---

## Important

Do **not** permanently use an old IP such as:

```text
192.168.1.15
```

Your phone's IP can change when it reconnects to Wi-Fi.

Always check the current IP when `adb connect` fails:

```cmd
adb shell ip addr show wlan0
```

Also, if multiple Android devices/emulators are connected, specify the device using:

```cmd
adb -s PHONE_IP:5555 COMMAND
```

Example:

```cmd
adb -s 192.168.1.15:5555 reverse tcp:8081 tcp:8081
```
