## Getting Started With Back End

cat > README.md << 'EOF'

# 🌐 Full Stack Application

A full-stack web application powered by **Django**, **ASGI (Daphne)**, **Redis**, and a modern **JavaScript frontend** (e.g., React or Vue).  
This project integrates real-time capabilities with Redis and WebSocket support, providing a fast and scalable setup for modern web development.

---

## 🚀 Features

- ⚙️ **Django + Daphne** backend with ASGI support
- 🔄 **Redis** integration for caching and WebSocket communication
- 💻 **Modern frontend** built with Node.js and npm
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
- (React / Vue / Next.js — customize as per your stack)

---

## 📋 Prerequisites

Make sure the following are installed:

- [Python 3.8+](https://www.python.org/downloads/)
- [Redis](https://redis.io/download)
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
python manage.py createsuperuser  #create two superusers
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


http://localhost:3000/login # Login in with both user using seperate browser for seperate authentication


```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
