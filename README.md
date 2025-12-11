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
  <a href="#usage">Usage</a> •
  <a href="#api-routes">API Routes</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## About

**InMyTime** is a collaborative scheduling and polling application built with **Next.js (App Router)** and **MongoDB**.  
Users can create polls, propose multiple time slots, share links, and collect votes.  
The system aggregates availability to highlight the best meeting times for everyone.  
Realtime updates are powered by **Ably**.

---

## Features

- Create polls with multiple time slots  
- Anonymous voting (no login required)  
- Aggregated availability calculation  
- Shareable poll links  
- Live results visualization with realtime updates (Ably)  
- Modern UI with Tailwind + Framer Motion  
- CI/CD integration with GitHub Actions  

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Framework    | ![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white) Next.js (App Router) |
| Language     | ![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white) TypeScript |
| Database     | ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) MongoDB + Mongoose |
| Frontend     | ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) React |
| Styling      | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) Tailwind CSS |
| Animations   | ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF.svg?style=for-the-badge&logo=framer&logoColor=white) Framer Motion |
| Realtime     | ![Ably](https://img.shields.io/badge/Ably-EA5C5C.svg?style=for-the-badge&logo=ably&logoColor=white) Ably |
| Testing      | ![Jest](https://img.shields.io/badge/Jest-C21325.svg?style=for-the-badge&logo=jest&logoColor=white) + @testing-library |
| Linting      | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white) ESLint |

---

## Usage

1. Create a poll with a title and time slots  
2. Share the unique poll link with participants  
3. Collect votes anonymously  
4. Finalize the poll to confirm the chosen time  

---

## API Routes

- **POST /api/polls** — Create a new poll  
- **GET /api/polls/:id** — Get poll details by ID  
- **POST /api/polls/:id/vote** — Add a vote to a specific slot  
- **POST /api/polls/:id/finalize** — Finalize a poll  

---

## Project Structure

```
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
```

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