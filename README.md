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

## 1. Device Information

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

## 2. First-Time Wireless ADB Setup

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
