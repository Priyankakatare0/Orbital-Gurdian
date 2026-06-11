from pydantic import BaseModel, Field
from typing import Optional

class MissionRisk(BaseModel):
    """
    Represents the overall mission risk assessment for a satellite,
    as determined by the decision agent.
    """
    mission_risk: float = Field(..., description="Overall mission risk score (0-100)")
    risk_level: str = Field(..., description="Categorical risk level ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')")
    
    # Contributing factors from other agents
    collision_risk: float = Field(..., description="Risk score related to potential collisions (0-100)")
    health_score: float = Field(..., description="Satellite health score (0-100)")
    
    # Key telemetry data influencing the decision
    battery: float = Field(..., description="Current battery level percentage")
    can_maneuver: bool = Field(..., description="Indicates if the satellite has enough power to maneuver")
    
    # Optional details
    details: Optional[str] = Field(None, description="A summary of the risk factors")

    class Config:
        orm_mode = True
        from_attributes = True