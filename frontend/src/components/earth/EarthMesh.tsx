import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

// Free high-res Earth texture from NASA (public domain)
const EARTH_TEXTURE = 'https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg'
export default function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture  = useLoader(TextureLoader, EARTH_TEXTURE)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
