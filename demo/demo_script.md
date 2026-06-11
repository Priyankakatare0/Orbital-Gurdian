# Orbital Guardian - Demo Script

## Overview
This is a word-for-word walkthrough demonstrating the Orbital Guardian satellite monitoring system in action.

---

## Demo Flow

### 1. Opening the Application

**Narrator:**
"Welcome to Orbital Guardian, an AI-powered satellite monitoring system. Let me walk you through how it works."

*Open browser to `http://localhost:3000`*

**You will see:**
- A 3D interactive globe showing Earth
- Real-time satellite positions marked as red dots
- Orbital paths visualized as green lines

**Narrator:**
"The main dashboard shows active satellites orbiting Earth in real-time. You can see the International Space Station and other critical satellites."

---

### 2. Selecting a Satellite

**Narrator:**
"Let's click on the International Space Station to see more details."

*Click on ISS in the satellite list on the left panel*

**You will see:**
- Satellite name: "ISS (ZARYA)"
- NORAD ID: 25544
- Current position (latitude, longitude, altitude)
- Orbital parameters (inclination, period, velocity)

---

### 3. Health Monitoring

**Narrator:**
"Here's the health status dashboard. The system continuously monitors battery levels, temperature, and signal strength."

*Point to the Health Status card*

**You will see:**
- Battery: 85% (GREEN - Good)
- Temperature: 25°C (Optimal)
- Signal Strength: 92% (Strong)

**Narrator:**
"All systems are healthy. If any metric falls below thresholds, you'd see warnings."

---

### 4. Risk Assessment

**Narrator:**
"The system calculates collision threat levels by analyzing proximity to other satellites."

*Point to the Risk Card*

**You will see:**
- Risk Score: 15/100
- Status: LOW

**Narrator:**
"With only a few satellites nearby at safe distances, the risk is minimal. But if this were higher, the system would alert you."

---

### 5. AI Recommendations

**Narrator:**
"Our AI system uses Google Gemini to provide intelligent recommendations based on current conditions."

*Point to the Recommendation Card*

**You will see:**
- "Monitor closely and continue routine operations"
- Priority: MEDIUM
- Actions:
  - Check telemetry
  - Verify position
  - Update logs

---

### 6. Real-time Alerts

**Narrator:**
"The system provides real-time alerts for any anomalies or critical situations."

*If there are active alerts, they appear at the top:*

- "⚠️ High Temperature Detected"
- "🛰️ Collision Warning - ISS"
- "🔋 Battery Critical"

---

### 7. Testing the Threat Detection

**Narrator:**
"Let me demonstrate the threat detection by simulating nearby satellites."

*Use API endpoint to increase nearby satellite count:*

```bash
curl -X POST "http://localhost:8000/api/threats/calculate?satellite_name=ISS&latitude=45.32&longitude=-75.69&altitude=400&nearby_count=5"
```

*Refresh the page*

**You will see:**
- Risk Score increases to ~45/100
- Status: MEDIUM
- Message: "MONITOR CLOSELY"

---

### 8. Health Anomaly Detection

**Narrator:**
"The health monitoring system uses machine learning to detect anomalies in telemetry data."

*Use API endpoint to test anomaly detection:*

```bash
curl -X POST "http://localhost:8000/api/health/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "satellite_name": "ISS",
    "timestamp": "2024-01-15T10:30:00Z",
    "battery_percentage": 5,
    "temperature_celsius": 85,
    "signal_strength": 10
  }'
```

**You will see:**
- Health Status shows: "CRITICAL"
- Multiple warnings appear:
  - Battery low
  - Temperature out of range
  - Weak signal strength
  - Anomalous reading detected

---

### 9. AI Recommendation Updates

**Narrator:**
"Notice how the AI recommendation changes based on the new risk level."

*The system automatically updates:*

- Recommendation: "URGENT: Monitor closely and prepare evasive maneuvers"
- Priority: HIGH
- Actions adapted to the critical situation

---

### 10. Satellite Details View

**Narrator:**
"Let's dive deeper into a specific satellite."

*Click on satellite name or "View Details"*

**You will see:**
- Complete orbital parameters:
  - Semi-major axis
  - Eccentricity
  - Mean anomaly
  - Orbital period
- Historical telemetry graph
- Trends and forecasts

---

## API Endpoints Demonstrated

### Satellite Endpoints
```
GET  /api/satellites           # Get all satellites
GET  /api/satellites/{id}      # Get satellite by ID
GET  /api/satellites/{id}/telemetry  # Get telemetry data
POST /api/satellites/search    # Search satellites
```

### Health Endpoints
```
GET  /api/health/satellites    # Get health for all
GET  /api/health/{name}        # Get specific health
POST /api/health/analyze       # Analyze with custom data
```

### Threat Endpoints
```
GET  /api/threats/{name}       # Get threat for satellite
POST /api/threats/calculate    # Calculate with custom params
```

### Recommendation Endpoints
```
GET  /api/recommendations/{name}     # Get recommendation
POST /api/recommendations/generate   # Generate with custom data
```

---

## Key Features Highlighted

1. **Real-time 3D Visualization** - Interactive globe with live satellite positions
2. **Collision Detection** - Analyzes proximity of satellites
3. **Health Monitoring** - Tracks battery, temperature, signal strength
4. **Anomaly Detection** - ML-based anomaly identification
5. **AI Recommendations** - Gemini-powered intelligent insights
6. **Multi-level Risk Assessment** - Combines threat + health metrics
7. **Live Updates** - Supabase real-time subscriptions (when configured)
8. **Comprehensive Dashboard** - All metrics at a glance

---

## Demo Talking Points

- **Problem Solved:** Space debris and collision risks are critical threats to satellite missions
- **Solution:** Orbital Guardian provides automated, AI-powered monitoring
- **Technology:** FastAPI backend, Next.js frontend, Three.js 3D, scikit-learn ML
- **Data:** Real TLE data from CelesTrak API + simulated telemetry
- **Scalability:** Built with production-ready architecture (Supabase, Railway deployment)

---

## Conclusion

**Narrator:**
"Orbital Guardian demonstrates how AI and advanced analytics can provide mission-critical insights for satellite operations. The system is designed to scale to thousands of satellites and can integrate with real ground stations for operational deployment."

---

## Troubleshooting

If the demo doesn't work:

1. Verify backend is running: `python main.py` (port 8000)
2. Verify frontend is running: `npm run dev` (port 3000)
3. Check environment variables in `.env`
4. Ensure database schema is initialized in Supabase
5. Check browser console for errors: `F12`

---

## Notes

- Screenshots should be placed in `demo/screenshots/` for README
- All times shown are UTC
- Risk scores range from 0 (safe) to 100 (critical)
- The system updates satellite positions every 30 seconds by default
