import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingBoxProps {
  position: [number, number, number]
  speed: number
  delay: number
}

function FloatingBox({ position, speed, delay }: FloatingBoxProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() + delay
      meshRef.current.position.y += Math.sin(time * speed) * 0.01
      meshRef.current.rotation.x += 0.003
      meshRef.current.rotation.z += 0.002
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#6366f1" metalness={0.4} roughness={0.3} />
    </mesh>
  )
}

function AnimatedText() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3
    }
  })

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <Text
        font="/fonts/Geist_Bold.json"
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
      >
        Frontend
      </Text>
      <Text
        font="/fonts/Geist_Regular.json"
        fontSize={0.5}
        color="#a1a5b4"
        anchorX="center"
        anchorY="middle"
        position={[0, -1, 0]}
      >
        Engineer
      </Text>
    </group>
  )
}

function Scene() {
  return (
    <>
      <Environment preset="studio" />
      <color attach="background" args={['#0f0f1e']} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#6366f1" />

      {/* Center text */}
      <AnimatedText />

      {/* Floating boxes around the center */}
      <FloatingBox position={[-2, 1, 0]} speed={2} delay={0} />
      <FloatingBox position={[2, -1, 0]} speed={1.5} delay={Math.PI / 2} />
      <FloatingBox position={[-2, -2, -2]} speed={1.8} delay={Math.PI} />
      <FloatingBox position={[2, 1, -2]} speed={1.3} delay={(3 * Math.PI) / 2} />
      <FloatingBox position={[0, 2.5, -3]} speed={2.2} delay={Math.PI / 4} />

      {/* Interactive controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={2}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
    </>
  )
}

export default function AnimatedScene() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
