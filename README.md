# Project Name

A full-stack project built with **React (Vite)** frontend and **Node.js/Express** backend.  
Demonstrates clean code structure, modular architecture, and environment-based configuration.

---

## 🛠 Technology Stack

- **Frontend:** React, Vite, Tailwind CSS  
- **Backend:** Node.js, Express.js, MongoDB  
- **Tools:** Git, Render (for deployment), Postman (API testing)

---

## 📂 Project Structure

root/
├── frontend/ # Vite React app
│ ├── src/
│ ├── package.json
│ └── vite.config.js
├── backend/ # Node.js/Express app
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── server.js
│ └── package.json
└── README.md


- **Frontend:** Component-based, environment-aware, built with Vite.  
- **Backend:** REST API with modular routes/controllers, environment variables for sensitive data.  

---

## ⚡ Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/project-name.git
cd project-name
```
### 2. Backend
```bash
cd backend
npm install
# Create a .env file with variables like MONGO_URI, JWT_SECRET
npm start
```
### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Backend runs on http://localhost:5000

Frontend runs on http://localhost:5173
