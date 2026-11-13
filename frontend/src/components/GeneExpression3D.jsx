import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./GeneExpression3D.css";

const BASE_COLORS = {
  A: "#4ade80",
  T: "#fb923c",
  G: "#60a5fa",
  C: "#c084fc",
  U: "#f472b6",
};

const COMPLEMENT = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

const CODON_TABLE = {
  TTT: "Phe", TTC: "Phe", TTA: "Leu", TTG: "Leu",
  TCT: "Ser", TCC: "Ser", TCA: "Ser", TCG: "Ser",
  TAT: "Tyr", TAC: "Tyr", TAA: "Stop", TAG: "Stop",
  TGT: "Cys", TGC: "Cys", TGA: "Stop", TGG: "Trp",
  CTT: "Leu", CTC: "Leu", CTA: "Leu", CTG: "Leu",
  CCT: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro",
  CAT: "His", CAC: "His", CAA: "Gln", CAG: "Gln",
  CGT: "Arg", CGC: "Arg", CGA: "Arg", CGG: "Arg",
  ATT: "Ile", ATC: "Ile", ATA: "Ile", ATG: "Met",
  ACT: "Thr", ACC: "Thr", ACA: "Thr", ACG: "Thr",
  AAT: "Asn", AAC: "Asn", AAA: "Lys", AAG: "Lys",
  AGT: "Ser", AGC: "Ser", AGA: "Arg", AGG: "Arg",
  GTT: "Val", GTC: "Val", GTA: "Val", GTG: "Val",
  GCT: "Ala", GCC: "Ala", GCA: "Ala", GCG: "Ala",
  GAT: "Asp", GAC: "Asp", GAA: "Glu", GAG: "Glu",
  GGT: "Gly", GGC: "Gly", GGA: "Gly", GGG: "Gly",
};

function getNucleotideInfo(sequence, position) {
  const cleanDNA = sequence.toUpperCase().replace(/[^ATGC]/g, "");
  const base = cleanDNA[position] || "-";
  const codonStart = Math.floor(position / 3) * 3;
  const codon = cleanDNA.slice(codonStart, codonStart + 3);
  const aminoAcid =
    codon.length === 3 ? CODON_TABLE[codon] || "Unknown" : "Incomplete codon";

  return {
    base,
    complement: COMPLEMENT[base] || "-",
    position: position + 1,
    codonNumber: Math.floor(position / 3) + 1,
    codon,
    aminoAcid,
  };
}

function Bond({ start, end, color = "#64748b", radius = 0.035 }) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(to, from);
  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, direction.length(), 8]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

function AnimatedGroup({ children, playing, speed = 1 }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (group.current && playing) {
      group.current.rotation.y += delta * 0.25 * speed;
    }
  });

  return <group ref={group}>{children}</group>;
}

