# OptiFit AI

**OptiFit AI** is a wellness and performance optimization app designed to provide personalized health insights, streamline fitness tracking, and enhance user well-being through AI-driven recommendations. The project is now in the **implementation stage** with a monorepo structure containing both backend microservices and a React Native frontend.

---

## **Table of Contents**

- [OptiFit AI](#optifit-ai)
  - [**Table of Contents**](#table-of-contents)
  - [**Overview**](#overview)
  - [**Vision**](#vision)
  - [**Key Features**](#key-features)
  - [**Project Structure**](#project-structure)
  - [**Technical Stack**](#technical-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [DevOps (Planned)](#devops-planned)
  - [**Documentation**](#documentation)
  - [**Getting Started**](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
  - [**Contributing**](#contributing)
  - [**License**](#license)

---

## **Overview**

OptiFit AI integrates advanced technology with health science to empower users in achieving their fitness and wellness goals. By leveraging AI, wearables, and user-friendly design, the app aims to deliver a seamless and effective health optimization experience focused on circadian rhythm, diet, and exercise.

The project follows a microservices architecture with a React Native frontend, allowing for independent development, deployment, and scaling of each service.

---

## **Vision**

To create a **holistic health assistant** that combines **nutrition tracking**, **exercise guidance**, and **sleep optimization**, all tailored to individual circadian rhythms and performance goals.

---

## **Key Features**

- **AI-Driven Insights:** Personalized health recommendations based on user data and research.
- **Integrated Tracking:** Seamless logging of food, sleep, and workouts.
- **Wearable Integration:** Support for popular health devices and platforms.
- **Community Engagement:** Social challenges, achievements, and shared goals.
- **Scalable Design:** Built with a future-proof microservices architecture for growth.

---

## **Project Structure**

The project is organized as a monorepo with separate directories for backend microservices and the frontend application.

```plaintext
.
├── LICENSE                # License for the repository
├── README.md              # Project overview and guide
├── apps/                  # Application code
│   ├── backend/           # Backend microservices
│   │   ├── services/      # Individual microservices
│   │   │   ├── user-service/     # Authentication and user management (implemented)
│   │   │   ├── logging-service/  # Food, exercise, and sleep logging (planned)
│   │   │   └── ai-service/       # AI recommendations and chat (planned)
│   │   └── docker-compose.yml    # Docker configuration for services
│   └── frontend/          # React Native Expo application
│       ├── app/           # Expo Router application structure
│       ├── components/    # Reusable UI components
│       ├── services/      # API service integrations
│       ├── constants/     # Application constants
│       ├── assets/        # Images, fonts, and other static assets
│       └── docs/          # Frontend and API documentation
├── docs/                  # Project documentation (legacy)
└── notebooks/             # Jupyter notebooks for data analysis
```

---

## **Technical Stack**

### Backend
- **Framework:** NestJS microservices architecture
- **Language:** TypeScript
- **Authentication:** JWT-based authentication with refresh tokens
- **Database:** PostgreSQL (with potential migration to TimescaleDB for logging service)
- **API:** RESTful API endpoints with comprehensive documentation

### Frontend
- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **State Management:** React Context (with potential for Redux)
- **API Communication:** Axios with request/response interceptors
- **Authentication:** Secure token storage with expo-secure-store

### DevOps (Planned)
- **Containerization:** Docker
- **Cloud Platform:** Google Cloud Platform (GCP)
- **CI/CD:** GitHub Actions
- **Monitoring:** Cloud Monitoring
- **Logging:** Google Cloud Logging

---

## **Documentation**

The most up-to-date documentation is available in the `apps/frontend/docs/` directory:

- **[Architecture Overview](apps/frontend/docs/ARCHITECTURE_OVERVIEW.md):** Comprehensive overview of the system architecture, components, and interactions.
- **[Feature Roadmap](apps/frontend/docs/FEATURE_ROADMAP.md):** Detailed roadmap of features and implementation priorities.
- **API Documentation:**
  - [User Service API](apps/frontend/docs/USER_SERVICE_API.md)
  - [Logging Service API](apps/frontend/docs/LOGGING_SERVICE_API.md) (planned)
  - [AI Service API](apps/frontend/docs/AI_SERVICE_API.md) (planned)

Legacy documentation is still available in the `docs/` directory but may not reflect the current implementation.

---

## **Getting Started**

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- PostgreSQL
- Expo CLI (for frontend development)

### Backend Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-organization/optifit.git
   cd optifit
   ```

2. **Set Up User Service:**
   ```bash
   cd apps/backend/services/user-service
   npm install
   npm run start:dev
   ```

3. **API Documentation:**
   The User Service API documentation is available at `apps/backend/services/user-service/API_DOCUMENTATION.md`.

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd apps/frontend
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm start
   ```

3. **Run on Specific Platform:**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For Web
   npm run web
   ```

---

## **Contributing**

We welcome contributions to improve the project. If you're interested:

1. Check out the architecture and feature roadmap documentation for guidance on the project direction.
2. Submit issues or suggestions via [GitHub Issues](https://github.com/your-organization/optifit/issues).
3. Fork the repository and submit a pull request for proposed changes.

---

## **License**

This project is licensed under the [MIT License](LICENSE).
