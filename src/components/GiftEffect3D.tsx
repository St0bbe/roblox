import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { GiftTier } from '../types/live';

type Props = {
  tier: GiftTier;
  active: boolean;
  seed: number;
};

function pseudo(seed: number, index: number) {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function GiftEffect3D({ tier, active, seed }: Props) {
  const root = useRef<Group>(null);
  const ringA = useRef<Group>(null);
  const ringB = useRef<Group>(null);

  const particles = useMemo(() => {
    const count = tier === 'large' ? 18 : tier === 'medium' ? 12 : 8;
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const radius = 1.05 + pseudo(seed, index) * (tier === 'large' ? 1.05 : 0.6);
      const y = 0.35 + pseudo(seed + 11, index) * 2.8;
      return {
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as [number, number, number],
        scale: 0.07 + pseudo(seed + 31, index) * 0.12,
      };
    });
  }, [seed, tier]);

  useFrame((state) => {
    if (!active || !root.current) return;
    const t = state.clock.elapsedTime;
    root.current.rotation.y = t * (tier === 'large' ? 1.5 : tier === 'medium' ? 1.05 : 0.7);
    root.current.position.y = Math.sin(t * 3.2) * 0.05;

    if (ringA.current) {
      const pulse = 1 + Math.sin(t * 5.4) * 0.12;
      ringA.current.scale.setScalar(pulse);
      ringA.current.rotation.z = t * 0.9;
    }
    if (ringB.current) {
      const pulse = 1.15 + Math.cos(t * 4.6) * 0.16;
      ringB.current.scale.setScalar(pulse);
      ringB.current.rotation.z = -t * 0.7;
    }
  });

  if (!active) return null;

  const color = tier === 'large' ? '#facc15' : tier === 'medium' ? '#a855f7' : '#fb7185';
  const secondary = tier === 'large' ? '#ffffff' : tier === 'medium' ? '#22d3ee' : '#fda4af';

  return (
    <group ref={root}>
      <group ref={ringA} position={[0, 1.55, -0.72]}>
        <mesh>
          <torusGeometry args={[tier === 'large' ? 1.45 : 1.12, 0.055, 10, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      </group>

      {tier !== 'rose' && (
        <group ref={ringB} position={[0, 1.55, -0.78]} rotation={[0.35, 0.15, 0]}>
          <mesh>
            <torusGeometry args={[tier === 'large' ? 1.85 : 1.42, 0.035, 10, 64]} />
            <meshBasicMaterial color={secondary} transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position} scale={particle.scale}>
          {tier === 'rose' ? <octahedronGeometry args={[1, 0]} /> : <sphereGeometry args={[1, 10, 10]} />}
          <meshBasicMaterial color={index % 2 === 0 ? color : secondary} transparent opacity={0.9} />
        </mesh>
      ))}

      {tier === 'large' && (
        <>
          <pointLight color="#facc15" intensity={6} distance={7} position={[0, 2, 1.4]} />
          <mesh position={[0, 3.65, 0]} rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.28, 0]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </>
      )}
    </group>
  );
}
