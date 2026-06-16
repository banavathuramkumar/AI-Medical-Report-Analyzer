# 🏥 AI Medical Report Analyzer

## 🚀 Live Demo

🌐 **Live Application:**  
https://ai-medical-report-analyzer-u7d6.vercel.app/

---

# 📌 Project Overview

AI Medical Report Analyzer is a production-ready healthcare application built using the MERN stack and microservices architecture.

The platform allows users to upload medical reports (PDF/images) and receive AI-powered analysis, summaries, and insights using advanced AI models.

The application is designed with scalability, security, and maintainability in mind using:

- React.js + Vite frontend
- Node.js + Express.js backend
- Microservices architecture
- MongoDB database
- Apache Kafka event-driven communication
- Docker containerization
- Google Gemini AI integration

The system provides a complete workflow from medical report upload to AI-generated analysis.

---

# ✨ Features

## 🔐 Secure Authentication

- JWT-based authentication
- User registration and login
- Protected routes
- Secure API communication

---

## 📄 Medical Report Processing

Users can upload:

- PDF medical reports
- Medical images

The processing pipeline:

```
Upload Medical Report
          |
          ↓
File Processing & Text Extraction
          |
          ↓
Medical Term Detection
          |
          ↓
AI Analysis
          |
          ↓
Report Insights Generation
```

---

## 🤖 AI-Powered Medical Analysis

The application uses AI models to analyze medical reports.

AI provider priority:

1. Google Gemini API
2. HuggingFace API fallback
3. Local mock analyzer fallback

Generated insights include:

- Medical report summary
- Important findings
- Parameter explanations
- Health insights
- Simplified explanations

⚠️ This application provides AI-generated information for educational purposes only and should not replace professional medical advice.

---

# ⚡ Event-Driven Microservices Architecture

The backend follows a microservices architecture.

Services communicate using Apache Kafka.

Architecture flow:

```
Report Service
      |
      |
      ↓
 report-extracted topic
      |
      ↓
AI Analysis Service
      |
      ↓
 report-analyzed topic
      |
      ↓
Database Storage
```

---

# 🏗️ System Architecture

```
                         User
                          |
                          ↓
                  React Frontend
                          |
                          ↓
                 API Gateway
                          |
        --------------------------------
        |              |               |
        ↓              ↓               ↓

   Auth Service   Report Service   AI Service

        |              |               |
        --------------------------------

                          |
                          ↓

                       Kafka

                          |
                          ↓

                      MongoDB
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React.js | User Interface |
| Vite | Build Tool |
| JavaScript | Programming Language |
| Tailwind CSS | Styling |
| React Router | Navigation |

---

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend Runtime |
| Express.js | API Development |
| JWT | Authentication |
| MongoDB | Database |
| Mongoose | Database Management |

---

## Microservices

| Service | Responsibility |
|---|---|
| Auth Service | User authentication and authorization |
| Report Processing Service | Upload handling and report processing |
| AI Analysis Service | AI-based medical analysis |
| API Gateway | Central API communication layer |

---

## Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-container management |
| Apache Kafka | Message communication |
| Zookeeper | Kafka coordination |

---

# 📋 Prerequisites

Install the following:

- Docker Desktop
- Docker Compose
- Git
- Node.js 18+ (optional)

Required API:

Google Gemini API Key:

https://aistudio.google.com/apikey

---

# 🚀 Installation & Setup

## 1. Clone Repository

```bash
git clone <repository-url>

cd "AI-Medical-Report-Analyzer"
```

---

## 2. Configure Environment Variables

Create:

```
.env
```

Example:

```env
JWT_SECRET=your_secure_random_secret

GEMINI_API_KEY=your_gemini_api_key

HF_API_KEY=your_optional_huggingface_key

MONGO_URI=mongodb://mongodb:27017/medical

KAFKA_BROKER=kafka:9092

PORT=5000
```

---

# 🐳 Running With Docker

## Build Containers

```bash
docker compose build
```

---

## Start Application

```bash
docker compose up -d
```

Docker automatically starts:

| Service | Port | Purpose |
|---|---|---|
| Frontend | 3000 | Web application |
| API Gateway | 5000 | Main API |
| Auth Service | 5001 | Authentication |
| Report Service | 5002 | Report processing |
| AI Service | 5003 | AI analysis |
| MongoDB | 27017 | Database |
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka management |

---

# 🌐 Access Application

Open:

```
http://localhost:3000
```

Live:

```
https://ai-medical-report-analyzer-u7d6.vercel.app/
```

---

# 🔌 API Documentation

Base URL:

```
http://localhost:5000/api
```

---

## Authentication

Base Path:

```
/auth
```

| Method | Endpoint | Description |
|---|---|---|
| POST | /register | Create account |
| POST | /login | User login |
| GET | /profile | User profile details (requires token) |

---

## Reports

Base Path:

```
/reports
```

| Method | Endpoint | Description |
|---|---|---|
| POST | /upload | Upload report (requires token) |
| GET | /status/:id | Check processing status & get analysis |
| GET | /history | Get reports history (requires token) |

---

## AI Analysis

AI analysis results are stored directly on the report document and can be retrieved using the `/reports/status/:id` endpoint once the processing status becomes `completed`. The insights will be available in the `analysisResult` field of the response.

---

# 📡 Kafka Topics

## report-extracted

Produced by:

```
Report Processing Service
```

Contains:

- Extracted report text
- Report information


## report-analyzed

Produced by:

```
AI Analysis Service
```

Contains:

- AI generated insights
- Analysis results

---

View Kafka topics:

```bash
docker exec -it medical-kafka kafka-topics \
--list \
--bootstrap-server localhost:9092
```

---

# 🌱 Environment Variables

| Variable | Description |
|---|---|
| JWT_SECRET | JWT signing secret |
| GEMINI_API_KEY | Google Gemini API key |
| HF_API_KEY | HuggingFace API key |
| MONGO_URI | MongoDB connection URL |
| KAFKA_BROKERS | Kafka server addresses (comma-separated) |
| PORT | Service port |

---

# 🧪 Testing

## Unit Testing

Auth service:

```bash
cd services/auth
npm test
```

Report service:

```bash
cd services/report-processing
npm test
```

AI service:

```bash
cd services/ai-analysis
npm test
```

---

# 🛠️ Troubleshooting

## Kafka & Cluster ID Mismatch Error

If Kafka fails to start (commonly due to an `InconsistentClusterIdException` after containers restart):

```bash
docker compose down -v

docker compose up --build
```

---

## MongoDB Connection Error

Verify:

```env
MONGO_URI=mongodb://mongodb:27017/medical
```

---

## Authentication Errors

Check that:

```
JWT_SECRET
```

is identical across authentication-related services.

---

## View Container Logs

```bash
docker compose logs <service-name>
```

Example:

```bash
docker compose logs medical-ai-service
```

---

# 📂 Project Structure

```
AI-Medical-Report-Analyzer

│
├── frontend
│
├── backend
│
├── services
│   ├── auth
│   ├── report-processing
│   └── ai-analysis
│
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```

---

# 🔒 Security Features

Implemented:

- JWT authentication
- Environment-based secrets
- Secure API communication
- Docker container isolation
- Microservice separation
- Protected endpoints

---

# 🚀 Future Enhancements

Planned improvements:

- Doctor dashboard
- Medical history tracking
- Cloud storage integration
- Advanced OCR models
- Mobile application
- Real-time notifications
- Custom medical AI models

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you find this project useful, consider giving it a star on GitHub.

Built with ❤️ using MERN, Microservices, Docker, Kafka, and AI.
