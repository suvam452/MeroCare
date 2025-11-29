# Mero Care

**Mero Care** — an AI-powered symptom checker and simple family health manager.
Users can check symptoms using an AI assistant, store basic personal & family health history, add/view family members, and review past AI interactions.

---

## About the project

**Mero Care** helps users self-assess symptoms using an AI-powered checker and keeps a lightweight health record. It's intended as a supportive tool, **not a replacement** for professional medical advice.

Primary capabilities:

* AI symptom checking (chat-like interaction)
* Store basic health history for the user
* Add/manage family members and view their health info
* View AI interaction history (for past symptom checks)

---

## Key features

* Conversational AI symptom checker (input symptoms, get guidance)
* Save symptom sessions and AI responses (AI history)
* Add family members and manage simple profiles (age, known conditions, meds)
* Basic personal health history (allergies, chronic conditions, vaccinations)
* Simple user authentication flow (token-based)

---

## Tech stack

* **Mobile / Frontend:** React Native (Expo or React Native CLI)
* **Backend:** Python + FastAPI
* **Database:** MySQL

---

## Architecture overview

1. **React Native app** — UI for users to enter symptoms, view family members, and see AI history. Calls backend APIs.
2. **FastAPI backend** — exposes endpoints for auth, users, family members, health records, AI symptom checks, and history. Integrates with AI provider for symptom interpretation.
3. **Database** — stores users, family members, health history, and AI sessions.
