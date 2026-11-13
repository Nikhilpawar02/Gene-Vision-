import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ProteinFolding3D from "./ProteinFolding3D";
import * as THREE from "three";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  CircleHelp,
} from "lucide-react";
import "./BiologicalHierarchy.css";

const TRANSCRIPTION_DNA = "ATGGCTTTTCAAGGATAA";

const getMRNASequence = (dna) =>
  dna.toUpperCase().replace(/T/g, "U");

const LEVELS = [
  {
    id: "cell",
    number: "01",
    title: "Cell",
    subtitle: "The basic unit of life",
    description:
      "Explore an illustrative animal cell and its organelles.",
    next: "nucleus",
    action: "Zoom into nucleus",
  },
  {
    id: "nucleus",
    number: "02",
    title: "Nucleus",
    subtitle: "The DNA-containing compartment",
    description:
      "Explore the nucleus and its simplified chromosome model.",
    next: "chromosome",
    action: "Explore chromosome",
  },
  {
    id: "chromosome",
    number: "03",
    title: "Chromosome",
    subtitle: "DNA packaged with proteins",
    description:
      "Explore a duplicated chromosome and its sister chromatids.",
    next: "dna",
    action: "Explore DNA",
  },
  {
    id: "dna",
    number: "04",
    title: "DNA Double Helix",
    subtitle: "The molecule that carries genetic information",
    description:
      "Explore the double helix, nucleotide pairs, and an illustrative DNA sequence.",
    next: "chromosome",
    action: "Return to chromosome",
  },
];

const TRANSLATION_INFO = {
  AUG: { amino: "Methionine", short: "Met", one: "M", anticodon: "UAC" },
  GCU: { amino: "Alanine", short: "Ala", one: "A", anticodon: "CGA" },
  UUU: { amino: "Phenylalanine", short: "Phe", one: "F", anticodon: "AAA" },
  CAA: { amino: "Glutamine", short: "Gln", one: "Q", anticodon: "GUU" },
  GGA: { amino: "Glycine", short: "Gly", one: "G", anticodon: "CCU" },
  UAA: { amino: "Stop", short: "STOP", one: "*", anticodon: "—" },
  UAG: { amino: "Stop", short: "STOP", one: "*", anticodon: "—" },
  UGA: { amino: "Stop", short: "STOP", one: "*", anticodon: "—" },
};

function getTranslationRows(sequence) {
  const codons = sequence.toUpperCase().match(/.{1,3}/g) || [];

  return codons.map((codon, index) => ({
    index: index + 1,
    codon,
    ...(TRANSLATION_INFO[codon] || {
      amino: "Unknown",
      short: "?",
      one: "?",
      anticodon: "—",
    }),
  }));
}

function TranslationInfoPanel({
  sequence = getMRNASequence(TRANSCRIPTION_DNA),
  activeIndex = 0,
  completed = false,
}) {
  const rows = getTranslationRows(sequence);

  const proteinRows = rows.filter(
    (row) => row.short !== "STOP" && row.short !== "?"
  );

  const visibleProtein = proteinRows.slice(0, activeIndex);

  const proteinLetters = visibleProtein
    .filter((row) => row.one !== "*" && row.one !== "?")
    .map((row) => row.one);

  const protein = visibleProtein.map((row) => row.short);

  return (
    <div className="translation-info-panel">
      <div className="translation-section">
  <h3>mRNA Codon Sequence</h3>

  <div className="codon-card-list">
    {rows.map((row, index) => (
      <div
        className={`codon-card ${
          index === activeIndex ? "active-codon" : ""
        }`}
        key={row.index}
      >
        <span className="codon-number">
          CODON {row.index}
        </span>

        <strong>{row.codon}</strong>

        <span>{row.short}</span>
      </div>
    ))}
  </div>
</div>

      <div className="translation-section">
        <h3>Codon / Anticodon Matching</h3>

        <div className="translation-table-wrap">
          <table className="translation-table">
            <thead>
              <tr>
                <th>Codon</th>
                <th>tRNA Anticodon</th>
                <th>Amino Acid</th>
              </tr>
            </thead>

            <tbody>
             {rows.map((row, index) => (
                <tr
  key={row.index}
  className={index === activeIndex ? "active-codon-row" : ""}
>
                  <td>{row.codon}</td>
                  <td>{row.anticodon}</td>
                  <td>{row.amino}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="translation-section protein-result">
        <h3>Protein Sequence</h3>

        <div className="protein-chain">
          {protein.map((amino, index) => (
            <span className="protein-amino" key={index}>
              {amino}
            </span>
          ))}
          {completed && (
  <span className="protein-stop">STOP</span>
)}
        </div>

        {/* 3D PROTEIN FOLDING */}
{protein.length > 0 && (
  <div className="translation-section">
    <h3>3D Protein Folding Simulation</h3>

    <ProteinFolding3D
      aminoAcids={protein.map((amino) =>
        amino.toUpperCase()
      )}
    />
  </div>
)}

        <p className="protein-one-letter">
          One-letter sequence: {proteinLetters.join("-")}
        </p>
        <p className="translation-status">
  {completed
    ? "Translation completed successfully!"
    : `Translation in progress — ${visibleProtein.length} amino acids formed`}
</p>
      </div>
    </div>
  );
}

function CameraFocus({ focus, controlsRef }) {
  const { camera } = useThree();

 const positions = {
  cell: new THREE.Vector3(0, 0, 8),
  nucleus: new THREE.Vector3(0.35, 0.1, 3.2),
  chromosome: new THREE.Vector3(0.35, 0.1, 2.15),

  // View the DNA from the side, not along its Z-axis.
  dna: new THREE.Vector3(2.8, 1.2, 2.8),
};

const targets = {
  cell: new THREE.Vector3(0, 0, 0),
  nucleus: new THREE.Vector3(0.35, 0.1, 0),
  chromosome: new THREE.Vector3(0.35, 0.1, 0.35),
  dna: new THREE.Vector3(0.35, 0.1, 0),
};

  useFrame(() => {
    camera.position.lerp(positions[focus], 0.045);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targets[focus], 0.045);
      controlsRef.current.update();
    }
  });

  return null;
}


function Organelle({ position, color, scale = 0.16 }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 20, 20]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.08}
      />
    </mesh>
  );
}


