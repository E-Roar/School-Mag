import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useBookData } from "../context/BookDataContext";

/**
 * Experience – sets up the 3D scene for the book viewer.
 * Includes floating animation, camera controls, and lighting.
 */
export const Experience = () => {
  const { selectedBook } = useBookData();
  const visualSettings = selectedBook?.visualSettings || {};
  const floatIntensity = visualSettings.floatIntensity ?? 1;
  const rotationIntensity = visualSettings.rotationIntensity ?? 2;
  const floatSpeed = visualSettings.floatSpeed ?? 2;

  return (
    <>
      {/* Book with floating animation */}
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={floatIntensity}
        speed={floatSpeed}
        rotationIntensity={rotationIntensity}
      >
        <Book />
      </Float>

      {/* Camera controls */}
      <OrbitControls />

      {/* Environment lighting */}
      <Environment preset="studio" />

      {/* Directional light */}
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Ground plane to catch shadows */}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
