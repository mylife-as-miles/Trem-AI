# Trem-AI 🎥🤖

**The Intelligent Video Repository & Editing Suite**

> *Transform raw footage into semantic, searchable, and editable repositories using AI.*

Trem-AI is a cutting-edge video management and editing platform that leverages **Google Gemini 1.5 & 3.0** and **Whisper** to automatically analyze, transcribe, and structure video content. Built with a local-first philosophy, it processes heavy media pipelines in the background using Service Workers, allowing for a seamless and responsive user experience.

---

## ✨ Key Features

### 🧠 **AI-Powered Ingestion Pipeline**
The comprehensive ingestion engine turns chaos into order:
- **Automatic Transcription**: Uses **OpenAI Whisper** (via Replicate) to generate frame-perfect transcripts.
- **Visual Intelligence**: **Gemini 1.5 Flash** analyzes keyframes to detect scenes, objects, and actions.
- **Semantic Structuring**: **Gemini 3.0 Pro (Thinking Mode)** synthesizes transcripts and visual data to generate a cohesive repository structure with chapters, summaries, and tags.
- **Streaming Architecture**: Real-time feedback ("Thinking...") via streaming responses prevents timeouts on complex analysis tasks.

### ⚙️ **Robust Background Processing**
- **Service Worker Architecture**: All heavy lifting (transcription, analysis) happens off the main thread.
- **Parallel Execution**: Processes up to **3 videos simultaneously** for maximum throughput.
- **Resilience**: Auto-recovery from database corruption and "Cron-job" style job resumption if the tab is closed.
- **Local-First**: All metadata and job states are persisted in **IndexedDB**.

### 🎬 **Programmatic Video Editing**
- **Remotion Integration**: Edit videos using React components.
- **Timeline Editor**: Visualize scenes, trim clips, and arranging your narrative.
- **Dynamic Rendering**: Preview changes instantly in the browser.

### 🚀 **Modern Dashboard Experience**
- **Glassmorphic Design**: A premium, "Space-Age" UI with fluid animations.
- **Real-Time Logs**: Watch the AI "think" and process your assets live.
- **Workspace Management**: Organize repositories into distinct workspaces.

---

## 🛠️ Tech Stack

### Core
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + Custom CSS Variables.

### AI & Processing
- **LLM**: [Google Gemini 1.5 Flash](https://deepmind.google/technologies/gemini/) (Analysis) & [Gemini 3.0 Pro](https://deepmind.google/technologies/gemini/) (Synthesis).
- **Transcription**: [Whisper](https://github.com/openai/whisper) (via Replicate).
- **Background Tasks**: Service Workers + [Workbox](https://developer.chrome.com/docs/workbox/).
- **Storage**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via custom wrapper).

### Video Engine
- **Editing**: [Remotion](https://www.remotion.dev/).
- **Media Handling**: [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) (experimental).

---

## 🚀 Getting Started

### Prerequisites
- Node.js > 18
- NPM or Yarn
- **Google Gemini API Key**
- **Replicate API Key** (for Whisper)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/trem-ai.git
   cd trem-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key_here
   VITE_REPLICATE_API_TOKEN=your_replicate_token_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    User[User Uploads Video] --> MainThread[Main Thread]
    MainThread -->|Extract Frames & Audio| JobDB[(IndexedDB - Pending Jobs)]
    MainThread -->|Msg: START_JOB| SW[Service Worker]
    
    subgraph "Service Worker (Background)"
        SW -->|Batch Read| JobDB
        SW -->|Parallel 3x| Pipeline
        
        subgraph "Ingestion Pipeline"
            Pipeline -->|Audio Blob| Whisper[Whisper API]
            Pipeline -->|Frames| GeminiFlash[Gemini 1.5 Flash]
            Whisper --> Transcript
            GeminiFlash --> TagsDescription
        end
        
        Pipeline -->|Aggregation| GeminiPro[Gemini 3.0 Pro Thinking]
        GeminiPro -->|Stream "Thinking..."| UILogs[UI Logs]
        GeminiPro --> RepoStructure[Repo JSON]
        RepoStructure -->|Update| JobDB
    end
    
    JobDB -->|Msg: READY_TO_COMMIT| MainThread
    MainThread --> CommitUI[Commit Interaction]
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
