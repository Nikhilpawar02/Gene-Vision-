import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const sampleAminoAcids = [
  "MET",
  "ALA",
  "PHE",
  "GLN",
  "GLY",
];

const hydrophobic = [
  "ALA", "VAL", "LEU", "ILE", "MET",
  "PHE", "TRP", "PRO",
];

const polar = [
  "SER", "THR", "ASN", "GLN", "TYR", "CYS",
];

const charged = [
  "ASP", "GLU", "LYS", "ARG", "HIS",
];

function getAminoColor(name) {
  if (hydrophobic.includes(name)) return "#22c55e";
  if (polar.includes(name)) return "#06b6d4";
  if (charged.includes(name)) return "#a855f7";
  return "#f59e0b";
}

function FoldedProtein({ aminoAcids }) {
  const groupRef = useRef();

  const { positions, curve } = useMemo(() => {
    const count = aminoAcids.length;

    const points = aminoAcids.map((_, i) => {
      const angle = i * 2.4;
      const radius = 1.3 * Math.sqrt((i + 1) / count);

      return new THREE.Vector3(
        radius * Math.cos(angle),
        0.85 * Math.sin(i * 1.3),
        radius * Math.sin(angle)
      );
    });

    const path = points.length > 1
      ? new THREE.CatmullRomCurve3(points)
      : null;

    return {
      positions: points,
      curve: path,
    };
  }, [aminoAcids]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {curve && (
        <mesh>
          <tubeGeometry
            args={[
              curve,
              Math.max(40, positions.length * 8),
              0.045,
              8,
              false,
            ]}
          />
          <meshStandardMaterial
            color="#67e8f9"
            roughness={0.35}
          />
        </mesh>
      )}

      {positions.map((position, index) => (
        <mesh
          key={`${aminoAcids[index]}-${index}`}
          position={position.toArray()}
        >
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial
            color={getAminoColor(aminoAcids[index])}
            roughness={0.3}
            metalness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ProteinFolding3D({
  aminoAcids = sampleAminoAcids,
}) {
  const validAminoAcids = useMemo(() => {
    return aminoAcids
      .map((item) => {
        if (typeof item === "string") {
          return item.toUpperCase();
        }

        return (
          item?.symbol ||
          item?.code ||
          item?.name ||
          ""
        ).toUpperCase();
      })
      .filter(Boolean);
  }, [aminoAcids]);

  return (
    <div
      style={{
        width: "100%",
        background: "#080d1a",
        border: "1px solid #243047",
        borderRadius: "14px",
        padding: "16px",
        color: "#e2e8f0",
      }}
    >
      <h2 style={{ margin: "0 0 5px", color: "#67e8f9" }}>
        3D PROTEIN FOLDING
      </h2>

      <p style={{ color: "#94a3b8", fontSize: "13px" }}>
        Interactive amino acid chain visualization
      </p>

      <div style={{ height: "380px" }}>
        <Canvas
  camera={{
    position: [0, 0, 6],
    fov: 45,
    near: 0.1,
    far: 100,
  }}
>
  <ambientLight intensity={1.2} />

  <directionalLight
    position={[4, 5, 5]}
    intensity={2}
  />

  <pointLight
    position={[-4, -3, -4]}
    intensity={1}
    color="#818cf8"
  />

  <FoldedProtein aminoAcids={validAminoAcids} />

  <OrbitControls
    enableRotate={true}
    enableZoom={true}
    enablePan={true}
    enableDamping={true}
    dampingFactor={0.08}
    minDistance={2}
    maxDistance={12}
  />
</Canvas>
      </div>

      <div style={{ fontSize: "13px", marginTop: "10px" }}>
        **Amino acids:** {validAminoAcids.length}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          fontSize: "12px",
          marginTop: "12px",
        }}
      >
        <span style={{ color: "#22c55e" }}>● Hydrophobic</span>
        <span style={{ color: "#06b6d4" }}>● Polar</span>
        <span style={{ color: "#a855f7" }}>● Charged</span>
        <span style={{ color: "#f59e0b" }}>● Other</span>
      </div>
    </div>
  );
}
