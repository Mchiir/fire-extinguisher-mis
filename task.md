# FIRE EXTINGUISHER MIS - MASTER GENERATION PROMPT

You are a senior full-stack engineer.

Generate a Fire Extinguisher Management Information System (Fire Extinguisher MIS) using a simple, exam-friendly microservices architecture.

## Goal

Build quickly while maintaining:

* Simplicity
* Consistency
* Readability
* Maintainability
* Predictable structure

Avoid:

* DDD
* CQRS
* Event Sourcing
* Kafka
* RabbitMQ
* Hexagonal Architecture
* Overengineering

Use:

Route → Controller → Service → Model

---

# Tech Stack

## Backend

* Node.js (ES Modules)
* Express.js
* MongoDB
* Mongoose
* Joi
* JWT
* Refresh Token Rotation
* Swagger
* Morgan
* Winston
* node-cron
* pnpm

## Frontend

* React (Vite)
* React Router
* Fetch API
* TailwindCSS
* Lucide Icons
* React Hot Toast
* SweetAlert2

## Infrastructure

* Docker
* Docker Compose
* Nginx API Gateway

---

# Architecture

fire-extinguisher-mis/

services/

* auth-service
* user-service
* extinguisher-service
* inspection-service
* maintenance-service
* notification-service
* report-service

gateway/
frontend/
docs/
docker-compose.yml

Use synchronous REST communication only.

No message brokers.

---

# Standard Backend Structure

Every service:

src/

* app.js
* server.js

config/
constants/
controllers/
database/
middlewares/
models/
routes/
schemas/
services/
swagger/
utils/

Utilities:

* ApiError.js
* asyncHandler.js
* logger.js

Use multiline comments before major service files and inline comments where logic is not obvious.

---

# Authentication

Access Token:

* Short-lived
* Stored in frontend memory

Refresh Token:

* HTTP-only cookie
* SameSite=Lax
* Secure
* Rotation enabled
* tokenVersion invalidation

Endpoints:

POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout

GET /auth/me

PUT /auth/profile
PUT /auth/change-password

POST /auth/forgot-password
POST /auth/reset-password

Signup default role:

USER

Admin:

* Seed manually

Inspector:

* Created by Admin

---

# Roles

ADMIN
INSPECTOR
USER

## ADMIN

* Manage users
* Manage extinguishers
* Manage inspections
* View reports
* Register inspectors

## INSPECTOR

* View assigned inspections
* Perform inspections
* Log maintenance
* Update extinguisher status

## USER

* View extinguishers
* Schedule inspections
* View maintenance history
* Receive notifications

---

# Main Modules

1. Authentication
2. Users
3. Fire Extinguishers
4. Inspections
5. Maintenance
6. Notifications
7. Reports

---

# Main Entities

## User

* firstName
* lastName
* email
* password
* role
* tokenVersion
* createdAt
* updatedAt

---

## FireExtinguisher

* serialNumber
* location
* type
* size
* installationDate
* expiryDate
* status

Status:

* ACTIVE
* INSPECTION_DUE
* UNDER_MAINTENANCE
* EXPIRED
* RETIRED

---

## Inspection

* extinguisherId
* requestedBy
* inspectorId
* scheduledDate
* status
* notes

Status:

* PENDING
* SCHEDULED
* COMPLETED
* CANCELLED

Users can schedule inspections by selecting extinguisher, date and time.

---

## MaintenanceRecord

* extinguisherId
* inspectionId
* inspectorId
* actionTaken
* conditionFound
* maintenanceDate

Examples:

* Refilled
* PressureAdjusted
* ValveReplaced
* SafetyPinReplaced
* Retired

Inspectors log maintenance activities.

---

## Notification

* userId
* extinguisherId
* title
* message
* status
* sentAt

Status:

* PENDING
* SENT
* FAILED

---

# Service Communication

## Inspection Service

Inspection

→ Extinguisher Service
→ User Service

Validate:

* extinguisher exists
* inspector exists

---

## Maintenance Service

Maintenance

→ Inspection Service
→ Extinguisher Service

Validate:

* inspection completed
* extinguisher exists

Update extinguisher status.

---

## Notification Service

Notification

→ Extinguisher Service
→ User Service
→ Inspection Service

Generate:

* Expiry alerts
* Inspection reminders
* Maintenance reminders

---

## Report Service

Report

→ Extinguisher Service
→ Inspection Service
→ Maintenance Service

Aggregate all reporting data.

---

# Scheduled Jobs

Use node-cron.

Daily:

0 8 * * *

Tasks:

1. Find extinguishers expiring within 30 days
2. Generate notifications
3. Mark expired extinguishers
4. Generate inspection reminders

Weekly:

* Summary reports

---

# API Standards

Every resource supports:

* Create
* List
* Get By Id
* Update
* Delete

Use:

* Joi validation
* RBAC middleware
* Global error handling
* Async handlers
* Consistent response format

---

# Reports

Generate:

## Inventory Report

* Daily
* Monthly
* Yearly

## Inspection Report

* Pending
* Completed
* Cancelled

## Maintenance Report

* By Date
* By Inspector
* By Extinguisher

## Expiry Report

* Expiring Soon
* Expired
* Retired

---

# Swagger

Every service exposes:

/api-docs

Document:

* Schemas
* Parameters
* Responses
* Security
* Examples

Also generate unified gateway documentation.

---

# Nginx Gateway

Routes:

* /api/auth/*
* /api/users/*
* /api/extinguishers/*
* /api/inspections/*
* /api/maintenance/*
* /api/notifications/*
* /api/reports/*

Responsibilities:

* Routing
* CORS
* Header forwarding
* Cookie forwarding
* Single API entry point

---

# Frontend

Use:

* React Router
* Fetch API
* TailwindCSS
* Reusable Components

Reusable Components:

* Modal
* Table
* FormInput
* ConfirmDialog
* Badge
* Loader
* Card
* Pagination
* ProtectedRoute

Notifications:

* toast.success()
* toast.error()

Confirmations:

* SweetAlert2

Never use:

* window.alert
* window.confirm

---

# Dashboards

## Admin

* Total Extinguishers
* Active
* Expired
* Under Maintenance
* Total Users
* Total Inspections

## Inspector

* Assigned Inspections
* Completed Inspections
* Pending Inspections
* Maintenance Tasks

## User

* My Extinguishers
* Upcoming Inspections
* Expiry Alerts
* Maintenance History

---

# Documentation

Generate under /docs

Mermaid:

* system-architecture.mmd
* inspection-flow.mmd

DBML:

* users.dbml
* extinguishers.dbml
* inspections.dbml
* maintenance.dbml
* notifications.dbml

---

# README

Generate complete README including:

* Project Overview
* Architecture
* Services
* Installation
* Docker Setup
* Environment Variables
* Running Locally
* API Documentation
* Folder Structure
* Roles and Permissions

---

# Coding Rules

* Feature-based organization
* Controller → Service → Model pattern
* Small files
* Reusable middleware
* Reusable UI components
* Functional approach
* Consistent naming
* Minimal abstractions
* Exam-friendly implementation

Generate the project incrementally, one service at a time, while preserving consistency across backend, gateway, documentation, Docker configuration, and frontend.
