# Orbital Guardian 🛰️

An AI-powered satellite monitoring system that provides real-time collision threat detection, health monitoring, and intelligent recommendations for satellite operations.

## Features

- **Real-time 3D Visualization**: Interactive 3D globe showing satellite positions and orbits
- **Threat Detection**: Automated collision risk assessment using machine learning
- **Health Monitoring**: Battery, temperature, and signal strength tracking with anomaly detection
- **AI Recommendations**: Gemini-powered insights for mission-critical decisions
- **Live Updates**: Real-time data synchronization via Supabase

## Project Structure

- **frontend/**: Next.js 14 with TypeScript and Three.js for 3D visualization
- **backend/**: FastAPI with Python agents for threat/health analysis
- **demo/**: Demonstration scripts and screenshots

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Supabase account
- Google Gemini API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

### Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

## Demo

See [demo/demo_script.md](demo/demo_script.md) for a word-for-word walkthrough of the system in action.

## Architecture

### Frontend
- **3D Globe**: Three.js with satellite markers and orbit paths
- **Dashboard**: Real-time satellite list and risk assessment
- **Real-time Updates**: Supabase subscriptions for live data
- **State Management**: Zustand for global state

### Backend
- **Threat Agent**: Calculates collision risks based on TLE data
- **Health Agent**: Detects anomalies in telemetry using Isolation Forest
- **Decision Agent**: Combines risk signals into overall threat level
- **Recommendation Agent**: Uses Gemini to provide actionable insights

## Database Schema

See [backend/database/schema.sql](backend/database/schema.sql) for the complete database schema.

## License

MIT
