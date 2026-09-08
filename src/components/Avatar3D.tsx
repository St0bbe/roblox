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

const shirtColors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#ea580c', '#0891b2', '#e11d48', '#9333ea'];
const pantsColors = ['#111827', '#1f2937', '#172554', '#3f3f46', '#0f172a', '#312e81'];
const skinColors = ['#f7c59f', '#e5a66f', '#c9834d', '#8f552f', '#f0b77d', '#d9905a'];
const hairColors = ['#111827', '#3f2d20', '#7c2d12', '#d97706', '#111111', '#5b3a29'];
const accentColors = ['#facc15', '#38bdf8', '#f472b6', '#4ade80', '#fb923c', '#c084fc'];

function hashUsername(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

export function Avatar3D({ viewer, index, position, isLeader, visualScale }: Props) {
  const group = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);

  const highlighted = Boolean(viewer.highlightUntil && viewer.highlightUntil > Date.now());
  const seed = useMemo(() => hashUsername(viewer.username), [viewer.username]);
  const shirt = shirtColors[seed % shirtColors.length];
  const pants = pantsColors[(seed >>> 2) % pantsColors.length];
  const skin = skinColors[(seed >>> 4) % skinColors.length];
  const hair = hairColors[(seed >>> 6) % hairColors.length];
  const accent = accentColors[(seed >>> 8) % accentColors.length];
  const hairStyle = seed % 4;
  const faceStyle = (seed >>> 3) % 3;
  const accessory = (seed >>> 5) % 5;
  const danceStyle = (seed >>> 7) % 3;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * (3.35 + danceStyle * 0.18) + index * 0.72;
    const swing = Math.sin(t) * (danceStyle === 1 ? 0.68 : 0.5);
    const bounce = Math.abs(Math.sin(t * 0.5)) * (isLeader ? 0.1 : danceStyle === 2 ? 0.18 : 0.13);

    if (group.current) {
      const current = group.current.scale.x;
      const next = current + (visualScale - current) * Math.min(1, delta * 4.8);
      group.current.scale.setScalar(next);
      group.current.position.x += (position[0] - group.current.position.x) * Math.min(1, delta * 5);
      group.current.position.z += (position[2] - group.current.position.z) * Math.min(1, delta * 5);
      group.current.position.y = position[1] + bounce;
      group.current.rotation.y = Math.sin(t * 0.5) * (danceStyle === 0 ? 0.11 : 0.17);
      group.current.rotation.z = Math.sin(t) * (danceStyle === 2 ? 0.075 : 0.04);
    }

    if (head.current) head.current.rotation.y = Math.sin(t * 0.35) * 0.12;
    if (leftArm.current) {
      leftArm.current.rotation.x = swing;
      leftArm.current.rotation.z = danceStyle === 1 ? Math.sin(t * 0.5) * 0.28 : 0;
    }
    if (rightArm.current) {
      rightArm.current.rotation.x = -swing;
      rightArm.current.rotation.z = danceStyle === 1 ? -Math.sin(t * 0.5) * 0.28 : 0;
    }
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

      <group ref={head}>
        <mesh position={[0, 2.72, 0]} castShadow>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshStandardMaterial color={skin} roughness={0.65} />
        </mesh>

        {hairStyle === 0 && (
          <>
            <mesh position={[0, 3.29, -0.04]} castShadow>
              <boxGeometry args={[1.12, 0.22, 1.05]} />
              <meshStandardMaterial color={hair} roughness={0.9} />
            </mesh>
            <mesh position={[-0.42, 3.14, 0.34]} rotation={[0, 0, -0.18]} castShadow>
              <boxGeometry args={[0.26, 0.45, 0.42]} />
              <meshStandardMaterial color={hair} />
            </mesh>
          </>
        )}

        {hairStyle === 1 && (
          <>
            <mesh position={[0, 3.3, -0.02]} castShadow>
              <boxGeometry args={[1.12, 0.18, 1.07]} />
              <meshStandardMaterial color={hair} />
            </mesh>
            <mesh position={[0.26, 3.42, 0]} rotation={[0, 0, -0.2]} castShadow>
              <boxGeometry args={[0.35, 0.4, 0.8]} />
              <meshStandardMaterial color={hair} />
            </mesh>
          </>
        )}

        {hairStyle === 2 && (
          <>
            <mesh position={[0, 3.28, -0.04]} castShadow>
              <boxGeometry args={[1.08, 0.16, 1.02]} />
              <meshStandardMaterial color={hair} />
            </mesh>
            {[-0.36, 0, 0.36].map((x) => (
              <mesh key={x} position={[x, 3.44, -0.02]} rotation={[0, 0, x * 0.55]} castShadow>
                <boxGeometry args={[0.18, 0.38, 0.28]} />
                <meshStandardMaterial color={hair} />
              </mesh>
            ))}
          </>
        )}

        {hairStyle === 3 && (
          <mesh position={[0, 3.23, -0.03]} castShadow>
            <boxGeometry args={[1.1, 0.3, 1.05]} />
            <meshStandardMaterial color={hair} roughness={0.95} />
          </mesh>
        )}

        <mesh position={[-0.22, 2.79, 0.53]}>
          <boxGeometry args={[0.11, faceStyle === 2 ? 0.15 : 0.11, 0.035]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0.22, 2.79, 0.53]}>
          <boxGeometry args={[0.11, faceStyle === 2 ? 0.15 : 0.11, 0.035]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        {faceStyle === 0 && (
          <mesh position={[0, 2.5, 0.54]}>
            <boxGeometry args={[0.42, 0.07, 0.035]} />
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
        )}
        {faceStyle === 1 && (
          <>
            <mesh position={[-0.12, 2.5, 0.54]} rotation={[0, 0, -0.22]}>
              <boxGeometry args={[0.25, 0.06, 0.035]} />
              <meshStandardMaterial color="#7c2d12" />
            </mesh>
            <mesh position={[0.12, 2.5, 0.54]} rotation={[0, 0, 0.22]}>
              <boxGeometry args={[0.25, 0.06, 0.035]} />
              <meshStandardMaterial color="#7c2d12" />
            </mesh>
          </>
        )}
        {faceStyle === 2 && (
          <mesh position={[0, 2.49, 0.54]}>
            <boxGeometry args={[0.3, 0.13, 0.035]} />
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
        )}

        {accessory === 1 && (
          <>
            <mesh position={[-0.22, 2.8, 0.575]}>
              <boxGeometry args={[0.34, 0.26, 0.04]} />
              <meshStandardMaterial color="#111827" metalness={0.3} />
            </mesh>
            <mesh position={[0.22, 2.8, 0.575]}>
              <boxGeometry args={[0.34, 0.26, 0.04]} />
              <meshStandardMaterial color="#111827" metalness={0.3} />
            </mesh>
            <mesh position={[0, 2.8, 0.58]}>
              <boxGeometry args={[0.12, 0.05, 0.04]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          </>
        )}

        {accessory === 2 && (
          <>
            <mesh position={[0, 3.48, 0]} castShadow>
              <cylinderGeometry args={[0.48, 0.55, 0.28, 20]} />
              <meshStandardMaterial color={accent} />
            </mesh>
            <mesh position={[0, 3.34, 0.23]} castShadow>
              <boxGeometry args={[1.18, 0.08, 0.78]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          </>
        )}

        {accessory === 3 && (
          <>
            <mesh position={[-0.61, 2.76, 0]}>
              <boxGeometry args={[0.13, 0.7, 0.16]} />
              <meshStandardMaterial color={accent} metalness={0.4} />
            </mesh>
            <mesh position={[0.61, 2.76, 0]}>
              <boxGeometry args={[0.13, 0.7, 0.16]} />
              <meshStandardMaterial color={accent} metalness={0.4} />
            </mesh>
            <mesh position={[0, 3.12, -0.38]}>
              <boxGeometry args={[1.1, 0.12, 0.18]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          </>
        )}
      </group>

      <mesh position={[0, 1.62, 0]} castShadow>
        <boxGeometry args={[1.25, 1.15, 0.72]} />
        <meshStandardMaterial color={shirt} roughness={0.6} />
      </mesh>

      <mesh position={[0, 1.76, 0.375]}>
        <boxGeometry args={[0.5, 0.15, 0.035]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {accessory === 4 && (
        <mesh position={[0, 2.13, 0.39]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.28, 0.28, 0.05]} />
          <meshStandardMaterial color={accent} metalness={0.35} />
        </mesh>
      )}

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
          <meshStandardMaterial color={pants} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.34, 1.05, 0]}>
        <mesh position={[0, -0.72, 0]} castShadow>
          <boxGeometry args={[0.52, 1.45, 0.62]} />
          <meshStandardMaterial color={pants} />
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
