'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { latLngToVector3 } from '@/lib/utils'
import type { Satellite } from '@/types'

interface SatelliteMarkerProps {
  satellite: Satellite
  isSelected: boolean
  onClick: () => void
}

export const SatelliteMarker = ({ satellite, isSelected, onClick }: SatelliteMarkerProps) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [isHovered, setIsHovered] = useState(false)

  const position = latLngToVector3(
    satellite.latitude,
    satellite.longitude,
    1 + satellite.altitude / 6371
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const targetScale = isSelected || isHovered ? 1.8 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10)
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? '#f59e0b' : '#ffffff'}
        emissive={isSelected ? '#f59e0b' : '#ffffff'}
        emissiveIntensity={isSelected ? 2 : 0.5}
      />
      {(isHovered || isSelected) && (
        <Html distanceFactor={5}>
          <div className='-translate-x-1/2 mt-2 rounded-lg bg-slate-800/80 px-2 py-1 text-xs text-white shadow-lg backdrop-blur-sm'>
            {satellite.name}
          </div>
        </Html>
      )}
    </mesh>
  )
}