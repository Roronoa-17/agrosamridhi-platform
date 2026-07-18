# 🌾 AgroSamridhi Platform — Master Project Document

**AgroSamridhi** is an AI-powered, microservices-based backend platform designed to give Indian farmers actionable insights regarding soil health, crop suggestions, disease diagnosis, weather alerts, and market prices.

---

## 🏗️ 1. Architecture & Tech Stack
* **Framework:** Java 17, Spring Boot 3, Spring Cloud
* **Database & Caching:** MySQL 8, Redis
* **AI Integration:** Google Gemini Vision API (via Spring WebFlux)
* **External APIs:** Agmarknet (data.gov.in) for Mandi Prices, Open-Meteo for Weather
* **Infrastructure:** Docker, Docker Compose, Netflix Eureka (Service Registry), Spring Cloud Gateway
* **Documentation:** Springdoc OpenAPI (Swagger UI) aggregated at the Gateway

### The 8 Core Modules
1. **Authentication & Farmer Profile:** JWT secure login & demographic data.
2. **Soil Health Card OCR:** Gemini Vision extracts nutrients (N, P, K, pH) from card images.
3. **AI Crop Suggestion Engine:** Rule-engine + Gemini LLM for 3-year rotation plans.
4. **Pest & Disease Diagnosis:** Image-based disease detection and remedy generation.
5. **Weather & Farm Advisory:** 7-day localized forecasts and farming alerts.
6. **Mandi Price Intelligence:** Scheduled scraping of real-time crop prices & 90-day trends.
7. **Government Scheme Finder:** Eligibility matching based on farmer profiles.
8. **Unified Dashboard:** High-speed (<500ms) aggregated summary cache.

---

## 👥 2. Team Distribution & Microservices Allocation

### 👑 Team Lead / DevOps (Global Infra & Orchestration)
* **Assigned Modules:** Infrastructure Routing & Service Registry
* **Folders:** `/discovery-server`, `/api-gateway`
* **Tasks:** Set up Eureka Registry, configure API Gateway routing rules, write multi-stage Dockerfiles, build `docker-compose.yml`, and manage GitHub branch protections.

### 👤 Member 1 (Security, Auth & Rule Engines)
* **Assigned Modules:** 
  * **Module 1** — Authentication & Farmer Profile
  * **Module 7** — Government Scheme Finder
* **Folder:** `/auth-service` (Port: 8082)
* **Tasks:** Implement Spring Security 6, JWT generation/validation, profile management, and the relational mapping engine for Government Scheme eligibility.

### 👤 Member 2 (Data Ingestion & Pipelines)
* **Assigned Modules:** 
  * **Module 5** — Weather & Farm Advisory
  * **Module 6** — Mandi Price Intelligence
* **Folder:** `/data-ingestion-service` (Port: 8083)
* **Tasks:** Build `@Scheduled` cron jobs to fetch Agmarknet Mandi prices and Open-Meteo weather data. Write MySQL Stored Procedures to calculate 90-day price trends efficiently.

### 👤 Member 3 (Reactive AI & Computer Vision)
* **Assigned Modules:** 
  * **Module 2** — Soil Health Card OCR
  * **Module 3** — AI Crop Suggestion Engine
  * **Module 4** — Pest & Disease Diagnosis
* **Folder:** `/ai-inference-service` (Port: 8084)
* **Tasks:** Use Spring WebFlux to handle multipart image uploads. Engineer strict JSON prompts for Gemini Vision for Soil OCR and Pest Diagnosis. Build the Crop Suggestion rule engine.

### 👤 Member 4 (API Aggregation, Caching & Swagger)
* **Assigned Modules:** 
  * **Module 8** — Unified Dashboard
* **Folder:** `/dashboard-aggregator-service` (Port: 8085)
* **Tasks:** Use OpenFeign to asynchronously fetch data from downstream services. Implement Redis caching to serve the Unified Dashboard in under 500ms. Set up centralized Swagger UI.

---

## 🔄 3. Development Workflow (Git Flow)

1. **Mono-repo:** All services live in one repository (`agrosamridhi-platform`).
2. **Branching Strategy:**
   * `main`: Production-ready, tested code only.
   * `develop`: Integration branch where features are merged.
   * `feature/*`: Developer branches (e.g., `feature/auth-jwt`, `feature/soil-ocr`).
3. **Pull Requests:** Developers create PRs against `develop`. Requires at least 1 peer review before merging. 
4. **No API Contract Changes:** DTO schemas cannot be changed without team consensus, as it will break the Aggregator service.

---

## 📜 4. Global API Contracts (v1.0)

All endpoints are accessed via the **API Gateway (`localhost:8080`)**.

# 🌐 API Gateway Routing Guide

**Base URL:** `http://localhost:8080`
**Authentication:** Endpoints marked with 🔒 require the header `Authorization: Bearer <JWT_TOKEN>`

The API Gateway acts as the single entry point for the platform. It automatically intercepts these requests and routes them to the correct internal microservice using the Eureka Discovery Registry.

---

## 1. Identity & Profiles (Routes to `auth-service`)

| Method | Gateway Path | Security | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Open | Registers a new farmer and creates a profile. |
| **POST** | `/api/auth/login` | Open | Authenticates farmer and returns a JWT token. |
| **GET** | `/api/schemes/eligible` | 🔒 | Fetches government schemes matching the farmer's profile. |

---

## 2. External Data & Advisories (Routes to `data-ingestion-service`)

| Method | Gateway Path | Security | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/mandi/trends` | 🔒 | Returns top mandis and 90-day price trends. (Requires `?cropName=` param). |
| **GET** | `/api/weather/advisory` | 🔒 | Returns 7-day weather forecast and generated farming alerts based on location. |

---

## 3. AI & Computer Vision (Routes to `ai-inference-service`)

| Method | Gateway Path | Security | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/ai/soil-ocr` | 🔒 | Uploads Soil Health Card image (`multipart/form-data`) and returns extracted nutrients. |
| **POST** | `/api/ai/crop-suggestions` | 🔒 | Submits soil/budget metrics and returns a 3-year AI-generated crop rotation plan. |
| **POST** | `/api/ai/pest-diagnosis` | 🔒 | Uploads diseased crop image (`multipart/form-data`) and returns AI diagnosis and remedies. |

---

## 4. Unified Dashboard (Routes to `dashboard-aggregator-service`)

| Method | Gateway Path | Security | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/dashboard/summary` | 🔒 | Fetches the sub-500ms aggregated summary containing weather, mandi, and soil alerts. |

---

## 5. API Documentation (Centralized Swagger)

| Method | Gateway Path | Security | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/swagger-ui.html` | Open | Interactive dashboard to view and test all microservice endpoints in one place. |