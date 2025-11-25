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
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## 🎯 About

**InMyTime** is a modern, collaborative time polling application that makes scheduling meetings and events effortless. Simply create a poll with available time slots, share the link, and let participants vote on their availability. The app automatically highlights the best times that work for everyone.

---

## ✨ Features

- 📅 **Easy Poll Creation** — Define event titles and select multiple proposed dates/time slots
- 🔓 **Anonymous Voting** — No login required for participants to submit their availability
- 📊 **Smart Time Detection** — Automatically highlights the most popular and commonly available slots
- 🔗 **Shareable Links** — Generate unique URLs for easy poll distribution
- 📈 **Live Results** — Real-time voting visualization with animated progress bars
- 🎨 **Modern UI** — Clean, responsive design with smooth animations

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center"><strong>Framework</strong></td>
    <td>Next.js</td>
  </tr>
  <tr>
    <td align="center"><strong>Database</strong></td>
    <td>MongoDB with Mongoose</td>
  </tr>
  <tr>
    <td align="center"><strong>Frontend</strong></td>
    <td>React</td>
  </tr>
  <tr>
    <td align="center"><strong>Styling</strong></td>
    <td>Tailwind CSS</td>
  </tr>
  <tr>
    <td align="center"><strong>Animation</strong></td>
    <td>Framer Motion</td>
  </tr>
</table>

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