"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 55;
const ACCENT_COUNT = 12;
const CONNECTION_THRESHOLD = 1.7;

const ACCENT_COLORS = ["#60a5fa", "#a78bfa", "#34d399", "#f59e0b", "#f87171", "#14b8a6"];

export function ParticleNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 4,
      ),
      isAccent: i < ACCENT_COUNT,
      color: ACCENT_COLORS[i % ACCENT_COLORS.length],
    }));
  }, []);

  const edges = useMemo(() => {
    const result: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].pos.distanceTo(nodes[j].pos) < CONNECTION_THRESHOLD) {
          result.push([nodes[i].pos, nodes[j].pos]);
        }
      }
    }
    return result;
  }, [nodes]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0006;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#a78bfa" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />

      <group ref={groupRef}>
        {edges.map(([a, b], i) => (
          <Line
            key={i}
            points={[a, b]}
            color="#1e3a5f"
            lineWidth={0.5}
            transparent
            opacity={0.35}
          />
        ))}
        {nodes.map((node, i) => (
          <Sphere key={i} args={[node.isAccent ? 0.065 : 0.032, 8, 8]} position={node.pos}>
            <meshStandardMaterial
              color={node.isAccent ? node.color : "#334155"}
              emissive={node.isAccent ? node.color : "#1e293b"}
              emissiveIntensity={node.isAccent ? 0.45 : 0.08}
            />
          </Sphere>
        ))}
      </group>
    </>
  );
}
