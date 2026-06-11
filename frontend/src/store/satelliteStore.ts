import { create } from 'zustand'
import { Satellite, Telemetry } from '@/types'

interface SatelliteState {
  satellites: Satellite[]
  selectedId: string | null
  selectedSatellite: Satellite | null
  loading: boolean
  error: string | null
  latestTelemetry: Record<string, Partial<Telemetry>> // Store telemetry updates by satellite ID
  setSatellites: (satellites: Satellite[]) => void
  setSelectedId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateTelemetry: (telemetry: Partial<Telemetry> & { satellite_id: string }) => void
}

export const useSatelliteStore = create<SatelliteState>((set, get) => ({
  satellites: [],
  selectedId: null,
  selectedSatellite: null,
  loading: true,
  error: null,
  latestTelemetry: {},
  setSatellites: (satellites) => {
    set({ satellites, loading: false })
    // If a satellite is selected, update its data from the new list
    if (get().selectedId) {
      const newSelected = satellites.find((s) => s.id === get().selectedId)
      set({ selectedSatellite: newSelected || null })
    }
  },
  setSelectedId: (selectedId) => {
    const selected = get().satellites.find((s) => s.id === selectedId)
    set({ selectedId, selectedSatellite: selected || null })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateTelemetry: (telemetry) => {
    const { satellite_id, ...rest } = telemetry
    if (!satellite_id) return

    set((state) => {
      // Update the specific satellite in the main list
      const updatedSatellites = state.satellites.map((s) => {
        if (s.id === satellite_id) {
          // Merge new telemetry data with existing satellite data
          return { ...s, ...rest }
        }
        return s
      })

      // Update the selected satellite if it's the one being updated
      const updatedSelectedSatellite =
        state.selectedId === satellite_id
          ? updatedSatellites.find((s) => s.id === satellite_id)
          : state.selectedSatellite

      return {
        satellites: updatedSatellites,
        selectedSatellite: updatedSelectedSatellite || null,
        latestTelemetry: {
          ...state.latestTelemetry,
          [satellite_id]: {
            ...(state.latestTelemetry[satellite_id] || {}),
            ...rest,
          },
        },
      }
    })
  },
}))