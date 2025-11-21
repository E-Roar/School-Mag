import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Experience } from "./Experience";
import { useBookData } from "../context/BookDataContext";
import { defaultVisualSettings } from "../data/defaultBooks";

export const SceneLayout = ({ children }) => {
  const { selectedBook } = useBookData();
  const gradientStart =
    selectedBook?.visualSettings?.gradientStart ||
    defaultVisualSettings.gradientStart;
  const gradientEnd =
    selectedBook?.visualSettings?.gradientEnd ||
    defaultVisualSettings.gradientEnd;

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    root.style.background = `radial-gradient(${gradientStart}, ${gradientEnd} 80%)`;
  }, [gradientStart, gradientEnd]);

  return (
    <>
      {children}
      <Loader />
      <Canvas
        style={{ pointerEvents: "auto" }}
        shadows
        camera={{
          position: [-0.5, 1, window.innerWidth > 800 ? 4 : 9],
          fov: 45,
        }}
      >
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
};


