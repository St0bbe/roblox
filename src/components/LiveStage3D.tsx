import { Canvas } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import type { LiveViewer } from '../types/live';
import { Avatar3D } from './Avatar3D';

function positionsFor(count: number): [number, number, number][] {
  if (count <= 0) return [];

  const maxWidth = Math.min(12.5, Math.max(5.5, count * 1.55));
  const step = count === 1 ? 0 : maxWidth / (count - 1);

  return Array.from({ length: count }, (_, index) => {
    const x = count === 1 ? 0 : -maxWidth / 2 + step * index;
    const z = index % 2 === 0 ? 0 : -0.4;
    return [x, 0.04, z];
  });
}

export function LiveStage3D({ viewers, biggest }: { viewers: LiveViewer[]; biggest?: LiveViewer }) {
  const positions = positionsFor(viewers.length);

  return (
    <div className="stage3d-wrap">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 4.4, 15], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={['#071018', 15, 28]} />
        <ambientLight intensity={1.4} />
        <hemisphereLight args={['#a78bfa', '#020617', 1.4]} />
        <directionalLight
          castShadow
          position={[4, 10, 7]}
          intensity={2.1}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight position={[-8, 8, 4]} color="#7c3aed" intensity={45} angle={0.48} penumbra={1} distance={26} />
        <spotLight position={[8, 7, 2]} color="#06b6d4" intensity={40} angle={0.52} penumbra={1} distance={26} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[34, 22]} />
          <meshStandardMaterial color="#090e17" roughness={0.78} metalness={0.1} />
        </mesh>

        <gridHelper args={[28, 28, '#334155', '#172033']} position={[0, 0.006, 0]} />

        <Float speed={0.7} rotationIntensity={0.02} floatIntensity={0.04}>
          <group>
            {viewers.map((viewer, index) => (
              <Avatar3D
                key={viewer.id}
                viewer={viewer}
                index={index}
                position={positions[index]}
                isLeader={biggest?.id === viewer.id}
              />
            ))}
          </group>
        </Float>

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.62}
          scale={24}
          blur={2.2}
          far={8}
          resolution={512}
        />
      </Canvas>

      <div className="stage3d-vignette" />
      <div className="stage3d-status">3D LIVE STAGE</div>
    </div>
  );
}
