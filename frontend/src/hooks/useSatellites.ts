'use client'

import { useEffect } from 'react'
import { useSatelliteStore } from '@/store/satelliteStore'
import { getSatellites } from '@/lib/api'

export function useSatellites() {
  const { setSatellites, setLoading, setError } = useSatelliteStore()

  useEffect(() => {
    const fetchAndSetSatellites = async () => {
      try {
        setLoading(true)
        const data = await getSatellites(20) // Fetch 20 satellites
        setSatellites(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAndSetSatellites()
  }, [setSatellites, setLoading, setError])
}