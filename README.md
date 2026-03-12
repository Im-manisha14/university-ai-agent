# ZENAI — AI Agent Platform for University Management

> A hackathon prototype demonstrating **Actionable AI Agents** that manage university operations through conversational natural language queries.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                          │
│  Dashboard │ Agent Creator │ Chat UI │ Analytics              │
└──────────────┬──────────────────────────────┬────────────────┘
               │         Axios API            │
┌──────────────▼──────────────────────────────▼────────────────┐
│                     EXPRESS BACKEND                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Agent Routes │  │ Chat Routes  │  │  Data Routes     │    │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘    │
│         │                │                    │              │
│  ┌──────▼──────┐  ┌──────▼───────┐           │              │
│  │   Agent     │  │    Chat      │           │              │
│  │ Controller  │  │  Controller  │           │              │
│  └─────────────┘  └──────┬───────┘           │              │
│                          │                    │              │
│                   ┌──────▼───────┐           │              │
│                   │  AI Service  │           │              │
│                   │ (OpenAI/Mock)│           │              │
│                   └──────┬───────┘           │              │
│                          │                    │              │
│                   ┌──────▼───────┐           │              │
│                   │Action Router │◄──────────┘              │
│                   │(CRUD Engine) │                           │
│                   └──────┬───────┘                           │
│                          │                                   │
│                   ┌──────▼───────┐                           │
│                   │ JSON Storage │                           │
│                   │ (Data Files) │                           │
│                   └──────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer      | Technology             |
|-----------|------------------------|
| Frontend  | React.js, Tailwind CSS |
| Backend   | Node.js, Express.js    |
| AI        | OpenAI API (GPT) / Mock fallback |
| Storage   | JSON files             |

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure OpenAI (Optional)

Set your API key as an environment variable:

```bash
# Windows PowerShell
$env:OPENAI_API_KEY = "sk-your-key-here"

# Linux/Mac
export OPENAI_API_KEY="sk-your-key-here"
```

> **Note**: The platform works fully without an API key using intelligent mock responses.

### 3. Start the Platform

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm start

# Terminal 2 — Frontend (port 3000)
cd frontend
npm start
```

Open **http://localhost:3000** in your browser.

## Features

### 1. Agent Creation System
- Describe an agent's purpose in natural language
- System auto-generates: name, domain, capabilities, AI prompt
- Quick-start templates for common domains

### 2. Agent Dashboard
- Grid view of all configured agents
- Real-time stats (students, faculty, courses, interactions)
- One-click chat access and agent deletion

### 3. Chat Interface (ChatGPT-style)
- Message bubbles with typing indicators
- Query suggestion chips
- Action execution badges
- Agent details sidebar

### 4. AI Action Generation
- Natural language → structured JSON action pipeline
- OpenAI integration with mock fallback
- Smart intent detection and entity extraction

### 5. Action Router
- CRUD operations on all university data
- Domain-restricted agent permissions
- Action logging and history

### 6. Domain Restriction
- Each agent can only execute its allowed actions
- Validated before execution in the action router
- Clear error messages for unauthorized attempts

### 7. Analytics Dashboard
- Platform-wide statistics
- Chronological action log
- Per-agent interaction history

## Supported Domains & Actions

| Domain     | Actions                                              |
|-----------|------------------------------------------------------|
| Students  | create, list, update, delete                         |
| Faculty   | add, list, delete, assign subject, generate workload |
| Courses   | create, list, update, delete                         |
| Attendance| record, list, attendance report                      |
| Exams     | schedule, list                                       |

## Example Queries

- "Enroll Rahul in IT department for 2024"
- "List all students in CSE"
- "Assign Data Structures to Prof. Kumar"
- "Show students with attendance below 75%"
- "Schedule exam for Database Systems on April 20"
- "Generate faculty workload report"

## Project Structure

```
ZENAI/
├── backend/
│   ├── controllers/
│   │   ├── agentController.js    # Agent CRUD logic
│   │   └── chatController.js     # Chat processing pipeline
│   ├── routes/
│   │   ├── agentRoutes.js        # /api/agents endpoints
│   │   ├── chatRoutes.js         # /api/chat endpoints
│   │   └── dataRoutes.js         # /api/data endpoints
│   ├── services/
│   │   ├── aiService.js          # OpenAI integration + mock
│   │   ├── actionRouter.js       # Action execution engine
│   │   └── dataService.js        # JSON file read/write
│   ├── data/
│   │   ├── students.json         # Student records
│   │   ├── faculty.json          # Faculty records
│   │   ├── courses.json          # Course records
│   │   ├── attendance.json       # Attendance records
│   │   ├── agents.json           # Agent configurations
│   │   └── logs.json             # Action audit log
│   ├── server.js                 # Express entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Top navigation
│   │   │   ├── AgentCard.js      # Agent display card
│   │   │   ├── AgentCreator.js   # Agent creation form
│   │   │   └── ChatBox.js        # Chat message interface
│   │   ├── pages/
│   │   │   ├── Dashboard.js      # Main dashboard
│   │   │   ├── ChatPage.js       # Chat with sidebar
│   │   │   ├── CreateAgentPage.js# Agent creation page
│   │   │   └── AnalyticsPage.js  # Analytics & logs
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.js                # Router configuration
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Tailwind + custom styles
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                     | Description              |
|--------|------------------------------|--------------------------|
| GET    | /api/health                  | Health check             |
| GET    | /api/agents                  | List all agents          |
| GET    | /api/agents/:id              | Get agent details        |
| POST   | /api/agents                  | Create agent             |
| DELETE | /api/agents/:id              | Delete agent             |
| GET    | /api/agents/:id/logs         | Agent action logs        |
| POST   | /api/chat/:agentId           | Send message to agent    |
| GET    | /api/chat/:agentId/history   | Get chat history         |
| GET    | /api/data/stats              | Platform statistics      |
| GET    | /api/data/logs               | All action logs          |

---

Built for a 24-hour hackathon. Demo-ready, clean architecture, fully functional.