function HistoneOctamer({ position = [0, 0, 0], scale = 1 }) {
  const histones = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;

      return {
        position: [
          Math.cos(angle) * 0.105,
          Math.sin(angle) * 0.105,
          (i % 2 === 0 ? 1 : -1) * 0.035,
        ],
        color: i % 2 === 0 ? "#a78bfa" : "#818cf8",
      };
    });
  }, []);

  const dnaPoints = useMemo(() => {
    const points = [];
    const turns = 2.2;
    const segments = 140;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * turns;

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * 0.205,
          Math.sin(angle) * 0.205,
          (t - 0.5) * 0.30
        )
      );
    }

    return new THREE.CatmullRomCurve3(points);
  }, []);

  const dnaGeometry = useMemo(
    () => new THREE.TubeGeometry(dnaPoints, 180, 0.012, 6, false),
    [dnaPoints]
  );

  return (
    <group position={position} scale={scale}>
      {/* Histone protein core */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.25, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>

      {/* Eight histone protein units */}
      {histones.map((histone, index) => (
        <mesh key={index} position={histone.position}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial
            color={histone.color}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* DNA wrapped around histone core */}
      <mesh geometry={dnaGeometry}>
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.25}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

function NucleosomeFiber({ count = 9, spacing = 0.48 }) {
  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => [
      (i - (count - 1) / 2) * spacing,
      Math.sin(i * 0.85) * 0.10,
      Math.cos(i * 0.85) * 0.08,
    ]);
  }, [count, spacing]);

  return (
    <group>
      {/* Linker DNA connecting nucleosomes */}
      {positions.slice(0, -1).map((point, i) => {
        const next = positions[i + 1];

        const start = new THREE.Vector3(...point);
        const end = new THREE.Vector3(...next);
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        const direction = end.clone().sub(start);

        return (
          <mesh
            key={`linker-${i}`}
            position={midpoint}
            quaternion={
              new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
              )
            }
          >
            <cylinderGeometry
              args={[0.012, 0.012, direction.length(), 8]}
            />
            <meshStandardMaterial color="#22d3ee" />
          </mesh>
        );
      })}

      {/* Nucleosome beads */}
      {positions.map((position, index) => (
        <HistoneOctamer
          key={index}
          position={position}
          scale={0.72}
        />
      ))}
    </group>
  );
}


