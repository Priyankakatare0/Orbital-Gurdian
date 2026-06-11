import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Import routers (single import block — no duplicates)
from routes.satellites import router as satellites_router
from routes.health import router as health_router
# from routes.threats import router as threats_router
from routes.recommendations import router as recommendations_router

app = FastAPI(
    title="Orbital Guardian API",
    description="Satellite monitoring and threat detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(satellites_router,    prefix="/api/satellites",    tags=["Satellites"])
app.include_router(health_router,        prefix="/api/health",        tags=["Health"])
# app.include_router(threats_router,       prefix="/api/threats",       tags=["Threats"])
app.include_router(recommendations_router, prefix="/api/recommendations", tags=["Recommendations"])


@app.get("/")
async def root():
    return {"message": "Orbital Guardian API running", "version": "1.0.0", "docs": "/docs"}


@app.get("/ping")
async def ping():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)