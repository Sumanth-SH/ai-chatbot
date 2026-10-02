# 🤖 AI Chatbot

A full-stack AI chatbot application built with **React**, **FastAPI**, and **Google Gemini API**.

The application provides a ChatGPT-style interface where users can have conversations with an AI, save previous chats, switch between conversations, and interact with AI-generated text and code.

## ✨ Features

### 💬 AI Chat

* Send messages to the AI and receive responses from Google Gemini.
* Conversation history is sent to the backend so the AI can understand previous messages.
* Displays a typing indicator while waiting for the AI response.
* Prevents sending multiple messages while a response is being generated.

### 🗂️ Chat History

* Automatically saves conversations in the browser's `localStorage`.
* Creates a chat title automatically from the first user message.
* Open previously saved conversations.
* Edit chat titles.
* Delete conversations.
* Keeps chats available after refreshing the page.

### 🎨 User Interface

* Desktop-focused ChatGPT-style interface.
* Glass-style UI.
* Sidebar that can be opened and closed.
* Light/dark theme support.
* Theme preference is saved in `localStorage`.
* Automatically scrolls to the latest message.
* Multi-line message support.
* Textarea automatically adjusts its height while typing.

### 🧑‍💻 Code Support

* AI responses support Markdown formatting.
* Code blocks display their programming language.
* Full code responses provide a **Copy** button.
* Code is displayed with proper formatting for easier reading.

### ⚙️ Backend

* Built using **FastAPI**.
* Handles communication between the React frontend and Gemini API.
* Uses environment variables to protect the Gemini API key.
* CORS is configured for the React frontend.

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* JavaScript
* CSS
* React Markdown

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn
* Google Gemini API

### Storage

* Browser `localStorage`

## 📁 Project Structure

```text
ai-chatbot/
│
├── backend/
│   ├── main.py
│   ├── .env
│   └── venv/
│
├── src/
│   ├── Chat.jsx
│   ├── Chat.css
│   └── ...
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

> The exact frontend file names may vary depending on the current project structure.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-chatbot.git
cd ai-chatbot
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

Move into the backend folder:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

On Windows PowerShell:

```bash
venv\Scripts\Activate.ps1
```

Install the required Python packages:

```bash
pip install fastapi uvicorn google-genai python-dotenv
```

### 4. Configure the Gemini API key

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
```

**Never commit your `.env` file or expose your API key publicly.**

### 5. Start the backend

From the `backend` folder:

```bash
python -m uvicorn main:app --reload
```

The backend will run locally on:

```text
http://127.0.0.1:8000
```

### 6. Start the frontend

Open another terminal and go back to the main project folder:

```bash
cd ai-chatbot
```

Run:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## 🔐 Environment Variables

The backend requires a Gemini API key.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The `.env` file should **not** be uploaded to GitHub.

Add it to `.gitignore`:

```text
.env
venv/
node_modules/
__pycache__/
```

## 🔄 How the Application Works

```text
User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
Google Gemini API
  ↓
FastAPI Backend
  ↓
React Frontend
  ↓
AI Response
```

The frontend sends the user's message along with conversation history to the FastAPI backend.

The backend sends the request to Gemini and returns the AI response to the React application.

Chat history and user interface preferences are stored locally in the browser.

## 🎯 Project Goals

This project was built to practice and demonstrate:

* React state management
* React Hooks
* API communication
* FastAPI backend development
* Connecting a frontend application to an AI API
* Conversation history management
* Local storage
* Markdown rendering
* Responsive UI concepts
* Environment variable management
* Full-stack application structure

## 🔮 Future Improvements

Possible future improvements include:

* User authentication
* Database-based chat storage
* Streaming AI responses
* Multiple AI model selection
* File uploads
* Voice input
* Deployment of frontend and backend
* Cloud-based conversation synchronization

## 👨‍💻 Author

**SUMO**

Built as a full-stack AI project using React, FastAPI, and Google Gemini.
