
import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./GeneExplorer3D.css";

const SEQUENCE = "ATGCGTACGTTAGCTAGGCTAACGTAGCTGAC";

const COMPLEMENT = {
  A: "T",
  T: "A",
  G: "C",
  C: "G",
};

const COLORS = {
  A: "#22c55e",
  T: "#f97316",
  G: "#3b82f6",
  C: "#a855f7",
};

const REGIONS = [
  { name: "Gene region 1", start: 1, end: 10 },
  { name: "Gene region 2", start: 11, end: 20 },
  { name: "Gene region 3", start: 21, end: 30 },
  { name: "Entire sequence", start: 1, end: SEQUENCE.length },
];

function Bond({ start, end, color, radius = 0.035 }) {
  const direction = new THREE.Vector3().subVectors(end, start);

  const midpoint = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5);

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, direction.length(), 8]} />
      <meshStandardMaterial color={color} roughness={0.35} />
    </mesh>
  );
}

function Nucleotide({
  position,
  base,
  index,
  strand,
  selected,
  highlighted,
  onSelect,
}) {
  const isSelected =
    selected?.position === index + 1 &&
    selected?.strand === strand;

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelect({
            position: index + 1,
            base,
            strand,
            complement: COMPLEMENT[base],
          });
        }}
      >
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          color={COLORS[base]}
          emissive={isSelected ? "#ffffff" : COLORS[base]}
          emissiveIntensity={isSelected ? 0.8 : highlighted ? 0.5 : 0.12}
          metalness={0.3}
          roughness={0.25}
        />
      </mesh>

      {(isSelected || highlighted) && (
        <mesh>
          <sphereGeometry args={[isSelected ? 0.23 : 0.19, 20, 20]} />
          <meshBasicMaterial
            color={isSelected ? "#ffffff" : "#facc15"}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

function DNAHelix({
  selected,
  setSelected,
  region,
}) {
  const dna = useMemo(() => {
    const pairs = [];
    const backboneA = [];
    const backboneB = [];

    const radius = 1.5;
    const turns = 3;
    const height = 7;

    for (let i = 0; i < SEQUENCE.length; i++) {
      const angle = (i / SEQUENCE.length) * turns * Math.PI * 2;
      const z = (i / (SEQUENCE.length - 1) - 0.5) * height;

      const a = new THREE.Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        z
      );

      const b = new THREE.Vector3(
        radius * Math.cos(angle + Math.PI),
        radius * Math.sin(angle + Math.PI),
        z
      );

      backboneA.push(a);
      backboneB.push(b);

      const base = SEQUENCE[i];

      pairs.push({
        index: i,
        a,
        b,
        base,
        complement: COMPLEMENT[base],
      });
    }

    return { pairs, backboneA, backboneB };
  }, []);

  const isHighlighted = (index) =>
    index + 1 >= region.start && index + 1 <= region.end;

  return (
    <group rotation={[0.15, 0, 0]}>
      {/* DNA sugar-phosphate backbones */}
      {[dna.backboneA, dna.backboneB].map((strand, strandIndex) => (
        <group key={strandIndex}>
          {strand.map((point, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <Bond
                  start={strand[i - 1]}
                  end={point}
                  color={
                    isHighlighted(i) ? "#facc15" :
                    strandIndex === 0 ? "#06b6d4" : "#8b5cf6"
                  }
                  radius={0.075}
                />
              )}

              <mesh position={point}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial
                  color={strandIndex === 0 ? "#06b6d4" : "#8b5cf6"}
                  emissive={isHighlighted(i) ? "#facc15" : "#000000"}
                  emissiveIntensity={isHighlighted(i) ? 0.45 : 0}
                />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      ))}

      {/* Nucleotide pairs */}
      {dna.pairs.map((pair) => {
        const highlighted = isHighlighted(pair.index);

        return (
          <group key={pair.index}>
            <Bond
              start={pair.a}
              end={pair.b}
              color={highlighted ? "#facc15" : "#64748b"}
              radius={highlighted ? 0.055 : 0.035}
            />

            <Nucleotide
              position={pair.a}
              base={pair.base}
              index={pair.index}
              strand="A"
              selected={selected}
              highlighted={highlighted}
              onSelect={setSelected}
            />

            <Nucleotide
              position={pair.b}
              base={pair.complement}
              index={pair.index}
              strand="B"
              selected={selected}
              highlighted={highlighted}
              onSelect={setSelected}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function GeneExplorer3D() {
  const [selected, setSelected] = useState(null);
  const [regionIndex, setRegionIndex] = useState(0);

  const region = REGIONS[regionIndex];

  return (
    <div className="gene3d-page">

      <div className="gene3d-heading">
        <div>
          <span className="gene3d-label">GENEVISION / MODULE 03</span>
          <h2>3D DNA Explorer</h2>
          <p>Interactive molecular structure and nucleotide inspection</p>
        </div>

        <span className="gene3d-status">● 3D ENGINE ACTIVE</span>
      </div>

      <div className="gene3d-workspace">

        <div className="gene3d-viewer">
          <div className="gene3d-viewer-label">
            DNA DOUBLE HELIX
          </div>

          <Canvas
             camera={{
    position: [7, 5, 9],
    fov: 42,
    near: 0.1,
    far: 100,
  }}
  gl={{ antialias: true }}
  style={{
    width: "100%",
    height: "100%",
    display: "block",
  }}
>
          
            <color attach="background" args={["#080d1b"]} />

            <ambientLight intensity={1.5} />

            <directionalLight
              position={[5, 5, 8]}
              intensity={2.5}
            />

            <pointLight
              position={[-5, 0, 5]}
              intensity={1.5}
              color="#06b6d4"
            />

            <DNAHelix
              selected={selected}
              setSelected={setSelected}
              region={region}
            />

            <OrbitControls
              makeDefault
              enableDamping
              autoRotate
              autoRotateSpeed={0.5}
              minDistance={4}
              maxDistance={18}
            />
          </Canvas>

          <div className="gene3d-controls">
            <span>Drag to rotate</span>
            <span>Scroll to zoom</span>
            <span>Click a nucleotide to inspect</span>
          </div>
        </div>

        <aside className="gene3d-panel">

          <h3>Nucleotide Inspector</h3>

          {selected ? (
            <>
              <div className="gene3d-selected-base">
                <span style={{ color: COLORS[selected.base] }}>
                  {selected.base}
                </span>
                <div>
                  <strong>{selected.base === "A" ? "Adenine" :
                    selected.base === "T" ? "Thymine" :
                    selected.base === "G" ? "Guanine" : "Cytosine"}</strong>
                  <small>Selected nucleotide</small>
                </div>
              </div>

              <div className="gene3d-info-row">
                <span>Position</span>
                <strong>{selected.position}</strong>
              </div>

              <div className="gene3d-info-row">
                <span>Strand</span>
                <strong>{selected.strand}</strong>
              </div>

              <div className="gene3d-info-row">
                <span>Complementary base</span>
                <strong style={{ color: COLORS[selected.complement] }}>
                  {selected.complement}
                </strong>
              </div>

              <div className="gene3d-pair">
                Base pairing
                <h2>{selected.base} — {selected.complement}</h2>
                <small>
                  {["A", "T"].includes(selected.base)
                    ? "Adenine – Thymine (2 hydrogen bonds)"
                    : "Guanine – Cytosine (3 hydrogen bonds)"}
                </small>
              </div>
            </>
          ) : (
            <div className="gene3d-empty">
              <span>◎</span>
              <p>Select a nucleotide in the 3D model to inspect its properties.</p>
            </div>
          )}

          <hr />

          <h3>Gene Region Highlighting</h3>

          <select
            value={regionIndex}
            onChange={(e) => {
              setRegionIndex(Number(e.target.value));
              setSelected(null);
            }}
          >
            {REGIONS.map((item, i) => (
              <option key={i} value={i}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="gene3d-info-row">
            <span>Start position</span>
            <strong>{region.start}</strong>
          </div>

          <div className="gene3d-info-row">
            <span>End position</span>
            <strong>{region.end}</strong>
          </div>

          <div className="gene3d-info-row">
            <span>Nucleotide count</span>
            <strong>{region.end - region.start + 1}</strong>
          </div>

        </aside>
      </div>

      <section className="gene3d-sequence">
        <h3>DNA Sequence Viewer</h3>

        <div className="gene3d-sequence-grid">
          {SEQUENCE.split("").map((base, i) => (
            <button
              key={i}
              className={
                i + 1 >= region.start && i + 1 <= region.end
                  ? "gene3d-base active"
                  : "gene3d-base"
              }
              style={{ "--base-color": COLORS[base] }}
              onClick={() => {
                setSelected({
                  position: i + 1,
                  base,
                  strand: "A",
                  complement: COMPLEMENT[base],
                });
              }}
            >
              <span>{base}</span>
              <small>{i + 1}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="gene3d-legend">
        <h3>Nucleotide Legend</h3>
        {Object.entries(COLORS).map(([base, color]) => (
          <div key={base}>
            <span style={{ background: color }} />
            {base} — {{
              A: "Adenine",
              T: "Thymine",
              G: "Guanine",
              C: "Cytosine",
            }[base]}
          </div>
        ))}
      </section>

    </div>
  );
}