function DNAVisual({ sequence, selectedPosition, onSelect }) {

const ATOM_COLORS = {
  C: "#b8c2cc", // Carbon
  N: "#3b82f6", // Nitrogen
  O: "#ef4444", // Oxygen
  P: "#f59e0b", // Phosphorus
};

const ATOM_RADII = {
  C: 0.075,
  N: 0.078,
  O: 0.072,
  P: 0.105,
};

// Complementary DNA bases
const COMPLEMENT = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

// Approximate molecular atom layouts for the nitrogenous bases.
// Purines have nine represented ring atoms; pyrimidines have six.
const BASE_ATOMS = {
  A: ["N", "C", "N", "C", "C", "N", "C", "N", "C"],
  G: ["N", "C", "N", "C", "C", "N", "C", "N", "C"],
  T: ["N", "C", "O", "C", "C", "O"],
  C: ["N", "C", "N", "C", "C", "O"],
};

function makeDNAAtomisticModel(sequence) {
const atoms = [];
const bonds = [];
const hydrogenBonds = [];
const basePairs = [];

  const bases = sequence
    .toUpperCase()
    .replace(/[^ATGC]/g, "")
    .slice(0, 24)
    .split("");

  const addAtom = (element, position, label) => {
    const id = atoms.length;
    atoms.push({ id, element, position, label });
    return id;
  };

  const addBond = (a, b, color = "#94a3b8", radius = 0.025) => {
    bonds.push({
      id: bonds.length,
      start: atoms[a].position,
      end: atoms[b].position,
      color,
      radius,
    });
  };

  // Rotate local molecular coordinates around the DNA axis.
  function worldPosition(u, y, v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return [
      u * cos - v * sin,
      y,
      u * sin + v * cos,
    ];
  }

  function addNucleotide(base, side, y, angle, strandIndex) {
    const centerU = side * 0.27;
    const baseElements = BASE_ATOMS[base];
    const ringIds = [];

    // Represent the base ring using individual atoms.
    baseElements.forEach((element, index) => {
      const count = baseElements.length;
      const a = (index / count) * Math.PI * 2;

      const u = centerU + Math.cos(a) * 0.235;
      const v = Math.sin(a) * 0.235;

      ringIds.push(
        addAtom(
          element,
          worldPosition(u, y, v, angle),
          `${base}-base`
        )
      );
    });

    // Connect the nitrogenous base ring.
    for (let i = 0; i < ringIds.length; i++) {
      addBond(
        ringIds[i],
        ringIds[(i + 1) % ringIds.length],
        "#a5b4fc",
        0.026
      );
    }

    // Sugar ring: five represented atoms.
    const sugarIds = [];
    const sugarCenter = side * 1.05;

    const sugarElements = ["C", "C", "C", "O", "C"];

    const sugarOffsets = [
      [0.15, 0.00],
      [0.05, 0.14],
      [-0.11, 0.09],
      [-0.11, -0.09],
      [0.05, -0.14],
    ];

    sugarOffsets.forEach(([du, dy], index) => {
      sugarIds.push(
        addAtom(
          sugarElements[index],
          worldPosition(
            sugarCenter + du * side,
            y + dy,
            0,
            angle
          ),
          "deoxyribose"
        )
      );
    });

    for (let i = 0; i < sugarIds.length; i++) {
      addBond(
        sugarIds[i],
        sugarIds[(i + 1) % sugarIds.length],
        "#94a3b8",
        0.028
      );
    }

    // Connect the base to its sugar.
    const outerBaseAtom = side === -1 ? 3 : 0;
    addBond(
      ringIds[outerBaseAtom],
      sugarIds[0],
      "#94a3b8",
      0.028
    );

    // Phosphate group.
    const phosphateU = side * 1.55;

    const phosphateId = addAtom(
      "P",
      worldPosition(phosphateU, y + 0.16, 0, angle),
      "phosphate"
    );

    const oxygenOffsets = [
      [0.13, 0.08],
      [-0.13, 0.08],
      [0, -0.15],
    ];

    oxygenOffsets.forEach(([du, dy]) => {
      const oxygenId = addAtom(
        "O",
        worldPosition(
          phosphateU + du * side,
          y + 0.16 + dy,
          0,
          angle
        ),
        "phosphate oxygen"
      );

      addBond(phosphateId, oxygenId, "#f59e0b", 0.03);
    });

    // Connect sugar to phosphate.
    addBond(
      sugarIds[2],
      phosphateId,
      "#f59e0b",
      0.035
    );

    return {
  phosphateId,
  sugarStart: sugarIds[0],
  baseIds: ringIds,
  baseCenter: worldPosition(centerU, y, 0, angle),
};
  }

  const previous = [null, null];

  bases.forEach((base, index) => {
    const complement = COMPLEMENT[base];

    const y = (index - (bases.length - 1) / 2) * 0.42;
    const angle = index * ((Math.PI * 2) / 10.5);

    const first = addNucleotide(
      base,
      -1,
      y,
      angle,
      0
    );

    const second = addNucleotide(
      complement,
      1,
      y,
      angle,
      1
    );

    basePairs.push({
    index,
    base,
    complement,
    firstPosition: first.baseCenter,
    secondPosition: second.baseCenter,
    });

    // Connect adjacent nucleotides along each backbone.
    [first, second].forEach((nucleotide, strand) => {
      if (previous[strand]) {
        addBond(
          previous[strand].phosphateId,
          nucleotide.sugarStart,
          "#f59e0b",
          0.035
        );
      }

      previous[strand] = nucleotide;
    });

    // Approximate hydrogen-bond locations between base pairs.
    // A-T: two; G-C: three.
    const count =
      (base === "A" || base === "T") ? 2 : 3;

    for (let j = 0; j < count; j++) {
      const offset = (j - (count - 1) / 2) * 0.105;

      hydrogenBonds.push({
        id: hydrogenBonds.length,
        start: worldPosition(-0.035, y, offset, angle),
        end: worldPosition(0.035, y, offset, angle),
      });
    }
  });

  return {
  atoms,
  bonds,
  hydrogenBonds,
  basePairs,
  baseCount: bases.length,
};
}

function MolecularAtom({ atom }) {
  const color = ATOM_COLORS[atom.element];
  const radius = ATOM_RADII[atom.element];

  return (
    <mesh position={atom.position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.12}
      />
    </mesh>
  );
}

  const molecule = useMemo(
    () => makeDNAAtomisticModel(sequence),
    [sequence]
  );

  return (
    <group>
      {molecule.bonds.map((bond) => (
        <Bond
          key={`bond-${bond.id}`}
          start={bond.start}
          end={bond.end}
          color={bond.color}
          radius={bond.radius}
        />
      ))}

      {molecule.hydrogenBonds.map((bond) => (
        <Bond
          key={`hydrogen-${bond.id}`}
          start={bond.start}
          end={bond.end}
          color="#facc15"
          radius={0.018}
        />
      ))}

      {molecule.basePairs.map((pair) => {
  const selected = selectedPosition === pair.index;

  return (
    <group key={`pair-${pair.index}`}>
      {/* Highlight both bases in the selected pair */}
      {selected && (
        <>
          <mesh position={pair.firstPosition}>
            <sphereGeometry args={[0.31, 20, 20]} />
            <meshBasicMaterial
              color="#facc15"
              transparent
              opacity={0.28}
              depthWrite={false}
            />
          </mesh>

          <mesh position={pair.secondPosition}>
            <sphereGeometry args={[0.31, 20, 20]} />
            <meshBasicMaterial
              color="#facc15"
              transparent
              opacity={0.28}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* Clickable hotspot for first strand */}
      <mesh
        position={pair.firstPosition}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(pair.index, 0);
        }}
      >
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Clickable hotspot for complementary strand */}
      <mesh
        position={pair.secondPosition}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(pair.index, 1);
        }}
      >
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
  })}

      {molecule.atoms.map((atom) => (
        <MolecularAtom
          key={`atom-${atom.id}`}
          atom={atom}
        />
      ))}
    </group>
  );
}