function FoldedChromatin({
  loops = 5,
  nucleosomesPerLoop = 8,
  radius = 0.48,
}) {
  const loopData = useMemo(() => {
    return Array.from({ length: loops }, (_, loopIndex) => {
      const angle = (loopIndex / loops) * Math.PI * 2;

      const center = new THREE.Vector3(
        Math.cos(angle) * 0.42,
        (loopIndex - (loops - 1) / 2) * 0.22,
        Math.sin(angle) * 0.42
      );

      const points = [];

      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const theta = t * Math.PI * 2;

        points.push(
          new THREE.Vector3(
            center.x + Math.cos(theta) * radius,
            center.y + Math.sin(theta) * radius * 0.72,
            center.z + Math.sin(theta * 2) * 0.12
          )
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);

      return { curve, center, angle };
    });
  }, [loops, radius]);

  return (
    <group>
      {loopData.map((loop, loopIndex) => {
        const tubeGeometry = new THREE.TubeGeometry(
          loop.curve,
          120,
          0.018,
          8,
          false
        );

        return (
          <group key={loopIndex}>
            {/* Chromatin loop backbone */}
            <mesh geometry={tubeGeometry}>
              <meshStandardMaterial
                color="#22d3ee"
                emissive="#0891b2"
                emissiveIntensity={0.3}
                roughness={0.4}
              />
            </mesh>

            {/* Nucleosomes distributed along loop */}
            {Array.from(
              { length: nucleosomesPerLoop },
              (_, index) => {
                const t = index / nucleosomesPerLoop;
                const point = loop.curve.getPoint(t);

                return (
                  <HistoneOctamer
                    key={index}
                    position={point.toArray()}
                    scale={0.48}
                  />
                );
              }
            )}
          </group>
        );
      })}

      {/* Central protein scaffold */}
      <mesh>
        <cylinderGeometry args={[0.10, 0.10, 1.55, 24]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}


function SisterChromatid({ side = "left" }) {
  const isLeft = side === "left";

  return (
    <group
      position={[isLeft ? -0.27 : 0.27, 0, 0]}
      rotation={[0, 0, isLeft ? -0.20 : 0.20]}
      scale={[0.68, 1.18, 0.68]}
    >
      <FoldedChromatin
        loops={4}
        nucleosomesPerLoop={5}
        radius={0.42}
      />
    </group>
  );
}



function ChromosomeModel() {
  return (
    <group>
      {/* Left sister chromatid */}
      <SisterChromatid side="left" />

      {/* Right sister chromatid */}
      <SisterChromatid side="right" />

      {/* Centromere joining both chromatids */}
      <group position={[0, 0, 0.04]}>
        <mesh scale={[1.15, 1.35, 0.85]}>
          <sphereGeometry args={[0.17, 32, 24]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#b45309"
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Centromere connecting ring */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.18, 0.035, 12, 48]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.35}
            roughness={0.35}
          />
        </mesh>

        {/* Kinetochore structures */}
        <mesh position={[0, 0, 0.16]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial color="#fb7185" />
        </mesh>

        <mesh position={[0, 0, -0.16]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial color="#fb7185" />
        </mesh>
      </group>
    </group>
  );
}

function NucleusModel({
  focus,
  setFocus,
  transcriptionPlaying,
  transcriptionResetKey,
  simulationMode,
  translationPlaying,
  translationResetKey,
  setTranslationProgress,
}) {
  // Create an irregular, slightly folded nuclear surface.
  const nucleusGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.92, 96, 96);
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const wave =
        1 +
        0.018 * Math.sin(x * 18 + y * 12) *
          Math.cos(z * 16 + y * 8) +
        0.009 * Math.sin(y * 24 + z * 11);

      positions.setXYZ(i, x * wave, y * wave, z * wave);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  // Distribute nuclear pore complexes across the envelope.
  const pores = useMemo(() => {
    const count = 72;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    return Array.from({ length: count }, (_, index) => {
      const y = 1 - (2 * (index + 0.5)) / count;
      const radius = Math.sqrt(1 - y * y);
      const angle = goldenAngle * index;

      const normal = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ).normalize();

      return {
        position: normal.clone().multiplyScalar(0.928),
        quaternion: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal
        ),
      };
    });
  }, []);

  // Generate a dense network of irregular chromatin fibers.
  const chromatinFibers = useMemo(() => {
    return Array.from({ length: 20 }, (_, fiberIndex) => {
      const points = [];

      const phase = fiberIndex * 1.71;
      const turns = 2.2 + (fiberIndex % 4) * 0.55;
      const heightOffset = ((fiberIndex % 5) - 2) * 0.08;

      for (let step = 0; step <= 60; step++) {
        const t = step / 60;
        const angle = t * Math.PI * 2 * turns + phase;

        const radius =
          0.12 +
          0.35 * Math.sin(t * Math.PI) +
          0.055 * Math.sin(t * 17 + phase);

        const x =
          Math.cos(angle) * radius +
          0.08 * Math.sin(t * 13 + phase);

        const y =
          (t - 0.5) * 0.95 +
          heightOffset +
          0.09 * Math.sin(angle * 0.7);

        const z =
          Math.sin(angle) * radius +
          0.08 * Math.cos(t * 11 + phase);

        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(
        points,
        false,
        "centripetal"
      );

      return new THREE.TubeGeometry(
        curve,
        120,
        0.008 + (fiberIndex % 3) * 0.003,
        8,
        false
      );
    });
  }, []);

  const chromatinColors = [
    "#c4b5fd",
    "#a78bfa",
    "#67e8f9",
    "#818cf8",
    "#d8b4fe",
    "#e879f9",
    "#93c5fd",
  ];

  // Generate granular structures inside the nucleolus.
  const nucleolusGranules = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => {
      const angle = index * 2.39996;
      const y = 1 - (2 * (index + 0.5)) / 42;
      const radius = Math.sqrt(1 - y * y);

      return {
        position: [
          Math.cos(angle) * radius * 0.19,
          y * 0.19,
          Math.sin(angle) * radius * 0.19,
        ],
        scale: 0.009 + (index % 4) * 0.003,
      };
    });
  }, []);

  return (
    <group position={[0.35, 0.1, 0]}>

      {/* Internal nucleoplasm */}
      <mesh scale={0.91}>
        <sphereGeometry args={[0.92, 64, 64]} />
        <meshPhysicalMaterial
          color="#312e81"
          roughness={0.48}
          transparent
          opacity={0.10}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer nuclear membrane */}
      <mesh
        geometry={nucleusGeometry}
        onClick={(event) => {
          event.stopPropagation();
          setFocus("nucleus");
        }}
      >
        <meshPhysicalMaterial
          color="#818cf8"
          roughness={0.24}
          metalness={0.12}
          transparent
          opacity={0.23}
          clearcoat={1}
          clearcoatRoughness={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner nuclear membrane */}
      <mesh scale={0.955}>
        <sphereGeometry args={[0.92, 80, 80]} />
        <meshPhysicalMaterial
          color="#c4b5fd"
          roughness={0.32}
          metalness={0.08}
          transparent
          opacity={0.17}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Nuclear lamina */}
      <mesh scale={0.91}>
        <sphereGeometry args={[0.92, 64, 64]} />
        <meshBasicMaterial
          color="#a78bfa"
          wireframe
          transparent
          opacity={0.10}
        />
      </mesh>

      {/* Nuclear pore complexes */}
      {pores.map((pore, index) => (
        <group
          key={index}
          position={pore.position}
          quaternion={pore.quaternion}
        >
          {/* Outer pore ring */}
          <mesh>
            <torusGeometry args={[0.048, 0.013, 12, 28]} />
            <meshPhysicalMaterial
              color="#67e8f9"
              emissive="#0891b2"
              emissiveIntensity={0.65}
              metalness={0.5}
              roughness={0.22}
            />
          </mesh>

          {/* Inner pore channel */}
          <mesh position={[0, 0, -0.006]}>
            <cylinderGeometry args={[0.026, 0.026, 0.035, 16]} />
            <meshStandardMaterial
              color="#164e63"
              metalness={0.3}
              roughness={0.3}
            />
          </mesh>

          {/* Small pore filaments */}
          {Array.from({ length: 6 }, (_, filament) => {
            const angle = (filament / 6) * Math.PI * 2;

            return (
              <mesh
                key={filament}
                position={[
                  Math.cos(angle) * 0.035,
                  Math.sin(angle) * 0.035,
                  0.008,
                ]}
              >
                <sphereGeometry args={[0.009, 8, 8]} />
                <meshBasicMaterial color="#a5f3fc" />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Chromatin network inside the nucleus */}
      {focus === "nucleus" &&
        chromatinFibers.map((geometry, index) => (
          <mesh key={index} geometry={geometry}>
            <meshStandardMaterial
              color={chromatinColors[index % chromatinColors.length]}
              emissive={chromatinColors[index % chromatinColors.length]}
              emissiveIntensity={0.32}
              roughness={0.38}
              metalness={0.12}
            />
          </mesh>
        ))}

      {/* Nucleolus */}
      {focus === "nucleus" && (
        <group position={[0.18, -0.12, 0.27]}>

          {/* Outer granular region */}
          <mesh>
            <sphereGeometry args={[0.245, 48, 48]} />
            <meshPhysicalMaterial
              color="#a21caf"
              emissive="#701a75"
              emissiveIntensity={0.4}
              roughness={0.38}
            />
          </mesh>

          {/* Inner dense fibrillar region */}
          <mesh scale={0.73}>
            <sphereGeometry args={[0.245, 40, 40]} />
            <meshPhysicalMaterial
              color="#e879f9"
              emissive="#c026d3"
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>

          {/* Granular particles */}
          {nucleolusGranules.map((granule, index) => (
            <mesh
              key={index}
              position={granule.position}
              scale={granule.scale}
            >
              <sphereGeometry args={[1, 10, 10]} />
              <meshStandardMaterial
                color={index % 2 === 0 ? "#f5d0fe" : "#c026d3"}
                roughness={0.35}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Chromosome view */}
      {focus === "chromosome" && <ChromosomeModel />}

      {/* DNA and gene-process 3D views */}
      {focus === "dna" && simulationMode === "transcription" && (
        <TranscriptionModel
          sequence={TRANSCRIPTION_DNA}
          transcriptionPlaying={transcriptionPlaying}
          transcriptionResetKey={transcriptionResetKey}
        />
      )}
      {focus === "dna" && simulationMode === "translation" && (
        <TranslationModel
          sequence={getMRNASequence(TRANSCRIPTION_DNA)}
          translationPlaying={translationPlaying}
          translationResetKey={translationResetKey}
          onProgress={setTranslationProgress}
        />
      )}
    </group>
  );
}

function DNAStick({
  start,
  end,
  color = "#22d3ee",
  radius = 0.012,
}) {
  const direction = new THREE.Vector3(...end).sub(
    new THREE.Vector3(...start)
  );

  const midpoint = new THREE.Vector3(...start)
    .add(new THREE.Vector3(...end))
    .multiplyScalar(0.5);

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry
        args={[radius, radius, direction.length(), 8]}
      />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
      />
    </mesh>
  );
}

function DetailedDNAModel({ sequence = TRANSCRIPTION_DNA }) {
  const colors = {
    A: "#22c55e",
    T: "#f97316",
    G: "#3b82f6",
    C: "#a855f7",
  };

  const complement = {
    A: "T",
    T: "A",
    G: "C",
    C: "G",
  };

  const dna =
    sequence.toUpperCase().replace(/[^ATGC]/g, "") ||
    TRANSCRIPTION_DNA;

  const model = useMemo(() => {
    const strandA = [];
    const strandB = [];
    const pairs = [];
    const phosphatesA = [];
    const phosphatesB = [];

    const helixRadius = 0.62;
    const baseRadius = 0.20;
    const rise = 0.17;
    const twist = (Math.PI * 2) / 10;

    for (let i = 0; i < dna.length; i++) {
      const angle = i * twist;
      const z = (i - (dna.length - 1) / 2) * rise;

      // Outer backbone positions
      const a = [
        Math.cos(angle) * helixRadius,
        Math.sin(angle) * helixRadius,
        z,
      ];

      const b = [
        -Math.cos(angle) * helixRadius,
        -Math.sin(angle) * helixRadius,
        z,
      ];

      // Inner nitrogenous base positions
      const baseA = [
        Math.cos(angle) * baseRadius,
        Math.sin(angle) * baseRadius,
        z,
      ];

      const baseB = [
        -Math.cos(angle) * baseRadius,
        -Math.sin(angle) * baseRadius,
        z,
      ];

      // Phosphate groups sit between successive sugar units
      const phosphateAngle = angle + twist / 2;
      const phosphateZ = z + rise / 2;

      phosphatesA.push([
        Math.cos(phosphateAngle) * helixRadius,
        Math.sin(phosphateAngle) * helixRadius,
        phosphateZ,
      ]);

      phosphatesB.push([
        -Math.cos(phosphateAngle) * helixRadius,
        -Math.sin(phosphateAngle) * helixRadius,
        phosphateZ,
      ]);

      strandA.push(new THREE.Vector3(...a));
      strandB.push(new THREE.Vector3(...b));

      pairs.push({
        a,
        b,
        baseA,
        baseB,
        nucleotideA: dna[i],
        nucleotideB: complement[dna[i]],
        bonds:
          dna[i] === "G" || dna[i] === "C" ? 3 : 2,
      });
    }

    const railSegments = Math.max(100, dna.length * 16);

    return {
      railA: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(strandA),
        railSegments,
        0.027,
        10,
        false
      ),

      railB: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(strandB),
        railSegments,
        0.027,
        10,
        false
      ),

      pairs,
      phosphatesA,
      phosphatesB,
    };
  }, [dna]);

  // Release generated geometries when the model is removed
  useEffect(() => {
    return () => {
      model.railA.dispose();
      model.railB.dispose();
    };
  }, [model]);

  return (
    <group>
      {/* ================================= */}
      {/* 1. SUGAR-PHOSPHATE BACKBONES      */}
      {/* ================================= */}

      <mesh geometry={model.railA}>
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.25}
        />
      </mesh>

      <mesh geometry={model.railB}>
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.25}
        />
      </mesh>

      {/* Phosphate groups on both strands */}
      {model.phosphatesA.map((position, index) => (
        <mesh key={`phosphate-a-${index}`} position={position}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0369a1"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {model.phosphatesB.map((position, index) => (
        <mesh key={`phosphate-b-${index}`} position={position}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial
            color="#a5b4fc"
            emissive="#4f46e5"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* ================================= */}
      {/* 2. NUCLEOTIDE BASE PAIRS           */}
      {/* ================================= */}

      {model.pairs.map((pair, index) => (
        <group key={`base-pair-${index}`}>
          {/* Deoxyribose sugar units */}
          <mesh position={pair.a}>
            <sphereGeometry args={[0.065, 18, 18]} />
            <meshStandardMaterial
              color="#fbbf24"
              roughness={0.35}
            />
          </mesh>

          <mesh position={pair.b}>
            <sphereGeometry args={[0.065, 18, 18]} />
            <meshStandardMaterial
              color="#fbbf24"
              roughness={0.35}
            />
          </mesh>

          {/* Nitrogenous bases */}
          <mesh position={pair.baseA}>
            <sphereGeometry args={[0.075, 20, 20]} />
            <meshStandardMaterial
              color={colors[pair.nucleotideA]}
              roughness={0.3}
              metalness={0.15}
              emissive={colors[pair.nucleotideA]}
              emissiveIntensity={0.12}
            />
          </mesh>

          <mesh position={pair.baseB}>
            <sphereGeometry args={[0.075, 20, 20]} />
            <meshStandardMaterial
              color={colors[pair.nucleotideB]}
              roughness={0.3}
              metalness={0.15}
              emissive={colors[pair.nucleotideB]}
              emissiveIntensity={0.12}
            />
          </mesh>

          {/* Sugar-to-base bonds */}
          <DNAStick
            start={pair.a}
            end={pair.baseA}
            color="#fbbf24"
            radius={0.012}
          />

          <DNAStick
            start={pair.b}
            end={pair.baseB}
            color="#fbbf24"
            radius={0.012}
          />

          {/* ================================= */}
          {/* 3. HYDROGEN BONDS                  */}
          {/* ================================= */}

          {Array.from(
            { length: pair.bonds },
            (_, bondIndex) => {
              const offset =
                (bondIndex - (pair.bonds - 1) / 2) * 0.035;

              const start = [
                pair.baseA[0],
                pair.baseA[1],
                pair.baseA[2] + offset,
              ];

              const end = [
                pair.baseB[0],
                pair.baseB[1],
                pair.baseB[2] + offset,
              ];

              return (
                <DNAStick
                  key={`hydrogen-${index}-${bondIndex}`}
                  start={start}
                  end={end}
                  color="#e2e8f0"
                  radius={0.008}
                />
              );
            }
          )}
        </group>
      ))}
    </group>
  );
}



function TranscriptionModel({
  sequence = TRANSCRIPTION_DNA,
  transcriptionPlaying = false,
  transcriptionResetKey = 0,
}) {
  const mrna = getMRNASequence(sequence);

  const progressRef = useRef(0);
  const elapsedRef = useRef(0);

  const nucleotideRefs = useRef([]);
  const polymeraseRef = useRef(null);

  const colors = {
    A: "#22c55e",
    U: "#f97316",
    G: "#3b82f6",
    C: "#a855f7",
  };

  // Reset animation when Start, Restart, or Reset is clicked.
  useEffect(() => {
    progressRef.current = 0;
    elapsedRef.current = 0;

    nucleotideRefs.current.forEach((node) => {
      if (node) node.visible = false;
    });

    if (polymeraseRef.current) {
      polymeraseRef.current.visible = false;
      polymeraseRef.current.position.z = -1.45;
    }
  }, [transcriptionResetKey, mrna]);

  useFrame((_, delta) => {
    // Advance transcription only while playing.
    if (
      transcriptionPlaying &&
      progressRef.current < mrna.length
    ) {
      elapsedRef.current += delta;

      // One nucleotide appears every 0.55 seconds.
      progressRef.current = Math.min(
        elapsedRef.current / 0.55,
        mrna.length
      );
    }

    const progress = progressRef.current;

    // Reveal mRNA nucleotides one at a time.
    nucleotideRefs.current.forEach((node, index) => {
      if (node) {
        node.visible = index < progress;
      }
    });

// 4. Reveal peptide bonds between amino acids.
bondRefs.current.forEach((node, index) => {
  if (!node) return;

  node.visible = progress >= index + 2;
});

    // Move RNA polymerase along the DNA helix.
    if (polymeraseRef.current) {
      const completed =
        progress >= mrna.length;

      polymeraseRef.current.visible =
        transcriptionPlaying && !completed;

      const movement =
        progress / Math.max(mrna.length, 1);

      polymeraseRef.current.position.z =
        -1.45 + movement * 2.9;
    }
  });

  return (
    <group>
      {/* Original DNA double helix */}
      <DetailedDNAModel sequence={sequence} />

      {/* RNA polymerase visualization */}
      <group
        ref={polymeraseRef}
        position={[0, 0, -1.45]}
        visible={false}
      >
        <mesh>
          <sphereGeometry args={[0.20, 24, 24]} />
          <meshStandardMaterial
            color="#facc15"
            emissive="#ca8a04"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>

        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.27, 0.035, 12, 32]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>

        <pointLight
          color="#facc15"
          intensity={1.5}
          distance={1.2}
        />
      </group>

      {/* Newly synthesized mRNA strand */}
      <group
        position={[
          -((mrna.length - 1) * 0.055),
          -0.95,
          0.35,
        ]}
      >
        {Array.from(mrna).map((base, index) => (
          <mesh
            key={`mrna-base-${index}`}
            ref={(node) => {
              nucleotideRefs.current[index] = node;
            }}
            position={[index * 0.11, 0, 0]}
            visible={false}
          >
            <sphereGeometry args={[0.055, 20, 20]} />

            <meshStandardMaterial
              color={colors[base]}
              emissive={colors[base]}
              emissiveIntensity={0.35}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DNAModel() {
  const basePairs = 20;
  const helixRadius = 0.24;
  const helixHeight = 1.45;
const sequence = TRANSCRIPTION_DNA;

  return (
    <group position={[0, 0, 0.35]} scale={0.85}>
      {Array.from({ length: basePairs }, (_, i) => {
        const angle = i * 0.65;
        const y =
          (i / (basePairs - 1) - 0.5) * helixHeight;

        const a = new THREE.Vector3(
          helixRadius * Math.cos(angle),
          y,
          helixRadius * Math.sin(angle)
        );

        const b = new THREE.Vector3(
          -helixRadius * Math.cos(angle),
          y,
          -helixRadius * Math.sin(angle)
        );

        const direction = new THREE.Vector3()
          .subVectors(b, a);

        const midpoint = new THREE.Vector3()
          .addVectors(a, b)
          .multiplyScalar(0.5);

        const base = sequence[i % sequence.length];
        const complementary = {
          A: "T",
          T: "A",
          G: "C",
          C: "G",
        }[base];

        const baseColor = {
          A: "#4ade80",
          T: "#fb923c",
          G: "#60a5fa",
          C: "#c084fc",
        };

        return (
          <group key={i}>
            {/* First DNA strand */}
            <mesh position={a}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial
                color={baseColor[base]}
                emissive={baseColor[base]}
                emissiveIntensity={0.25}
              />
            </mesh>

            {/* Opposite DNA strand */}
            <mesh position={b}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial
                color={baseColor[complementary]}
                emissive={baseColor[complementary]}
                emissiveIntensity={0.25}
              />
            </mesh>

            {/* Connecting base pair */}
            <mesh
              position={midpoint}
              quaternion={new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
              )}
            >
              <cylinderGeometry
                args={[0.018, 0.018, direction.length(), 8]}
              />
              <meshStandardMaterial
                color="#dbeafe"
                emissive="#60a5fa"
                emissiveIntensity={0.15}
              />
            </mesh>
          </group>
          
        );
      })}
    </group>
  );
}


function TranslationModel({
  sequence = "AUGGCUUUUCAAGGAUAA",
  translationPlaying = false,
  translationResetKey = 0,
  onProgress = () => {},
}) {
  const progressRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastReportedStepRef = useRef(-1);

  const mrnaRefs = useRef([]);
  const trnaRefs = useRef([]);
  const aminoRefs = useRef([]);
  const bondRefs = useRef([]);
  const stopRef = useRef(null);

  const translation = useMemo(() => {
    const cleanSequence = sequence
      .toUpperCase()
      .replace(/[^AUGC]/g, "");

    const codons = cleanSequence.match(/.{3}/g) || [];

    const geneticCode = {
      AUG: {
        name: "Methionine",
        symbol: "Met",
        color: "#f59e0b",
        anticodon: "UAC",
      },
      GCU: {
        name: "Alanine",
        symbol: "Ala",
        color: "#22c55e",
        anticodon: "CGA",
      },
      UUU: {
        name: "Phenylalanine",
        symbol: "Phe",
        color: "#3b82f6",
        anticodon: "AAA",
      },
      CAA: {
        name: "Glutamine",
        symbol: "Gln",
        color: "#a78bfa",
        anticodon: "GUU",
      },
      GGA: {
        name: "Glycine",
        symbol: "Gly",
        color: "#ec4899",
        anticodon: "CCU",
      },
    };

    const aminoAcids = [];
    let stopIndex = -1;

    codons.forEach((codon, index) => {
      if (["UAA", "UAG", "UGA"].includes(codon)) {
        if (stopIndex === -1) stopIndex = index;
        return;
      }

      if (stopIndex !== -1) return;

      if (geneticCode[codon]) {
        aminoAcids.push({
          codon,
          ...geneticCode[codon],
        });
      }
    });

    return {
      codons,
      aminoAcids,
      stopIndex,
    };
  }, [sequence]);

  const totalSteps = translation.aminoAcids.length + 1;
  const STEP_DURATION = 1.5;

  // Reset simulation.
 // Reset simulation.
useEffect(() => {
  progressRef.current = 0;
  elapsedRef.current = 0;

  mrnaRefs.current.forEach((node) => {
    if (node) {
      node.position.x =
        (node.userData.baseIndex - 1) * 0.14;
    }
  });

  trnaRefs.current.forEach((node) => {
    if (node) {
      node.visible = false;
      node.position.set(0, 0.78, 0.30);
    }
  });

  aminoRefs.current.forEach((node) => {
    if (node) {
      node.visible = false;
      node.scale.setScalar(0.001);
    }
  });

  // Reset peptide bonds.
  bondRefs.current.forEach((node) => {
    if (node) {
      node.visible = false;
    }
  });

  // Reset stop marker.
  if (stopRef.current) {
    stopRef.current.visible = false;
  }

  lastReportedStepRef.current = -1;

  onProgress({
    activeIndex: 0,
    completed: false,
  });

}, [translationResetKey, sequence, onProgress]);

  useFrame((_, delta) => {
    if (
      translationPlaying &&
      progressRef.current < totalSteps
    ) {
      elapsedRef.current += delta;

      progressRef.current = Math.min(
        elapsedRef.current / STEP_DURATION,
        totalSteps
      );
    }

    const progress = progressRef.current;
    const activeIndex = Math.floor(progress);
    const fraction = progress - activeIndex;

    // Report progress only when the active codon changes.
const currentStep = Math.min(
  Math.floor(progress),
  totalSteps
);

if (currentStep !== lastReportedStepRef.current) {
  lastReportedStepRef.current = currentStep;

  onProgress({
    activeIndex: Math.min(
      currentStep,
      translation.aminoAcids.length
    ),
    completed: progress >= totalSteps,
  });
}

    // 1. Move mRNA through the ribosome.
    const shift = progress * 3 * 0.14;

    mrnaRefs.current.forEach((node) => {
      if (!node) return;

      const index = node.userData.baseIndex;

      node.position.x =
        (index - 1) * 0.14 - shift;
    });

    // 2. Animate the incoming tRNA.
    trnaRefs.current.forEach((node, index) => {
      if (!node) return;

      const active =
        index === activeIndex &&
        index < translation.aminoAcids.length &&
        progress < totalSteps;

      node.visible = active;

      if (active) {
        node.position.y =
          0.78 - Math.min(fraction, 1) * 0.45;
      }
    });

    // 3. Reveal the growing protein chain.
    aminoRefs.current.forEach((node, index) => {
      if (!node) return;

      const visible = progress >= index + 1;

      node.visible = visible;

      const targetScale = visible ? 1 : 0.001;

      node.scale.setScalar(targetScale);
    });
    // 4. Reveal peptide bonds progressively.
bondRefs.current.forEach((node, index) => {
  if (!node) return;

  node.visible = progress >= index + 2;
});

    // 4. Display the termination marker.
    if (stopRef.current) {
      stopRef.current.visible =
        translation.stopIndex >= 0 &&
        progress >= translation.aminoAcids.length;
    }
  });

  const nucleotideColors = {
    A: "#22c55e",
    U: "#f97316",
    G: "#3b82f6",
    C: "#a855f7",
  };

  return (
    <group>
      {/* LARGE RIBOSOMAL SUBUNIT */}
      <mesh
        position={[0, 0.10, 0]}
        scale={[0.95, 0.48, 0.48]}
      >
        <sphereGeometry args={[1, 40, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.88}
          roughness={0.4}
        />
      </mesh>

      {/* SMALL RIBOSOMAL SUBUNIT */}
      <mesh
        position={[0, -0.30, 0]}
        scale={[0.82, 0.25, 0.38]}
      >
        <sphereGeometry args={[1, 40, 28]} />
        <meshStandardMaterial
          color="#6366f1"
          roughness={0.4}
        />
      </mesh>

      {/* mRNA NUCLEOTIDES */}
      {translation.codons.map((codon, codonIndex) =>
        codon.split("").map((base, baseIndex) => {
          const index = codonIndex * 3 + baseIndex;

          return (
            <mesh
              key={`mrna-${index}`}
              ref={(node) => {
                mrnaRefs.current[index] = node;

                if (node) {
                  node.userData.baseIndex = index;
                }
              }}
              position={[
                (index - 1) * 0.14,
                -0.05,
                0.40,
              ]}
            >
              <sphereGeometry args={[0.065, 18, 18]} />
              <meshStandardMaterial
                color={nucleotideColors[base]}
                emissive={nucleotideColors[base]}
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })
      )}

      {/* tRNA MOLECULES */}
      {translation.aminoAcids.map((item, index) => (
        <group
          key={`trna-${index}`}
          ref={(node) => {
            trnaRefs.current[index] = node;
          }}
          visible={false}
          position={[0, 0.78, 0.30]}
        >
          {/* tRNA BODY */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <capsuleGeometry
              args={[0.055, 0.32, 8, 12]}
            />
            <meshStandardMaterial color="#22d3ee" />
          </mesh>

          {/* AMINO ACID */}
          <mesh position={[0, 0.23, 0]}>
            <sphereGeometry args={[0.105, 20, 20]} />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* ANTICODON MARKER */}
          <mesh position={[0, -0.22, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      ))}

      {/* GROWING PROTEIN CHAIN */}
      {translation.aminoAcids.map((item, index) => (
        <mesh
          key={`protein-${index}`}
          ref={(node) => {
            aminoRefs.current[index] = node;
          }}
          position={[
            -0.36 + index * 0.18,
            0.95 + Math.sin(index * 0.8) * 0.12,
            0.05,
          ]}
          visible={false}
          scale={0.001}
        >
          <sphereGeometry args={[0.105, 24, 20]} />
          <meshStandardMaterial
            color={item.color}
            emissive={item.color}
            emissiveIntensity={0.25}
            roughness={0.35}
          />
        </mesh>
        
      ))}

      {/* PEPTIDE BONDS */}
{translation.aminoAcids.slice(0, -1).map((item, index) => {
  const x1 = -0.36 + index * 0.18;
  const y1 = 0.95 + Math.sin(index * 0.8) * 0.12;

  const x2 = -0.36 + (index + 1) * 0.18;
  const y2 = 0.95 + Math.sin((index + 1) * 0.8) * 0.12;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.sqrt(dx * dx + dy * dy);

  return (
    <mesh
      key={`peptide-bond-${index}`}
      ref={(node) => {
        bondRefs.current[index] = node;
      }}
      position={[
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        0.05,
      ]}
      rotation={[
        0,
        0,
        Math.atan2(dx, dy),
      ]}
      scale={[1, length, 1]}
      visible={false}
    >
      <cylinderGeometry args={[0.025, 0.025, 1, 12]} />
      <meshStandardMaterial
        color="#e2e8f0"
        emissive="#94a3b8"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
})}

      {/* STOP CODON INDICATOR */}
      <mesh
        ref={stopRef}
        position={[0.85, 0.50, 0.30]}
        visible={false}
      >
        <octahedronGeometry args={[0.13, 1]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}



function CellModel({
  focus,
  setFocus,
  transcriptionPlaying,
  transcriptionResetKey,
  simulationMode,
  translationPlaying,
  translationResetKey,
  setTranslationProgress,
}) {
  return (
    <group>
      {/* Cell membrane */}
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          setFocus("cell");
        }}
        scale={[2.65, 2.1, 1.9]}
      >
        <sphereGeometry args={[1, 64, 48]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          roughness={0.22}
          metalness={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner membrane highlight */}
      <mesh scale={[2.58, 2.04, 1.84]}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshBasicMaterial
          color="#67e8f9"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Illustrative cytoplasm */}
      <mesh scale={[2.35, 1.82, 1.65]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#164e8b"
          transparent
          opacity={0.10}
          depthWrite={false}
        />
      </mesh>

      {/* Illustrative organelles */}
      <Organelle
        position={[-1.25, 0.75, 0.2]}
        color="#f59e0b"
        scale={0.22}
      />
      <Organelle
        position={[-1.35, -0.65, 0.1]}
        color="#fb7185"
        scale={0.18}
      />
      <Organelle
        position={[1.25, 0.85, -0.2]}
        color="#a78bfa"
        scale={0.2}
      />
      <Organelle
        position={[1.35, -0.7, 0.2]}
        color="#fbbf24"
        scale={0.19}
      />
      <Organelle
        position={[-0.55, 1.25, -0.3]}
        color="#34d399"
        scale={0.13}
      />
      <Organelle
        position={[0.9, -1.15, -0.3]}
        color="#fb7185"
        scale={0.14}
      />

      {/* Realistic illustrative nucleus */}
      <NucleusModel
  focus={focus}
  setFocus={setFocus}
  transcriptionPlaying={transcriptionPlaying}
  transcriptionResetKey={transcriptionResetKey}
  simulationMode={simulationMode}
  translationPlaying={translationPlaying}
  translationResetKey={translationResetKey}
  setTranslationProgress={setTranslationProgress}
/>
    </group>
  );
}


function DNASequencePanel() {
  const sequence = TRANSCRIPTION_DNA;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const complement = {
    A: "T",
    T: "A",
    G: "C",
    C: "G",
  };

  const colors = {
    A: "#4ade80",
    T: "#fb923c",
    G: "#60a5fa",
    C: "#c084fc",
  };

  const selectedBase = sequence[selectedIndex];
  const codonStart = Math.floor(selectedIndex / 3) * 3;
  const selectedCodon = sequence.slice(codonStart, codonStart + 3);

  return (
    <div className="dna-sequence-panel">
      <div className="dna-sequence-heading">
        <div>
          <span className="dna-eyebrow">GENEVISION / MODULE 04</span>
          <h3>DNA Sequence Explorer</h3>
          <p>Select a nucleotide to explore its complementary base.</p>
        </div>
        <span className="dna-sample-badge">Sample sequence</span>
      </div>

      <div className="dna-base-legend">
        {Object.entries(colors).map(([base, color]) => (
          <span key={base}>
            <i style={{ backgroundColor: color }} />
            {base}
          </span>
        ))}
      </div>

      <div className="dna-sequence" aria-label="Selectable DNA sequence">
        {Array.from(sequence).map((base, index) => (
          <button
            key={index}
            type="button"
            className={`dna-base ${
              Math.floor(index / 3) === Math.floor(selectedIndex / 3)
                ? "codon-active"
                : ""
            } ${index === selectedIndex ? "base-selected" : ""}`}
            style={{ "--base-color": colors[base] }}
            onClick={() => setSelectedIndex(index)}
            aria-label={`Position ${index + 1}, base ${base}`}
            aria-pressed={index === selectedIndex}
          >
            {base}
          </button>
        ))}
      </div>

      <div className="dna-sequence-position">
        {sequence.length} nucleotides · Position {selectedIndex + 1}
      </div>

      <div className="dna-detail-grid">
        <div className="dna-detail-card">
          <span>Selected nucleotide</span>
          <strong style={{ color: colors[selectedBase] }}>
            {selectedBase}
          </strong>
          <small>Position {selectedIndex + 1}</small>
        </div>

        <div className="dna-detail-card">
          <span>Complementary base</span>
          <strong style={{ color: colors[complement[selectedBase]] }}>
            {complement[selectedBase]}
          </strong>
          <small>
            {selectedBase} pairs with {complement[selectedBase]}
          </small>
        </div>

        <div className="dna-detail-card">
          <span>Selected codon group</span>
          <strong className="dna-codon">{selectedCodon || "—"}</strong>
          <small>
            Positions {codonStart + 1}–{Math.min(codonStart + 3, sequence.length)}
          </small>
        </div>
      </div>

      <p className="dna-sequence-note">
        Educational sample only. Codon grouping starts at the first base;
        this is not a validated biological gene annotation.
      </p>
    </div>
  );
}


export default function BiologicalHierarchy() {
  const [focus, setFocus] = useState("cell");
  const [showLabels, setShowLabels] = useState(true);
  const controlsRef = useRef();

  // Transcription controls
  const [transcriptionPlaying, setTranscriptionPlaying] = useState(false);
  const [transcriptionResetKey, setTranscriptionResetKey] = useState(0);

  // Simulation mode selector
  const [simulationMode, setSimulationMode] = useState("transcription");

  // Translation controls
  const [translationPlaying, setTranslationPlaying] = useState(false);
  const [translationResetKey, setTranslationResetKey] = useState(0);

  const [translationProgress, setTranslationProgress] = useState({
  activeIndex: 0,
  completed: false,
});

  useEffect(() => {
    if (focus !== "dna") {
      setTranscriptionPlaying(false);
      setTranslationPlaying(false);
    }
  }, [focus]);

  const level = LEVELS.find((item) => item.id === focus) || LEVELS[0];

  function resetView() {
    setFocus("cell");
    controlsRef.current?.reset();
  }

  function changeLevel() {
  setFocus(level.next);
}

  return (
    <main className="hierarchy-page">
      <header className="hierarchy-header">
        <div>
          <p className="hierarchy-eyebrow">GENEVISION / EXPLORER 01</p>
          <h1>Biological Hierarchy</h1>
          <p className="hierarchy-subtitle">
            Journey from the cell toward the genetic blueprint of life.
          </p>
        </div>

        <span className="hierarchy-live">
          <span /> INTERACTIVE 3D
        </span>
      </header>

      
<nav className="hierarchy-path" aria-label="Biological hierarchy">
  {["Cell", "Nucleus", "Chromosome", "DNA"].map(
    (name, index) => {
     const currentIndex = {
  cell: 0,
  nucleus: 1,
  chromosome: 2,
  dna: 3,
}[focus];

      return (
        <div className="hierarchy-path-item" key={name}>
          <span
            className={`hierarchy-step ${
              index === currentIndex ? "active" : ""
            }`}
          >
            {String(index + 1).padStart(2, "0")} {name}
          </span>

          {index < 3 && (
            <span className="hierarchy-path-arrow">→</span>
          )}
        </div>
      );
    }
  )}
</nav>


      <section className="hierarchy-layout">
        <div className="hierarchy-viewer-card">
          <div className="hierarchy-viewer-heading">
            <div>
              <span className="hierarchy-label">CURRENT LEVEL</span>
              <h2>{level.title}</h2>
              <p>{level.subtitle}</p>
            </div>

            <button
              className="hierarchy-icon-button"
              onClick={resetView}
              title="Reset camera"
              aria-label="Reset camera"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="hierarchy-canvas">
            <Canvas
              camera={{ position: [0, 0, 8], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ gl }) => {
                gl.setClearColor("#070b18", 1);
              }}
            >
              <color attach="background" args={["#070b18"]} />
              <ambientLight intensity={1.5} />
              <pointLight position={[4, 5, 5]} intensity={35} color="#67e8f9" />
              <pointLight position={[-4, -3, 2]} intensity={22} color="#8b5cf6" />

              <Stars
                radius={45}
                depth={25}
                count={450}
                factor={2}
                fade
                speed={0.25}
              />

 <CellModel
  focus={focus}
  setFocus={setFocus}
  transcriptionPlaying={transcriptionPlaying}
  transcriptionResetKey={transcriptionResetKey}
  simulationMode={simulationMode}
  translationPlaying={translationPlaying}
  translationResetKey={translationResetKey}
  setTranslationProgress={setTranslationProgress}
/>

              <CameraFocus focus={focus} controlsRef={controlsRef} />

              <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={0.07}
                minDistance={1.1}
                maxDistance={14}
                enablePan
              />
            </Canvas>

            {showLabels && (
              <div className="hierarchy-canvas-label">
                <span className="hierarchy-label-dot" />
                {focus === "cell"
  ? "CELL MEMBRANE · NUCLEUS · ORGANELLES"
  : focus === "nucleus"
    ? "NUCLEAR ENVELOPE · NUCLEAR PORES · CHROMATIN"
    : focus === "chromosome"
      ? "CHROMOSOME · SISTER CHROMATIDS · CENTROMERE"
      : "DNA DOUBLE HELIX · BASE PAIRS · TRANSCRIPTION"}
              </div>
            )}

            <span className="hierarchy-illustration-tag">
              EDUCATIONAL ILLUSTRATION
            </span>
          </div>
            {focus === "dna" && (
  <>
    <DNASequencePanel />

    <section className="transcription-panel">
      <div className="transcription-heading">
        <div>
          <span className="hierarchy-label">
            GENEVISION / MODULE 05
          </span>
          <h3>{simulationMode === "transcription" ? "DNA Transcription" : "mRNA Translation"}</h3>
          <p>
            {simulationMode === "transcription"
              ? "Explore the DNA sequence and its corresponding messenger RNA."
              : "Watch the mRNA codons guide amino-acid assembly into a protein."}
          </p>
        </div>

        <span className="transcription-badge">
          {simulationMode === "transcription"
            ? transcriptionPlaying ? "ANIMATION ACTIVE" : "READY"
            : translationPlaying ? "ANIMATION ACTIVE" : "READY"}
        </span>
      </div>

      <div
  className="process-mode-selector"
  role="group"
  aria-label="Gene process mode"
>
  <button
  type="button"
  onClick={() => {
    setTranscriptionPlaying(false);

    setTranscriptionResetKey(
      (value) => value + 1
    );

    setTranscriptionPlaying(true);
  }}
>
  Transcription
</button>

  <button
    type="button"
    className={simulationMode === "translation" ? "active" : ""}
    onClick={() => {
      setTranscriptionPlaying(false);
      setTranslationPlaying(false);
      setTranslationResetKey((value) => value + 1);
      setSimulationMode("translation");
    }}
  >
    Translation
  </button>
</div>

      <div className="transcription-sequence">
        {simulationMode === "transcription" ? (
          <>
            <span>DNA CODING STRAND</span>
            <strong>{TRANSCRIPTION_DNA}</strong>
            <span>MESSENGER RNA (mRNA)</span>
            <strong className="mrna-sequence">{getMRNASequence(TRANSCRIPTION_DNA)}</strong>
          </>
        ) : (
          <>
            <span>mRNA CODONS</span>
            <strong className="mrna-sequence">{getMRNASequence(TRANSCRIPTION_DNA).match(/.{1,3}/g)?.join(" · ")}</strong>
            <span>EXPECTED PROTEIN</span>
            <strong>Met – Ala – Phe – Gln – Gly – STOP</strong>
          </>
        )}
      </div>

      <div className="transcription-controls">
        {simulationMode === "transcription" ? (
          <>
            <button type="button" onClick={() => {
              setTranscriptionPlaying(true);
              setTranscriptionResetKey((value) => value + 1);
            }}>Start transcription</button>
            <button type="button" onClick={() => setTranscriptionPlaying((value) => !value)}>
              {transcriptionPlaying ? "Pause" : "Resume"}
            </button>
            <button type="button" onClick={() => {
              setTranscriptionPlaying(true);
              setTranscriptionResetKey((value) => value + 1);
            }}>Restart</button>
            <button type="button" onClick={() => {
              setTranscriptionPlaying(false);
              setTranscriptionResetKey((value) => value + 1);
            }}>Reset</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => {
              setTranslationPlaying(true);
              setTranslationResetKey((value) => value + 1);
            }}>Start translation</button>
            <button type="button" onClick={() => setTranslationPlaying((value) => !value)}>
              {translationPlaying ? "Pause" : "Resume"}
            </button>
            <button type="button" onClick={() => {
              setTranslationPlaying(false);
              setTranslationResetKey((value) => value + 1);
            }}>Reset</button>
          </>
        )}
      </div>

      <p className="transcription-note">
        {simulationMode === "transcription"
          ? "Educational sample: the coding DNA sequence corresponds to the mRNA sequence, with T replaced by U."
          : "Educational sample: translation is simplified to show codon recognition and amino-acid assembly at the ribosome."}
      </p>
    </section>
    {simulationMode === "translation" && (
  <TranslationInfoPanel
    sequence={getMRNASequence(TRANSCRIPTION_DNA)}
    activeIndex={translationProgress.activeIndex}
    completed={translationProgress.completed}
  />
)}
  </>
)}

          <div className="hierarchy-controls">
            
<button
  className="hierarchy-control primary"
  onClick={changeLevel}
>
  {focus === "dna" ? <ArrowLeft size={17} /> : <ZoomIn size={17} />}
  {level.action}
  {focus !== "dna" && <ArrowRight size={17} />}
</button>

            <button
              className="hierarchy-control"
              onClick={() => setShowLabels((value) => !value)}
            >
              {showLabels ? "Hide labels" : "Show labels"}
            </button>

            <button
              className="hierarchy-control"
              onClick={() => {
                const distance = controlsRef.current?.getDistance();
                if (distance && controlsRef.current) {
                  controlsRef.current.minDistance = 2;
                  controlsRef.current.maxDistance = 14;
                }
              }}
            >
              <ZoomIn size={17} /> Explore
            </button>
          </div>

          <p className="hierarchy-hint">
            Drag to rotate · Scroll to zoom · Right-click and drag to pan
          </p>
        </div>

        <aside className="hierarchy-sidebar">
          <section className="hierarchy-info-card">
            <span className="hierarchy-label">BIOLOGY GUIDE</span>
            <h2>{level.title}</h2>
            <p>{level.description}</p>

            <div className="hierarchy-fact">
              <CircleHelp size={18} />
              <p>
  {focus === "cell"
  ? "The cell contains a nucleus, cytoplasm and specialized organelles. Continue into the nucleus to explore where most cellular DNA is stored."
  : focus === "nucleus"
    ? "The nucleus contains chromatin, nucleoli and nuclear pores. Chromatin condenses to form chromosomes during cell division."
    : focus === "chromosome"
      ? "The chromosome model shows two sister chromatids joined at a centromere. Each chromatid contains a DNA molecule packaged with proteins."
      : "DNA consists of two complementary nucleotide strands. Explore A–T and G–C base pairing, then follow the simplified transcription and translation processes."}
              </p>
            </div>

            
<button
  className="hierarchy-next-button"
  onClick={changeLevel}
>
  {level.action}
 {focus === "dna" ? (
  <ArrowLeft size={17} />
) : (
  <ArrowRight size={17} />
)}
</button>

          </section>

          <section className="hierarchy-info-card">
            <span className="hierarchy-label">YOUR JOURNEY</span>
           
<div
  className={`hierarchy-journey-row ${
    focus === "cell" ? "active" : ""
  }`}
>
  <span>01</span>
  <div>
    <strong>Cell</strong>
    <p>Membrane and cytoplasm</p>
  </div>
</div>

<div
  className={`hierarchy-journey-row ${
    focus === "nucleus" ? "active" : ""
  }`}
>
  <span>02</span>
  <div>
    <strong>Nucleus</strong>
    <p>Chromatin and nucleolus</p>
  </div>
</div>

<div
  className={`hierarchy-journey-row ${
    focus === "chromosome" ? "active" : ""
  }`}
>
  <span>03</span>
  <div>
    <strong>Chromosome</strong>
    <p>Sister chromatids and centromere</p>
  </div>
</div>

<div className="hierarchy-journey-row upcoming">
  <span>04</span>
  <div>
    <strong>DNA and gene</strong>
    <p>Next development stage</p>
  </div>
</div>

          </section>

          <p className="hierarchy-disclaimer">
            Simplified educational model. Shapes and positions are illustrative,
            not to scale.
          </p>
        </aside>
      </section>
    </main>
  );
}
