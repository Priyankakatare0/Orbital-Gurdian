// frontend/src/hooks/useRealtime.ts
import { useEffect } from 'react'
import { useSatelliteStore } from '@/store/satelliteStore'
import { getSatelliteHealth } from '@/lib/api'

export function useRealtime() {
  const { selectedSatellite } = useSatelliteStore()

  useEffect(() => {
    if (!selectedSatellite) return

    // Create a ref to hold the latest selectedSatellite for the interval
    const currentSatellite = selectedSatellite
    
    // Fetch health data function
    const fetchHealthData = async () => {
      try {
        const noradId = String(currentSatellite.norad_id)
        const healthData = await getSatelliteHealth(noradId, currentSatellite.name)
        
        // Update store with the health data - use satellite.id as the key
        useSatelliteStore.getState().updateTelemetry({
          satellite_id: currentSatellite.id,
          battery: healthData.battery,
          temperature: healthData.temperature,
          signal: healthData.signal,
          battery_percentage: healthData.battery,
          temperature_celsius: healthData.temperature,
          signal_strength: healthData.signal
        })
      } catch (error) {
        console.error('Failed to fetch health data:', error)
      }
    }

    // Fetch immediately
    fetchHealthData()

    // Set up interval to refresh every 10 seconds
    const intervalId = setInterval(fetchHealthData, 10000)

    // Cleanup interval on unmount or satellite change
    return () => {
      clearInterval(intervalId)
    }
  }, [selectedSatellite?.id]) // Only re-run if the satellite ID changes, not the entire object
}