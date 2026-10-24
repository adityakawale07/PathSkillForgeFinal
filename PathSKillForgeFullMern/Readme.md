# PathSkillForge 🎓⚡
> **An AI-Powered Learning Assistant**  
> TY B.Sc. Computer Science Project — Savitribai Phule Pune University

PathSkillForge is a full-stack MERN application that helps students upload PDFs, chat with documents, study with interactive 3D flashcards, take self-assessment quizzes with past question reviews, and track learning progress with SVG analytics.

## 🚀 Features
- **PDF Upload & Text Extraction:** Read academic PDFs and extract content using `pdf-parse`.
- **Document Chat & Summary:** Fast natural language Q&A and executive summaries powered by Groq LPU Cloud.
- **Interactive 3D Flashcards:** 3D flip animations, difficulty settings, favorites, audio pronunciation, and mastery progress bar.
- **Self-Assessment Quizzes:** Configurable question counts, difficulty levels, auto-grading, and full past quiz reviews.
- **Study Analytics:** SVG score progression curve and study hours tracking.
- **Profile & Settings:** Student profile details, password updates, and theme toggling.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, Multer, `pdf-parse`
- **Database:** MongoDB (Mongoose)
- **AI Inference:** Groq SDK (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`)
- **Authentication:** JWT & `bcryptjs`

## ⚙️ How to Run the Project (Step-by-Step)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/PathSkillForge.git
cd PathSkillForge

2. Backend Setup
Open a terminal and navigate into the backend folder:

cd backend
npm install
npm run dev

You should see:
MongoDB connected successfully
Server running on port 5000

3. Frontend Setup
Open a second terminal tab or window and navigate into the frontend folder:

cd frontend
npm install
npm run dev

You should see:
Local: http://localhost:5173/
