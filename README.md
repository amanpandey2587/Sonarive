# 🌐 Sonarive - AI-Powered Health Assistant

Sonarive is an intelligent, AI-first healthcare assistant designed to deliver real-time insights for mental and physical well-being. It leverages **Perplexity Sonar**, **Google Gemini**, and clinical protocols (PHQ-9, GAD-7) to offer mental health analysis, medical diagnosis, second opinions, drug research, and scan-based anomaly detection—all in one unified interface.

Built with **Next.js**, **Tailwind CSS**, **Clerk**, and powerful external APIs, Sonarive empowers users in underserved or remote areas and reduces diagnostic friction.

---

## ✨ Features

### 🧠 Mental Health Analysis *(Key Feature)*
- Uses clinically validated **PHQ-9** and **GAD-7** scoring
- Combines scores with user insights (demographics, thoughts)
- Suggests urgency levels and next steps with AI reasoning

### 🖼️ Scan Analysis *(Key Feature)*
- Users upload CT, MRI, or X-ray scans
- Gemini model detects anomalies and recommends further action
- AI-generated medical insights reduce time to next steps

### 🧾 Treatment Planner
- Collects user symptoms and context
- AI suggests possible conditions using Sonar reasoning
- Helps users understand their health before a hospital visit

### 💊 Drug Research Assistant
- Provides drug details: use cases, side effects, generics
- Combines real-time data exploration with conversational AI

### ✅ Second Opinion on Treatment Plans
- Users input treatment plans
- AI compares with best practices and literature
- Offers helpful alternative suggestions or validations

### 🏥 Smart Hospital Recommendations
- Location-based hospital suggestions for specific medical needs
- Uses Google Maps API + demographic filtering

---

## 🚧 Tech Stack

| Category         | Technology                             |
|------------------|----------------------------------------|
| Framework        | Next.js                                |
| Styling          | Tailwind CSS                           |
| Authentication   | Clerk                                  |
| AI & Reasoning   | Perplexity Sonar, Google Gemini       |
| Maps             | Google Maps API                        |
| Backend          | Node.js, Express                       |
| Deployment       | Vercel                                 |

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sonarive.git
cd sonarive
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Create a `.env` file in the root directory:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
SONAR_API_KEY=your_perplexity_sonar_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run Locally

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment

**Live Demo:** [https://sonarive.vercel.app/](https://sonarive.vercel.app/)

---
