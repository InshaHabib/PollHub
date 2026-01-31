# 🗳️ PollHub

An interactive **Online Polling and Survey Website** that allows users to create polls, participate in voting, and view results in **real-time**. The platform supports authentication, live vote updates, poll expiration, and data visualization.

---

## 🚀 Features

### 🔐 User Authentication

* User registration and login
* Secure authentication using **JWT** or session-based auth
* Only logged-in users can create polls

### 📝 Create Polls / Surveys

* Create polls with:

  * Question
  * Multiple options
  * Single-choice or multiple-choice voting
* Set poll **expiration date & time**
* Poll automatically closes after expiration

### ⚡ Real-Time Voting

* Users can vote on active polls
* Votes update **live** for all users
* Real-time communication using **Socket.io / WebSockets**

### 📊 View Poll Results

* Live poll results
* Interactive charts:

  * Bar chart
  * Pie chart
* Automatic updates as new votes are cast

### 🔍 Search & Browse Polls

* Browse polls by category:

  * Sports
  * Politics
  * Technology
  * Others
* Filter polls by:

  * Active
  * Closed
  * Upcoming

### ☑️ Poll Types

* Single-choice
* Multiple-choice

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* Chart.js

### Backend

* Node.js
* Express.js
* Socket.io
* JWT Authentication

### Database

* MongoDB
* Mongoose

---

## 📁 Project Structure

```
PollHub
│── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── App.css
│   ├── .env
│   └── package.json
│
│── backend/                # Node + Express Backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   ├── .env
│   └── package.json
│
│── README.md
```
---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/InshaHabib/PollHub.git
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
node server.js
```

Create a `.env` file in `backend` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Real-Time Functionality

* Socket.io listens for new votes
* Emits vote updates to all connected clients
* Charts update instantly without page refresh

---

## 📌 Future Enhancements

* Admin dashboard
* Poll sharing via link
* Anonymous voting option
* Email notifications
* Export poll results (PDF / CSV)

---

## 👩‍💻 Author

**Insha Habib**
MERN Stack Developer | React | Node.js | MongoDB

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
