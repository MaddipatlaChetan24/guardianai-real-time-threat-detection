<div align="center">

# GuardianAI: Multi-Agent Intelligent Surveillance

**Proactive, autonomous threat detection and emergency coordination using a robust ecosystem of specialized AI agents.**

This project demonstrates a production-quality, multi-agent AI system designed to autonomously monitor CCTV feeds, detect anomalies, reason about threats, and coordinate emergency responses using the Google Agent Development Kit (ADK) and Model Context Protocol (MCP).


</div>

---


    subgraph "Micro-Agent Ecosystem (Google ADK & MCP)"
        VideoAgent["Video Analysis Agent<br>(YOLOv11 & DeepSORT)"]
        ThreatAgent["Threat Detection Agent<br>(Gemini Reasoning)"]
        DecisionAgent["Decision Orchestrator<br>(Threat Score 0-100)"]
        NotifyAgent["Notification Agent"]
        ReportAgent["Incident Report Agent"]
    end

    subgraph Backend
        Gateway["FastAPI Gateway<br>(REST & WebSockets)"]
        DB[(PostgreSQL & Redis)]
    end

    subgraph Frontend
        Dashboard["React Dashboard<br>(Three.js & GSAP)"]
    end

    CCTV --> VideoAgent
    VideoAgent --> ThreatAg

Start the application using Docker Compose:

```bash
docker-compose up --build -d
```

The application will be available at:
- **Dashboard:** `http://localhost:5173`
- **API Docs:** `http://localhost:8000/docs`

---

## Project Structure

```
GuardianAI/
│
├── agents/             # Google ADK Agent definitions and logic
├── backend/            # FastAPI server, routers, and schemas
├── frontend/           # React + Vite dashboard and UI components
├── mcp/                # Model Context Protocol tool definitions
├── models/             # YOLOv11 and ot
- Audio analysis integration (e.g., breaking glass, screaming).
- Integration with physical IoT devices (e.g., locking doors autonomously).
- Multi-modal embeddings vector search for advanced forensic queries (e.g., "Find the person wearing a red backpack from last week").

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
<sub>Built with Google ADK, Model Context Protocol, Gemini, FastAPI, and React.</sub>
</div>
