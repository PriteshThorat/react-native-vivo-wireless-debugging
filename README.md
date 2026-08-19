# React Native Wireless Debugging - Troubleshooting Guide

A practical troubleshooting guide for running React Native applications
on a physical Android device using wireless ADB.

> This guide is based on an Android 8.1.0 device.
> Commands and settings may differ on newer Android versions.

## Documentation

Read the complete guide:
[React Native Wireless Debugging Guide](https://priteshthorat.github.io/react-native-wireless-debugging/)

## What This Guide Covers

- Wireless ADB setup (TCP/IP mode for older Android devices)
- ADB connection problems (offline, no device, multiple devices, connection errors)
- Android SDK and Gradle configuration issues
- APK installation failures (EOF, storage, manual install)
- Metro bundler and port 8081 connectivity
- Quick troubleshooting flowchart
- Essential ADB, Metro, and networking commands

## Tested Environment

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

> This device uses an older Android version and does **not** provide the newer Android Wireless Debugging / pairing workflow found on modern Android versions. This guide uses the traditional ADB TCP/IP method (`adb tcpip 5555` / `adb connect IP:5555`).