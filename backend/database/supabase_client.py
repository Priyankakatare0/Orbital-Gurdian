import os
from supabase import create_client, Client
from typing import Optional

class SupabaseClient:
    """Supabase database client singleton."""
    
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client."""
        if cls._instance is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
            
            cls._instance = create_client(supabase_url, supabase_key)
        
        return cls._instance
    
    @classmethod
    def insert_satellite(cls, data: dict) -> dict:
        """Insert or update satellite record."""
        client = cls.get_client()
        response = client.table("satellites").upsert(data).execute()
        return response.data
    
    @classmethod
    def get_satellite(cls, satellite_id: str) -> dict:
        """Get satellite by ID."""
        client = cls.get_client()
        response = client.table("satellites").select("*").eq("id", satellite_id).execute()
        return response.data[0] if response.data else None
    
    @classmethod
    def insert_telemetry(cls, data: dict) -> dict:
        """Insert telemetry record."""
        client = cls.get_client()
        response = client.table("telemetry").insert(data).execute()
        return response.data
    
    @classmethod
    def insert_risk_assessment(cls, data: dict) -> dict:
        """Insert risk assessment record."""
        client = cls.get_client()
        response = client.table("risk_assessments").upsert(data).execute()
        return response.data
    
    @classmethod
    def get_recent_telemetry(cls, satellite_id: str, limit: int = 100) -> list:
        """Get recent telemetry for a satellite."""
        client = cls.get_client()
        response = client.table("telemetry")\
            .select("*")\
            .eq("satellite_id", satellite_id)\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()
        return response.data
