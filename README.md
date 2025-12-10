<p align="center">
  <img src="https://github.com/user-attachments/assets/f964b2ef-7ca7-4797-bf36-56684bf872ef" alt="InMyTime Logo" width="150" />
</p>

<h1 align="center">InMyTime</h1>

<p align="center">
  <strong>Find the perfect time for everyone</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#api-routes">API Routes</a> •
  <a href="#data-model">Data Model</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#running-tests">Running Tests</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## 🎯 About

**InMyTime** is a collaborative scheduling and polling application built with **Next.js (App Router)** and **MongoDB**.  
Users can create polls, propose multiple time slots, share links, and collect votes.  
The system aggregates availability to highlight the best meeting times for everyone.

---

## ✨ Features

- 📅 Create polls with multiple time slots  
- 🔓 Anonymous voting (no login required)  
- 📊 Aggregated availability calculation  
- 🔗 Shareable poll links  
- 📈 Live results visualization  
- 🎨 Modern UI with Tailwind + Framer Motion  
- 🧪 Unit & integration tests with Jest  
- ⚡ CI/CD integration with GitHub Actions  

---

## 🛠️ Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | Next.js (App Router) |
| Language     | TypeScript |
| Database     | MongoDB + Mongoose |
| Frontend     | React, Tailwind CSS |
| Animations   | Framer Motion |
| Testing      | Jest + @testing-library |
| Utilities    | Custom hooks + shared helpers |
| Linting      | ESLint, Prettier |

---

## 📡 API Routes

- GET /api/polls — Returns all polls
- POST /api/polls — Creates a new poll
- GET /api/polls/:id — Returns poll details by ID
- POST /api/polls/:id/vote — Adds a vote to a specific slot
- GET /api/polls/:id/results — Returns vote counts + the most popular slot

---

## 🧩 Data Model

```ts
{
  _id: ObjectId,
  title: String,
  slots: [
    {
      _id: ObjectId,
      date: String,
      votes: [String]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📂 Project Structure

in_my_time/ 
├── app/                # Next.js App Router pages & API routes 
│ ├── api/              # Backend API endpoints (polls, votes, etc.) 
│ └── components/       # Reusable UI components 
├── lib/                # Utility functions (date ranges, slot generation, etc.) 
├── tests/              # Unit & integration tests 
│ ├── unit/             # Utility and component tests 
│ └── integration/      # API and model tests 
├── public/             # Static assets (images, icons) 
├── package.json        # Dependencies and scripts 
└── README.md           # Project documentation

---

## 🧪 Running Tests

Run unit tests:
```bash
  npm test
```

Run in watch mode:
```bash
  npm run test:watch
```

Run linting:
```bash
  npm run lint
```
---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**
```bash
  git clone <repository-url>
  cd in_my_time
```

2. **Install dependencies**
```bash
  npm install
```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
```env
  MONGODB_URI=your_mongodb_connection_string
```

4. **Start the development server**
```bash
  npm run dev
```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

1. **Create a Poll** — Set up your event with a title and available time slots
2. **Share the Link** — Send the unique poll URL to participants
3. **Collect Votes** — Participants select their available times
4. **View Results** — See which times work best for everyone

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for better scheduling
</p>