# 🏠 Smart Home App (React Native + Expo)

A production-style mobile application for managing smart home devices, tracking energy consumption, and automating daily routines — built with a focus on **clean architecture, offline-first design, and scalable structure**.

---

## 🚀 Overview

This app allows users to:

* Manage smart devices across rooms
* Monitor energy usage and expenses
* Set up simple automations
* Receive real-time alerts and notifications

Designed as a **full-stack mobile system using local persistence (SQLite)**, ensuring fast and reliable performance without dependency on external backends.

---

## ✨ Key Features

### 🔐 Authentication

* Secure sign up & login
* Password hashing (bcrypt)
* Persistent sessions (AsyncStorage)

### 🏠 Home Dashboard

* Energy budget overview
* Device quick controls
* Room-based organization

### 🔌 Device Management

* Add, edit, delete devices
* Assign devices to rooms
* Track device energy usage

### ⚡ Energy Tracking

* Daily & monthly consumption
* Per-device usage insights
* Cost estimation & summaries

---

## 🧠 Architecture

This project follows a **modular, scalable architecture**:

```
UI (Screens / Components)
   ↓
Hooks (State + Logic)
   ↓
Services (Business Logic)
   ↓
Database Layer (SQLite)
```

### 📁 Folder Structure

```
app/            # Screens & navigation (Expo Router)
components/     # Reusable UI components
features/       # Feature-based modules (auth, devices, energy)
store/          # Global state management
db/             # SQLite schema & queries
assets/         # Images, icons, fonts
```

---

## 🗄️ Database Design

* Local **SQLite database**
* Normalized relational schema (~12 tables)
* Handles:

  * Users
  * Devices
  * Rooms
  * Energy logs

> Designed for scalability and efficient querying.

---

## 🛠️ Tech Stack

* **React Native (Expo)**
* **TypeScript**
* **SQLite (expo-sqlite)**
* **State Management** (Context / Zustand / Redux)
* **AsyncStorage**

---

## 📱 Screens (Core)

* Splash / Onboarding
* Authentication (Login, Signup)
* Home Dashboard
* Device Management
* Room Management
* Energy Analytics

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-home-app.git
cd smart-home-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npx expo start
```

---

## 🎯 Project Goals

* Build a **production-like mobile system**
* Apply **clean architecture principles**
* Demonstrate **offline-first app design**
* Showcase **scalable React Native structure**

---

## 📌 Future Improvements

* Advanced automation engine
* Multi-home support
* Cloud sync (Supabase / Firebase alternative)
* Real-time device integration (IoT)

---


## ⭐ Final Note

This project focuses not just on features, but on **how real-world mobile apps are structured and scaled**.
