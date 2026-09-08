import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group } from 'three';
import type { LiveViewer } from '../types/live';

type Props = {
  viewer: LiveViewer;
  index: number;
  position: [number, number, number];
  isLeader: boolean;
  visualScale: number;
};

const shirtColors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#ea580c', '#0891b2'];
const skinColors = ['#f59e0b', '#fbbf24', '#d97706', '#f4a261'];

export function Avatar3D({ viewer, index, position, isLeader, visualScale }: Props) {
  const group = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const highlighted = Boolean(viewer.highlightUntil && viewer.highlightUntil > Date.now());
  const shirt = useMemo(() => shirtColors[index % shirtColors.length], [index]);
  const skin = useMemo(() => skinColors[index % skinColors.length], [index]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * 3.6 + index * 0.72;
    const swing = Math.sin(t) * 0.5;
    const bounce = Math.abs(Math.sin(t * 0.5)) * (isLeader ? 0.1 : 0.13);

    if (group.current) {
      const current = group.current.scale.x;
      const next = current + (visualScale - current) * Math.min(1, delta * 4.8);
      group.current.scale.setScalar(next);
      group.current.position.x += (position[0] - group.current.position.x) * Math.min(1, delta * 5);
      group.current.position.z += (position[2] - group.current.position.z) * Math.min(1, delta * 5);
      group.current.position.y = position[1] + bounce;
      group.current.rotation.y = Math.sin(t * 0.5) * 0.11;
      group.current.rotation.z = Math.sin(t) * 0.04;
    }

    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing * 0.42;
    if (rightLeg.current) rightLeg.current.rotation.x = swing * 0.42;
  });

  return (
    <group ref={group} position={position} scale={visualScale}>
      {(highlighted || isLeader) && (
        <pointLight
          color={highlighted ? '#facc15' : '#fde68a'}
          intensity={highlighted ? 4.2 : 1.7}
          distance={5.5}
          position={[0, 2.2, 1.2]}
        />
      )}

      {isLeader && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry args={[1.0, 1.28, 64]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.7} />
        </mesh>
      )}

      <mesh position={[0, 2.72, 0]} castShadow>
        <boxGeometry args={[1.05, 1.05, 1.05]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>

      <mesh position={[-0.22, 2.79, 0.53]}>
        <boxGeometry args={[0.11, 0.11, 0.035]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.22, 2.79, 0.53]}>
        <boxGeometry args={[0.11, 0.11, 0.035]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 2.5, 0.54]}>
        <boxGeometry args={[0.42, 0.07, 0.035]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>

      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[1.25, 1.15, 0.72]} />
        <meshStandardMaterial color={shirt} roughness={0.6} />
      </mesh>

      <group ref={leftArm} position={[-0.82, 1.74, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.42, 1.15, 0.5]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.82, 1.74, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.42, 1.15, 0.5]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      <group ref={leftLeg} position={[-0.34, 1.05, 0]}>
        <mesh position={[0, -0.72, 0]} castShadow>
          <boxGeometry args={[0.52, 1.45, 0.62]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.34, 1.05, 0]}>
        <mesh position={[0, -0.72, 0]} castShadow>
          <boxGeometry args={[0.52, 1.45, 0.62]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      {highlighted && (
        <mesh position={[0, 1.55, -0.4]} scale={[1.55, 2.15, 1]}>
          <ringGeometry args={[0.9, 1.02, 48]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.72} />
        </mesh>
      )}

      <Html center position={[0, -0.75, 0]} distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={`avatar3d-label ${isLeader ? 'leader' : ''}`}>
          {isLeader && <span className="avatar3d-crown">👑</span>}
          <strong>@{viewer.username}</strong>
          <small>🎁 {viewer.gifts} · ❤️ {viewer.likes}{viewer.isFollowing ? ' · ➕' : ''}</small>
          {isLeader && <em>{viewer.scale.toFixed(2)}x de poder</em>}
        </div>
      </Html>
    </group>
  );
}
