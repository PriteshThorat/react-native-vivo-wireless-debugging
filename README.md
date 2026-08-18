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