function RNAVisual({ sequence }) {
  const bases = sequence.slice(0, 40).split("");

  const points = useMemo(
    () =>
      bases.map((base, i) => [
        Math.sin(i * 0.45) * 0.65,
        (i - (bases.length - 1) / 2) * 0.25,
        Math.cos(i * 0.45) * 0.65,
      ]),
    [sequence]
  );

  return (
    <group>
      {points.map((point, i) => (
        <group key={i}>
          <mesh position={point}>
            <sphereGeometry args={[0.14, 20, 20]} />
            <meshStandardMaterial
              color={BASE_COLORS[bases[i]] || "#f472b6"}
              emissive={BASE_COLORS[bases[i]] || "#f472b6"}
              emissiveIntensity={0.12}
            />
          </mesh>

          {i > 0 && (
            <Bond
              start={points[i - 1]}
              end={point}
              color="#ec4899"
              radius={0.045}
            />
          )}
        </group>
      ))}
    </group>
  );
}

function ProteinVisual({ protein }) {
  const aminoAcids = protein.slice(0, 35);

  const points = useMemo(
    () =>
      aminoAcids.map((_, i) => {
        const angle = i * 0.8;
        const radius = 0.9 + Math.sin(i * 0.35) * 0.35;

        return [
          Math.cos(angle) * radius,
          Math.sin(i * 0.55) * 1.1,
          Math.sin(angle) * radius,
        ];
      }),
    [protein]
  );

  return (
    <group>
      {points.map((point, i) => (
        <group key={i}>
          <mesh position={point}>
            <sphereGeometry args={[0.19, 24, 24]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#a78bfa" : "#22d3ee"}
              roughness={0.3}
            />
          </mesh>

          {i > 0 && (
            <Bond
              start={points[i - 1]}
              end={point}
              color="#818cf8"
              radius={0.07}
            />
          )}
        </group>
      ))}
    </group>
  );
}

export default function GeneExpression3D({
  dna = "ATGGCTTTTCAAGGATAA",
  rna = "",
  protein = [],
  step = 0,
}) {
const [playing, setPlaying] = React.useState(true);
const [speed, setSpeed] = React.useState(1);

const [selectedPosition, setSelectedPosition] = React.useState(0);
const [selectedStrand, setSelectedStrand] = React.useState(0);

const controlsRef = useRef();

const cleanDNA = dna.toUpperCase().replace(/[^ATGC]/g, "").slice(0, 24);

const nucleotideInfo = getNucleotideInfo(
  cleanDNA,
  selectedPosition
);

const selectedBase =
  selectedStrand === 0
    ? nucleotideInfo.base
    : nucleotideInfo.complement;

const handleNucleotideSelect = (position, strand) => {
  setSelectedPosition(position);
  setSelectedStrand(strand);
};

  const stages = [
    {
      title: "DNA Double Helix",
      description: "Two complementary nucleotide strands form the DNA helix.",
      label: "DNA · DOUBLE STRANDED",
    },
    {
      title: "mRNA Strand",
      description: "Transcription produces an RNA sequence using U instead of T.",
      label: "mRNA · SINGLE STRANDED",
    },
    {
      title: "Protein Chain",
      description: "Translation converts codons into an amino-acid chain.",
      label: "PROTEIN · AMINO ACIDS",
    },
  ];

  const stage = Math.min(2, Math.max(0, Number(step) || 0));

  return (
    <section className="ge3d-panel">
      <div className="ge3d-heading">
        <div>
          <span className="ge3d-eyebrow">GENEVISION / 3D SIMULATION</span>
          <h2>Gene Expression in 3D</h2>
          <p>Explore the DNA → mRNA → Protein process in an interactive viewer.</p>
        </div>
        <span className="ge3d-live">3D ENGINE ACTIVE</span>
      </div>

      <div className="ge3d-viewer">
        <Canvas
          camera={{ position: [7, 3.5, 9], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#050b18"]} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 6, 5]} intensity={2} />
          <pointLight position={[-4, 2, -3]} intensity={1.2} color="#22d3ee" />

          <AnimatedGroup playing={playing} speed={speed}>
  {stage === 0 && (
    <DNAVisual
      sequence={cleanDNA}
      selectedPosition={selectedPosition}
      onSelect={handleNucleotideSelect}
    />
  )}

  {stage === 1 && (
    <RNAVisual sequence={rna || ""} />
  )}

  {stage === 2 && (
    <ProteinVisual protein={protein || []} />
  )}
</AnimatedGroup>

         <OrbitControls
  ref={controlsRef}
  enablePan
  enableZoom
  enableRotate
  minDistance={3}
  maxDistance={16}
  autoRotate={false}
/>
        </Canvas>

        <div className="ge3d-viewer-label">{stages[stage].label}</div>

        <div className="ge3d-viewer-hint">Drag to rotate · Scroll to zoom</div>
      </div>

{stage === 0 && (
  <div className="ge3d-sequence-panel">
    <div className="ge3d-section-title">
      DNA SEQUENCE
      <span>SELECT A NUCLEOTIDE</span>
    </div>

    <div className="ge3d-sequence">
      {cleanDNA.split("").map((base, index) => (
        <button
          key={index}
          className={`ge3d-sequence-base ${
            selectedPosition === index ? "selected" : ""
          } base-${base}`}
          onClick={() => handleNucleotideSelect(index, 0)}
          title={`Position ${index + 1}: ${base}`}
        >
          {base}
        </button>
      ))}
    </div>
  </div>
)}


      <div className="ge3d-atom-legend">
  <span><i className="atom-carbon" /> Carbon</span>
  <span><i className="atom-nitrogen" /> Nitrogen</span>
  <span><i className="atom-oxygen" /> Oxygen</span>
  <span><i className="atom-phosphorus" /> Phosphorus</span>
  <span><i className="atom-hydrogen" /> Hydrogen bonds</span>
</div>

      <div className="ge3d-stage-info">
        <div>
          <span>VISUALIZATION STAGE 0{stage + 1}</span>
          <h3>{stages[stage].title}</h3>
          <p>{stages[stage].description}</p>
        </div>
      </div>

      <div className="ge3d-controls">
        <button onClick={() => setPlaying(!playing)}>
          {playing ? "Pause rotation" : "Resume rotation"}
        </button>
        <button onClick={() => controlsRef.current?.reset()}>
  Reset camera
</button>

        <button onClick={() => setSpeed(1)}>Normal speed</button>
        <button onClick={() => setSpeed(2)}>2× speed</button>
        <button onClick={() => setSpeed(0.5)}>0.5× speed</button>
      </div>

      <div className="ge3d-note">
        Educational 3D representation. These procedural models illustrate
        molecular structure and are not atomically accurate molecular models.
      </div>
    </section>
  );
}