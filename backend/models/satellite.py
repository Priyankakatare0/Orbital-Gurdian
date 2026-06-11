from pydantic import BaseModel, Field
from typing import Optional, Union

class SatellitePosition(BaseModel):
    """Represents the geographic position of a satellite."""
    id: Optional[Union[str, int]] = Field(None, description="Unique satellite identifier.")
    name: Optional[str] = Field(None, description="Common name of the satellite.")
    norad_id: Optional[Union[str, int]] = Field(None, description="NORAD catalog ID.")
    latitude: float = Field(..., description="Latitude in degrees")
    longitude: float = Field(..., description="Longitude in degrees")
    altitude: float = Field(..., description="Altitude in kilometers above sea level")
    inclination: Optional[float] = None
    risk_score: Optional[float] = Field(None, description="Overall mission risk score (0-100)")
    health_status: Optional[str] = None

class Satellite(BaseModel):
    """
    Represents a single satellite, combining its identity, position,
    and other relevant metadata.
    """
    id: str = Field(..., description="Unique identifier for the satellite, often the NORAD ID.")
    name: str = Field(..., description="Common name of the satellite.")
    norad_id: int = Field(..., description="NORAD catalog ID.")
    
    # Positional data, often derived from TLE
    latitude: float
    longitude: float
    altitude: float # in km
    
    # Optional orbital parameters
    inclination: Optional[float] = None
    
    # Data from our agents
    risk_score: Optional[float] = Field(None, description="Overall mission risk score (0-100)")
    health_status: Optional[str] = Field(None, description="e.g., 'Nominal', 'Degraded', 'Critical'")
    
    class Config:
        orm_mode = True
        from_attributes = True
