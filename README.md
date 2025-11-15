# 📅 InMyTime: Collaborative Time Polling App

InMyTime is a simple and effective polling application designed to easily determine the **best common availability** for all participants. Scheduling meetings or events just got easier!

---

## ✨ Key Features

This application is designed to optimize the user experience while solving scheduling problems:

* **Easy Poll Creation:** Define the event title and select multiple proposed dates/time slots.
* **Anonymous Polling:** Users can submit their availability without requiring authentication (login/registration).
* **Common Time Detection:** Visual representation of all votes, with automatic highlighting of the most popular and commonly available time slots.
* **Shareable Links:** Easily distribute a unique URL for participants to access and vote on the poll.
* **Live Polling Visualization:** Displays real-time voting results with modern and animated progress bars.

---

## 🚀 Technologies Used (Next.js Full-Stack)

This project combines the **Next.js** framework and **MongoDB** to provide comprehensive full-stack capabilities:

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Full-Stack Framework** | **Next.js** | Combines functionalities like React, Server Side Rendering, Routing, and API Routes into a single structure. |
| **Database** | **MongoDB** | The NoSQL database for storing poll and voting data (typically managed via Mongoose). |
| **Frontend** | **React** | The core library used for building the user interface. |
| **Styling** | **Tailwind CSS** | Used for fast, utility-first, and responsive UI design. |
| **Animation** | **Framer Motion** | For smooth and interactive animations in the frontend. |

---

## ⚙️ Installation and Setup

Follow the steps below to run the application locally. There is no longer a need for a separate `backend/` folder as Next.js handles both:

### Prerequisites

* **Node.js** (v18+ recommended)
* **npm** (v9+ recommended)
* **MongoDB** (A running local instance or a cloud-hosted MongoDB Atlas account)

### Configuration

To store sensitive data and the database connection string, create a file named `.env.local` in the project's **Root Directory**: