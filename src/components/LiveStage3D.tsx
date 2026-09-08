import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import type { LiveViewer } from '../types/live';
import { Avatar3D } from './Avatar3D';

type StageEntry = {
  viewer: LiveViewer;
  position: [number, number, number];
  visualScale: number;
  isLeader: boolean;
};

function visualScaleFor(viewer: LiveViewer, isLeader: boolean) {
  const growth = Math.max(0, viewer.scale - 1);
  const softened = 1 + Math.log1p(growth * 1.7) * 0.42;
  return Math.min(isLeader ? 1.75 : 1.5, Math.max(0.82, softened));
}

function stageLayout(viewers: LiveViewer[], biggest?: LiveViewer): StageEntry[] {
  if (!viewers.length) return [];

  const leaderId = biggest?.id;
  const leader = viewers.find((viewer) => viewer.id === leaderId);
  const others = viewers.filter((viewer) => viewer.id !== leaderId);
  const entries: StageEntry[] = [];

  if (leader) {
    entries.push({
      viewer: leader,
      position: [0, 0.04, -1.55],
      visualScale: visualScaleFor(leader, true),
      isLeader: true,
    });
  }

  if (!others.length) return entries;

  const columns = Math.min(6, Math.max(3, Math.ceil(others.length / 2)));
  const spacing = 2.15;

  others.forEach((viewer, index) => {
    const row = Math.floor(index / columns);
    const itemsInRow = Math.min(columns, others.length - row * columns);
    const col = index % columns;
    const width = (itemsInRow - 1) * spacing;
    const x = -width / 2 + col * spacing;
    const z = row === 0 ? 0.55 : 2.45;

    entries.push({
      viewer,
      position: [x, 0.04, z],
      visualScale: visualScaleFor(viewer, false),
      isLeader: false,
    });
  });

  return entries;
}

function CameraRig({ count, maxVisualScale }: { count: number; maxVisualScale: number }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const crowdDistance = Math.max(0, count - 6) * 0.34;
    const scaleDistance = Math.max(0, maxVisualScale - 1.25) * 3.2;
    const targetZ = 15.8 + crowdDistance + scaleDistance;
    const targetY = 4.8 + Math.max(0, maxVisualScale - 1.35) * 0.8;
    const ease = 1 - Math.exp(-delta * 2.8);

    camera.position.z += (targetZ - camera.position.z) * ease;
    camera.position.y += (targetY - camera.position.y) * ease;
    camera.position.x += (0 - camera.position.x) * ease;
    camera.lookAt(0, 1.55, 0.35);
  });

  return null;
}

export function LiveStage3D({ viewers, biggest }: { viewers: LiveViewer[]; biggest?: LiveViewer }) {
  const entries = useMemo(() => stageLayout(viewers, biggest), [viewers, biggest]);
  const maxVisualScale = entries.reduce((max, entry) => Math.max(max, entry.visualScale), 1);

  return (
    <div className="stage3d-wrap">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 4.8, 16], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraRig count={viewers.length} maxVisualScale={maxVisualScale} />
        <fog attach="fog" args={['#071018', 18, 34]} />
        <ambientLight intensity={1.25} />
        <hemisphereLight args={['#a78bfa', '#020617', 1.25]} />
        <directionalLight
          castShadow
          position={[4, 10, 7]}
          intensity={2}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight position={[-9, 9, 5]} color="#7c3aed" intensity={48} angle={0.5} penumbra={1} distance={30} />
        <spotLight position={[9, 8, 3]} color="#06b6d4" intensity={44} angle={0.54} penumbra={1} distance={30} />
        <spotLight position={[0, 9, 5]} color="#facc15" intensity={biggest ? 18 : 0} angle={0.28} penumbra={1} distance={20} target-position={[0, 0, -1.5]} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[38, 25]} />
          <meshStandardMaterial color="#090e17" roughness={0.78} metalness={0.1} />
        </mesh>

        <gridHelper args={[32, 32, '#334155', '#172033']} position={[0, 0.006, 0]} />

        {entries.map((entry, index) => (
          <Avatar3D
            key={entry.viewer.id}
            viewer={entry.viewer}
            index={index}
            position={entry.position}
            isLeader={entry.isLeader}
            visualScale={entry.visualScale}
          />
        ))}

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.62}
          scale={27}
          blur={2.4}
          far={9}
          resolution={512}
        />
      </Canvas>

      <div className="stage3d-vignette" />
      <div className="stage3d-vip">👑 ÁREA VIP DO LÍDER</div>
      <div className="stage3d-status">3D LIVE STAGE · CÂMERA AUTOMÁTICA</div>
    </div>
  );
}
