import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import {
  ArrowLeft,
  Dna,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
} from "lucide-react";
import * as THREE from "three";
import "./ARVRLab.css";

const BASES = [
  { a: "A", b: "T", colorA: "#44e6a8", colorB: "#ffad5c" },
  { a: "G", b: "C", colorA: "#61a5ff", colorB: "#bd8aff" },
];

function makeHelix() {
  const radius = 1.15;
  const rungCount = 30;
  const points = [];

  for (let i = 0; i < rungCount; i++) {
    const angle = i * 0.52;
    const y = i * 0.25 - ((rungCount - 1) * 0.25) / 2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const oppositeX = -x;
    const oppositeZ = -z;

    const basePair = BASES[i % BASES.length];

    const start = new THREE.Vector3(x, y, z);
    const end = new THREE.Vector3(oppositeX, y, oppositeZ);
    const direction = end.clone().sub(start);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );

    points.push({
      key: i,
      angle,
      y,
      start: [x, y, z],
      end: [oppositeX, y, oppositeZ],
      middle: start.clone().add(end).multiplyScalar(0.5).toArray(),
      length: direction.length(),
      quaternion,
      ...basePair,
    });
  }

  return points;
}



function DNAHelix({ rotating, showPairs }) {
  const group = useRef();
  const pairs = useMemo(() => makeHelix(), []);

  useFrame((_, delta) => {
    if (group.current && rotating) {
      group.current.rotation.y += delta * 0.32;
    }
  });

  return (
    <group ref={group}>
      {pairs.map((pair) => (
        <group key={pair.key}>
          {/* Two nucleotide spheres */}
          <mesh position={pair.start}>
            <sphereGeometry args={[0.105, 16, 16]} />
            <meshStandardMaterial
              color={pair.colorA}
              emissive={pair.colorA}
              emissiveIntensity={0.35}
              roughness={0.3}
            />
          </mesh>

          <mesh position={pair.end}>
            <sphereGeometry args={[0.105, 16, 16]} />
            <meshStandardMaterial
              color={pair.colorB}
              emissive={pair.colorB}
              emissiveIntensity={0.35}
              roughness={0.3}
            />
          </mesh>

          {/* Base-pair rung */}
          {showPairs && (
            <mesh
              position={pair.middle}
              quaternion={pair.quaternion}
            >
              <cylinderGeometry args={[0.035, 0.035, pair.length, 8]} />
              <meshStandardMaterial
                color="#a4c9e8"
                metalness={0.3}
                roughness={0.35}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
async function checkWebXRSupport() {
  if (!navigator.xr) {
    return {
      vr: false,
      ar: false,
      message: "WebXR is not available in this browser.",
    };
  }

  const [vr, ar] = await Promise.all([
    navigator.xr
      .isSessionSupported("immersive-vr")
      .catch(() => false),

    navigator.xr
      .isSessionSupported("immersive-ar")
      .catch(() => false),
  ]);

  return {
    vr,
    ar,
    message:
      vr || ar
        ? "WebXR support detected."
        : "Immersive AR/VR is not supported in the current environment.",
  };
}

export default function ARVRLab() { const [xrSupport, setXrSupport] = useState({
    vr: false,
    ar: false,
    message: "Checking WebXR support...",
  });

  useEffect(() => {
    let active = true;

    checkWebXRSupport().then((result) => {
      if (active) {
        setXrSupport(result);
      }
    });

    return () => {
      active = false;
    };
  }, []);

    

  // Keep your existing ARVR

  const [rotating, setRotating] = useState(true);
  const [showPairs, setShowPairs] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedTool, setSelectedTool] = useState("rotate");

  function resetView() {
    setZoom(1);
    setRotating(true);
    setShowPairs(true);
    setSelectedTool("rotate");
  }

  return (
    <main className="arvr-page">
      <header className="arvr-header">
        <div className="arvr-brand">
          <div className="arvr-brand-icon">
            <Dna size={26} />
          </div>
          <div>
            <p className="arvr-eyebrow">GENEVISION / IMMERSIVE SCIENCE</p>
            <h1>AR / VR Laboratory</h1>
            <p className="arvr-subtitle">
              Explore the molecular architecture of DNA in 3D.
            </p>
          </div>
        </div>

        <div className="arvr-status">
          <span className="arvr-status-dot" />
          3D MODE ACTIVE
        </div>
      </header>

      <section className="arvr-layout">
        <div className="arvr-viewer-card">
          <div className="arvr-viewer-top">
            <div>
              <span className="arvr-small-label">LIVE VIEWPORT</span>
              <h2>DNA Double Helix</h2>
            </div>
            <button
              className="arvr-icon-button"
              onClick={resetView}
              title="Reset viewer"
              aria-label="Reset viewer"
            >
              <RotateCcw size={17} />
            </button>
          </div>

          <div className="arvr-canvas">
            <Canvas
              camera={{ position: [0, 0, 10], fov: 45 }}
              dpr={[1, 1.75]}
              gl={{ antialias: true, alpha: true }}
            >
              <color attach="background" args={["#080e1b"]} />
              <ambientLight intensity={1.1} />
              <pointLight position={[5, 5, 5]} intensity={65} />
              <pointLight
                position={[-5, -2, 3]}
                color="#536dff"
                intensity={30}
              />
              <Stars
                radius={55}
                depth={35}
                count={700}
                factor={2}
                saturation={0}
                fade
                speed={0.35}
              />

              <group scale={zoom}>
                <DNAHelix
                  rotating={rotating}
                  showPairs={showPairs}
                />
              </group>

              <OrbitControls
                enableDamping
                dampingFactor={0.07}
                minDistance={4}
                maxDistance={18}
                enablePan
              />
            </Canvas>

            <div className="arvr-canvas-label">
              <span className="arvr-live-dot" />
              INTERACTIVE 3D MODEL
            </div>
          </div>

          <div className="arvr-toolbar">
            <button
              className={rotating ? "arvr-tool active" : "arvr-tool"}
              onClick={() => setRotating(!rotating)}
            >
              {rotating ? <RotateCw size={17} /> : <RotateCcw size={17} />}
              {rotating ? "Pause rotation" : "Auto rotate"}
            </button>

            <button
              className="arvr-tool"
              onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))}
            >
              <ZoomIn size={17} />
              Zoom in
            </button>

            <button
              className="arvr-tool"
              onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))}
            >
              <ZoomOut size={17} />
              Zoom out
            </button>

            <button
              className={showPairs ? "arvr-tool active" : "arvr-tool"}
              onClick={() => setShowPairs(!showPairs)}
            >
              <Maximize2 size={17} />
              {showPairs ? "Hide base pairs" : "Show base pairs"}
            </button>
          </div>

          <p className="arvr-hint">
            Drag to rotate the camera · Scroll to zoom · Right-click and drag to pan
          </p>
        </div>

        <aside className="arvr-sidebar">
{/* 
            <div className="xr-support-panel">
  <h3>WebXR Compatibility</h3>

  <p>
    VR:{" "}
    <strong>{xrSupport.vr ? "Supported" : "Not supported"}</strong>
  </p>

  <p>
    AR:{" "}
    <strong>{xrSupport.ar ? "Supported" : "Not supported"}</strong>
  </p>

  <p>{xrSupport.message}</p>

  {!xrSupport.vr && !xrSupport.ar && (
    <p>
      You can still explore the interactive 3D DNA model using your mouse
      or touchpad.
    </p>
  )}
</div> */}
          <section className="arvr-panel">
            <div className="arvr-panel-heading">
              <Info size={18} />
              <h3>Model information</h3>
            </div>

            <div className="arvr-info-row">
              <span>Structure</span>
              <strong>Double helix</strong>
            </div>
            <div className="arvr-info-row">
              <span>Illustrative base pairs</span>
              <strong>30</strong>
            </div>
            <div className="arvr-info-row">
              <span>Rendering</span>
              <strong>Real-time 3D</strong>
            </div>

            {/* <div className="arvr-disclaimer">
              <Info size={16} />
              <p>
                This is a simplified educational model, not an
                atomic-accurate molecular structure.
              </p> 
            </div> */}
          </section>

          <section className="arvr-panel">
            <div className="arvr-panel-heading">
              <Dna size={18} />
              <h3>Base pair legend</h3>
            </div>

            <div className="arvr-base-row">
              <span className="arvr-base-dot base-a" />
              <strong>Adenine (A)</strong>
              <span className="arvr-base-pair">pairs with T</span>
            </div>
            <div className="arvr-base-row">
              <span className="arvr-base-dot base-t" />
              <strong>Thymine (T)</strong>
              <span className="arvr-base-pair">pairs with A</span>
            </div>
            <div className="arvr-base-row">
              <span className="arvr-base-dot base-g" />
              <strong>Guanine (G)</strong>
              <span className="arvr-base-pair">pairs with C</span>
            </div>
            <div className="arvr-base-row">
              <span className="arvr-base-dot base-c" />
              <strong>Cytosine (C)</strong>
              <span className="arvr-base-pair">pairs with G</span>
            </div>
          </section>

          {/* <section className="arvr-panel arvr-next-panel">
            <span className="arvr-small-label">NEXT DEVELOPMENT</span>
            <h3>Immersive AR / VR</h3>
            <p>
              The next stage will add WebXR session support for
              compatible devices. This first version runs in regular
              browser-based 3D mode.
            </p>
            <button
              className="arvr-disabled-button"
              disabled
              title="WebXR support will be added in the next stage"
            >
              WebXR — Coming next
            </button>
          </section> */}
        </aside>
      </section>
    </main>
  );
}
