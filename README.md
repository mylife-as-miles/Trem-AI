# Trem AI - Video Agent Hub

Trem AI is a cutting-edge **Video Agent Hub** designed to revolutionize video content creation and management. It leverages advanced AI models (Gemini, Whisper) and programmatic video tools (Remotion) to provide a unified dashboard for ingesting, editing, and generating video content.

![Trem AI Dashboard](https://via.placeholder.com/800x450?text=Trem+AI+Dashboard+Preview)

## 🚀 Key Features

### 🤖 AI-Powered Workflow
- **Intelligent Ingestion**: Automatically analyzes video assets using **Gemini 1.5 Pro/Flash** to generate metadata, detecting scene boundaries, and understanding visual context.
- **Audio Intelligence**: Integrated **Whisper** transcription for generating accurate subtitles and analyzing spoken content.
- **AI Co-Pilot**: Context-aware chat assistant that helps with editing decisions, script generation, and technical troubleshooting.

### 🎬 Advanced Video Editing
- **Timeline Editor**: A React-based non-linear editor (NLE) support drag-and-drop clips, multi-track sequencing, and real-time previews.
- **Programmatic Creation**: Built with **Remotion**, allowing for code-based video generation, dynamic templates, and automated rendering.
- **Diff & Merge**: Unique "Git for Video" interface (`CompareDiffView`) to visualize changes between video versions and merge AI-suggested edits.

### 📂 Repository Management
- **Video Repositories**: Organize projects into "repos" with version control concepts.
- **Asset Library**: Centralized management for raw footage, audio files, and generated assets.
- **Activity Logs**: Track every change, commit, and AI action within a project.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + Vanilla CSS for custom animations
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Video Engine**: [Remotion](https://www.remotion.dev/)
- **AI Integration**: 
  - [Google Generative AI SDK](https://www.npmjs.com/package/@google/genai) (Gemini)
  - [Replicate](https://replicate.com/) (Whisper, Stable Diffusion)
- **UI Components**: 
  - `@dnd-kit` for drag-and-drop interactions
  - `lucide-react` & `Material Icons` for iconography
  - `three` / `@react-three/fiber` for 3D elements

## 📂 Project Structure

The project follows a modern, scalable feature-based architecture under the `src/` directory:

```
src/
├── components/          # Shared building blocks
│   ├── layout/          # Orchestrator, Sidebar, Header
│   └── ui/              # Generic UI components (Dialogs, Grids)
├── dashboard/           # Main Feature Views
│   ├── create/          # Remotion Studio & Repo Ingestion
│   ├── edit/            # Timeline Editor & Agent Chat
│   ├── repo/            # Repository Overview, Files, logs
│   ├── assets/          # Global Asset Library
│   └── settings/        # App Configuration
├── services/            # API Integrations (Gemini, Whisper)
├── store/               # Global Zustand Store
├── utils/               # Helpers (DB, Formatting)
└── App.tsx              # Main Routing & Layout
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Google Cloud Project with the **Gemini API** enabled.
- An account on **Replicate** (for Whisper transcriptions).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/trem-ai.git
    cd trem-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # Note: If you encounter peer dependency warnings, you can use --legacy-peer-deps
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    
    Update the keys in `.env`:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    VITE_REPLICATE_API_TOKEN=your_replicate_api_token_here
    ```

### Running the App

Start the development server:
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000`.

### Building for Production

Compile the application for deployment:
```bash
npm run build
```
The output will be generated in the `dist/` directory.

## 📖 Usage Guide

1.  **Create a Repo**: Go to **New Repo** in the sidebar. meaningful name and upload your raw assets.
2.  **Ingest Content**: The AI will analyze your uploads. You can see the progress in the "Active Processing" section.
3.  **Edit**: Open the **Timeline** to arrange clips. Use the **AI Co-pilot** on the right to ask for changes like "Make the pacing faster" or "Add captions."
4.  **Review Changes**: If the AI proposes an edit, navigate to the **Compare/Diff** view to see a side-by-side comparison of the original vs. the AI version.
5.  **Export**: Click **Export** to render your final video using Remotion.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feature/amazing-feature`.
3.  Commit your changes: `git commit -m 'Add amazing feature'`.
4.  Push to the branch: `git push origin feature/amazing-feature`.
5.  Open a Pull Request.

---

**Trem AI** — Empowering creators with Agentic Video Workflows.
