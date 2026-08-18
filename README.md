# React Native + Vivo 1724 Wireless Debugging - Troubleshooting Guide

A practical troubleshooting guide for running React Native applications
on a physical Vivo device using wireless ADB.

> This guide is based on a Vivo 1724 running Android 8.1.0.
> Commands and settings may differ on newer Android/Vivo devices.

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

| Component | Details |
|---|---|
| Device | Vivo 1724 |
| Android Version | Android 8.1.0 |
| Debugging Method | ADB over Wi-Fi (TCP/IP) |
| ADB Port | `5555` |
| Operating System | Windows 10 |
| Framework | React Native |
| Metro | `0.84.4` |
| Java | `17.0.18` |
| ADB | `36.0.0-13206524` |

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

This section explains how to connect the Vivo 1724 to a Windows PC using **ADB over Wi-Fi (TCP/IP)**.

> **Important:** This method is intended for older Android devices that do not have the newer **Wireless Debugging / Pairing** option.

### Step 1 - Enable Developer Options

On the Vivo phone, open:

**Settings → More settings → Developer options**

Enable:

```text
USB debugging
```

If Developer options is not visible:
**Settings → About phone → Software version / Build number**

Tap the Build number repeatedly until Developer Options are enabled.

### Step 2 - Connect the Phone Using USB

Connect the Vivo phone to your PC using a USB cable.

Check whether ADB detects the device:
```bash
adb devices
```
Expected:
```text
List of devices attached
a2ce970a    device
```
If the device appears as:
```bash
a2ce970a    offline
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
a2ce970a    device
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
- The Vivo is connected to the same local network.
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
React Native should detect the connected Vivo device and install the debug APK.

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
bunx react-native run-android
```
### Commands to Remember

```text
adb devices
adb tcpip 5555
adb shell ip addr show wlan0
adb connect PHONE_IP:5555
adb devices
bunx react-native run-android
```
> Tip: You normally only need the USB connection for the initial adb tcpip 5555 setup. After that, you can use ADB wirelessly as long as the phone and PC can communicate over the same network.

## 2. ADB Connection Problems

This section covers common problems when connecting the Vivo device to the PC using ADB.

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
a2ce970a    offline
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
a2ce970a    device
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
C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe
C:\scrcpy-win64-v3.3.3\adb.exe
```
Multiple copies of ADB can sometimes make troubleshooting confusing.

Check the version of the Android SDK ADB:
```text
"C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe" version
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
````

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
````

This means Gradle cannot find the Android SDK.

#### Check the Android SDK location

On a typical Windows installation, the Android SDK is located at:

```text
C:\Users\Admin\AppData\Local\Android\Sdk
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
sdk.dir=C:\Users\Admin\AppData\Local\Android\Sdk
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

* Android SDK Platform
* Android SDK Build-Tools
* Android SDK Platform-Tools
* Android SDK Command-line Tools
* Android SDK Tools required by the project

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
C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

If `adb` is not recognized, add the Android SDK `platform-tools` directory to your Windows `PATH`.

Typical path:

```text
C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools
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
bunx react-native doctor
```

The doctor command can help identify problems with:

* Android SDK
* Android SDK tools
* JDK
* Android Studio
* Environment variables
* Connected Android devices

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
````

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
adb install -r "D:\Projects\ReactNativeTest1\android\app\build\outputs\apk\debug\app-debug.apk"
```

If it succeeds:

```text
Performing Streamed Install
Success
```

then:

* APK was built correctly
* Android SDK is working
* ADB can communicate with the phone
* APK installation itself works

This is a very useful diagnostic test.

---

### Problem 2 — `Requested internal only, but not enough space`

Example:

```text
Requested internal only, but not enough space
```

This means the phone does not have enough **internal storage** to install the APK.

It is generally **not**:

* React Native code problem
* Gradle problem
* Android SDK problem
* Metro problem
* Wi-Fi problem

### Check phone storage

You can use:

```cmd
adb shell df -h /data
```

If the available space is very low, free storage on the phone.

Remove or move:

* Large videos
* Downloads
* WhatsApp media
* Unused applications
* Old APK files
* Other large files

Then try:

```bash
npx react-native run-android
```

---

### Problem 3 — Installation works manually but `run-android` fails

Sometimes this works:

```cmd
adb install -r "D:\Projects\ReactNativeTest1\android\app\build\outputs\apk\debug\app-debug.apk"
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
adb -s 192.168.1.15:5555 shell am start -n com.reactnativetest1/.MainActivity
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
adb -s 192.168.1.15:5555 install -r "D:\Projects\ReactNativeTest1\android\app\build\outputs\apk\debug\app-debug.apk"
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
C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools\adb.exe
C:\scrcpy-win64-v3.3.3\adb.exe
```

Also check:

```cmd
tasklist | findstr /i "adb scrcpy"
```

If necessary, close applications using ADB, such as:

* Android Studio
* scrcpy
* VS Code terminals running ADB commands
* Other Android debugging tools

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
adb -s PHONE_IP:5555 shell am start -n com.reactnativetest1/.MainActivity
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

* AP Isolation
* Client Isolation
* Wireless Isolation

These can prevent devices connected to the same Wi-Fi from communicating with each other.

If the phone and PC cannot communicate directly, check the router settings.

---

## Problem 10 — Manually install APK to separate the problems

This is one of the most useful troubleshooting techniques.

Build the APK:

```bash
bunx react-native run-android
```

If the command fails specifically at:

```text
:app:installDebug
```

try installing the generated APK manually:

```cmd
adb install -r "D:\Projects\ReactNativeTest1\android\app\build\outputs\apk\debug\app-debug.apk"
```

### If manual installation succeeds

The APK itself is valid and installation works.

Focus on:

* React Native CLI
* Gradle install task
* ADB device selection
* ADB connection
* `adb reverse`

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
adb install -r "D:\Projects\ReactNativeTest1\android\app\build\outputs\apk\debug\app-debug.apk"
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
adb -s PHONE_IP:5555 shell am start -n com.reactnativetest1/.MainActivity
```

---

> **Most important rule:** Always read the **actual error at the bottom of the installation step**. Warnings such as Gradle deprecation messages are usually unrelated to an APK installation failure. In the previous troubleshooting case, the real installation problem was **insufficient internal storage on the Vivo**, not Gradle or React Native.
