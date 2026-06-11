// frontend/src/hooks/useRealtime.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSatelliteStore } from '@/store/satelliteStore'

export function useRealtime() {
  const { selectedId } = useSatelliteStore()

  useEffect(() => {
    if (!selectedId) return

    const channel = supabase
      .channel('telemetry-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'telemetry',
        filter: `satellite_id=eq.${selectedId}`
      }, (payload) => {
        console.log('Real-time telemetry update:', payload)
        // Update health display in real-time
        if (payload.new) {
          useSatelliteStore.getState().updateTelemetry(payload.new)
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [selectedId])
}
