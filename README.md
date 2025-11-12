## Back End Setup

# 🌐 Full Stack Application

A full-stack web application powered by **Django**, **ASGI (Daphne)**, **Redis**, and a modern **JavaScript frontend** Next.js.  
This project integrates real-time capabilities with Redis and WebSocket support, providing a fast and scalable setup for modern web development.

---

## 🚀 Features

- ⚙️ **Django + Daphne** backend with ASGI support
- 🔄 **Redis** integration for caching and WebSocket communication
- 💻 **Modern frontend** built with Next.js, Node.js and npm
- 🔐 Secure and modular configuration
- 📦 Easy local setup and deployment-ready

---

## 🧰 Tech Stack

**Backend:**

- Python 3.8+
- Django
- Daphne (ASGI Server)
- Redis

**Frontend:**

- Node.js & npm
- Next.js

---

## 📋 Prerequisites

Make sure the following are installed:

- [Python 3.8+](https://www.python.org/downloads/)
- [Redis](https://redis.io/download)  #use MEMURAI incase of windows
- [Node.js & npm](https://nodejs.org/)
- (Optional) Virtual Environment tool such as `venv` or `virtualenv`

---

## ⚙️ Installation & Setup

### 🧱 Step 1: Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Linux/Mac
venv\Scripts\activate     # On Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  #create two separate superusers/users
python -m daphne  -p 8000 system.asgi:application

```

## Getting Started With Front End

First, run the development server:

```bash
npm install

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


http://localhost:3000/login # Login in with both user using seperate browser for separate authentication


```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
