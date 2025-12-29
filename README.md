# 🥨 Munich Event Platform

A full-stack event management and booking platform built with a microservices architecture. Designed to handle high-concurrency booking scenarios ("The Taylor Swift Problem") using distributed locking.

![Project Status](https://img.shields.io/badge/status-active-success)
![Tech Stack](https://img.shields.io/badge/stack-FastAPI_Next.js_PostgreSQL_Redis-blue)

## 🏗 Architecture

The system is composed of four distinct services containerized via Docker:

* **Frontend:** Next.js 14 (React) with Tailwind CSS.
* **Backend:** FastAPI (Python) for core business logic and REST API.
* **Database:** PostgreSQL for persistent relational data.
* **Cache/Locking:** Redis for distributed concurrency control (preventing double-bookings).
* **Microservice:** Java Spring Boot service for handling payment simulations.

### Key Features
* **Role-Based Access Control (RBAC):** Distinct flows for Guests, Registered Users, and Event Owners.
* **Concurrency Handling:** Uses Redis Locks to ensure no two users can book the last ticket simultaneously.
* **Analytics Dashboard:** Interactive charts (Chart.js) showing sales velocity and user demographics.
* **Polyglot Backend:** Demonstrates integration between Python (FastAPI) and Java (Spring Boot) services.

## 🚀 Getting Started

### Prerequisites
* Docker & Docker Compose
* Node.js 18+ (for local frontend dev)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/munich-event-platform.git](https://github.com/YOUR_USERNAME/munich-event-platform.git)
    cd munich-event-platform
    ```

2.  **Run with Docker (Recommended)**
    This spins up the API, DB, Redis, and Java Service.
    ```bash
    docker-compose up --build
    ```

3.  **Run Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Visit `http://localhost:3000`

## 🛠 API Documentation

Once the backend is running, full Swagger UI documentation is available at:
`http://localhost:8000/docs`

## 🧪 Testing Concurrency
To test the "Double Booking" protection:
1.  Set an event's ticket count to 1.
2.  Send two simultaneous POST requests to `/bookings/`.
3.  One will succeed (200 OK), the other will fail (400 Sold Out).

## 📄 License
MIT