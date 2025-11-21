import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useBookData } from "../context/BookDataContext";

export const Experience = () => {
  const { selectedBook } = useBookData();
  const visualSettings = selectedBook?.visualSettings || {};
  const floatIntensity = visualSettings.floatIntensity ?? 1;
  const rotationIntensity = visualSettings.rotationIntensity ?? 2;
  const floatSpeed = visualSettings.floatSpeed ?? 2;

  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={floatIntensity}
        speed={floatSpeed}
        rotationIntensity={rotationIntensity}
      >
        <Book />
      </Float>
      <OrbitControls />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
