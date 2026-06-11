'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import type { Satellite } from '@/types'

interface OrbitPathProps {
  satellite: Satellite
}

export const OrbitPath = ({ satellite }: OrbitPathProps) => {
  const points = useMemo(() => {
    const path = []
    const orbitRadius = 1 + (satellite.altitude ?? 0) / 6371
    const inclination = (satellite.inclination ?? 0) * (Math.PI / 180)

    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * 2 * Math.PI
      const x = orbitRadius * Math.cos(angle)
      const z = orbitRadius * Math.sin(angle)
      // Apply inclination
      const y = z * Math.sin(inclination)
      const newZ = z * Math.cos(inclination)
      path.push(new THREE.Vector3(x, y, newZ))
    }
    return path
  }, [satellite.altitude, satellite.inclination])

  if (!points.length) {
    return null
  }

  return (
    <Line
      points={points}
      color='#4ade80'
      lineWidth={1.5}
      transparent
      opacity={0.7}
    />
  )
}