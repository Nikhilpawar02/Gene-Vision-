import { useCallback, useState } from "react";
import {
  Activity,
  BrainCircuit,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  Dna,
  FlaskConical,
  Glasses,
  LayoutDashboard,
  Menu,
  Microscope,
  Search,
  Settings,
  Sparkles,
  Waypoints,
  X,
} from "lucide-react";

import "./index.css";

import GeneDataPanel from "./components/GeneDataPanel";
import MutationLab from "./components/MutationLab";
import GeneExpression from "./components/GeneExpression";
import GeneTutor from "./components/GeneTutor";
import ARVRLab from "./components/ARVRLab";
import BiologicalHierarchy from "./components/BiologicalHierarchy";
import GeneExplorer3D from "./components/GeneExplorer3D";
import GeneExpression3D from "./components/GeneExpression3D";
import ProteinFolding3D from "./components/ProteinFolding3D";
import GeneAIAnalysis from "./components/GeneAIAnalysis";



const modules = [
  {
    id: "explorer",
    number: "01",
    title: "3D Gene Explorer",
    description: "Explore DNA structures and genetic information in 3D.",
    icon: Dna,
    tag: "INTERACTIVE 3D",
    color: "cyan",
  },
  {
    id: "expression",
    number: "02",
    title: "Gene Expression",
    description: "Discover how DNA instructions become proteins.",
    icon: Activity,
    tag: "DNA → RNA → PROTEIN",
    color: "purple",
  },
  {
    id: "mutation",
    number: "03",
    title: "Mutation Lab",
    description: "Change DNA bases and compare sequence outcomes.",
    icon: FlaskConical,
    tag: "SEQUENCE ANALYSIS",
    color: "orange",
  },
  {
    id: "tutor",
    number: "04",
    title: "AI Gene Tutor",
    description: "Explore genetics concepts with guided explanations.",
    icon: BrainCircuit,
    tag: "AI LEARNING",
    color: "blue",
  },
  {
  id: "ai-analysis",
  number: "07",
  title: "AI Gene Analysis",
  description: "Classify DNA sequences using a trained CNN model.",
  icon: BrainCircuit,
  tag: "CNN PREDICTION",
  color: "green",
},
  {
    id: "immersive",
    number: "05",
    title: "Immersive Lab",
    description: "Prepare to explore biological structures in AR/VR.",
    icon: Glasses,
    tag: "WEBXR READY",
    color: "pink",
  },
  {
    id: "insights",
    number: "06",
    title: "Gene Insights",
    description: "Understand sequence patterns and simulation results.",
    icon: ChartNoAxesCombined,
    tag: "DATA EXPLORATION",
    color: "green",
  },


];

const sampleSequence = "ATG GCT TTT CAA GGA TAA";

function DnaArt() {
  const pairs = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21;
    const angle = t * Math.PI * 4.6;

    return {
      y: 24 + t * 310,
      x1: 140 + Math.sin(angle) * 54,
      x2: 140 - Math.sin(angle) * 54,
    };
  });

  return (
    <svg
      className="dna-art"
      viewBox="0 0 280 360"
      role="img"
      aria-label="Illustrative DNA double helix"
    >
      <defs>
        <linearGradient id="strandA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ce5f3" />
          <stop offset="100%" stopColor="#6578ff" />
        </linearGradient>

        <linearGradient id="strandB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a58bff" />
          <stop offset="100%" stopColor="#f17ccf" />
        </linearGradient>
      </defs>

      {pairs.map((p, i) => (
        <line
          key={`rung-${i}`}
          x1={p.x1}
          y1={p.y}
          x2={p.x2}
          y2={p.y}
          stroke={i % 2 ? "#7186fa" : "#53dce9"}
          strokeOpacity="0.42"
          strokeWidth="2"
        />
      ))}

      {["x1", "x2"].map((key, strandIndex) => (
        <polyline
          key={key}
          points={pairs.map((p) => `${p[key]},${p.y}`).join(" ")}
          fill="none"
          stroke={strandIndex ? "url(#strandB)" : "url(#strandA)"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {pairs
        .filter((_, i) => i % 3 === 0)
        .map((p, i) => (
          <g key={`node-${i}`}>
            <circle cx={p.x1} cy={p.y} r="4" fill="#67e8f9" />
            <circle cx={p.x2} cy={p.y} r="4" fill="#c4b5fd" />
          </g>
        ))}
    </svg>
  );
}

function Sidebar({ active, setActive, open, close }) {
  // const items = [
  //   { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  //  // { id: "explorer", label: "Gene Explorer", icon: Dna },  
  //   { id: "arvrlab", label: "Gene Explorer", icon: Dna }, 
  //   { id: "expression", label: "Gene Expression", icon: Activity },
  //   { id: "mutation", label: "Mutation Lab", icon: FlaskConical },
  //   { id: "tutor", label: "AI Gene Tutor", icon: BrainCircuit },
  //   { id: "hierarchy", label: "Biological Explorer", icon: Microscope },
  // ];

const items = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "explorer", label: "3D Gene Explorer", icon: Dna },
  { id: "expression", label: "Gene Expression", icon: Activity },
  { id: "mutation", label: "Mutation Lab", icon: FlaskConical },
  { id: "tutor", label: "AI Gene Tutor", icon: BrainCircuit },
  { id: "ai-analysis", label: "AI Gene Analysis", icon: Activity },
  { id: "arvrlab", label: "Immersive Lab", icon: Glasses },
  { id: "hierarchy", label: "Biological Explorer", icon: Microscope },
];

  const navigate = (id) => {
    setActive(id);
    close();
  };

  return (
    <>
      {open && (
        <button
          className="mobile-scrim"
          onClick={close}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Dna size={25} />
          </div>

          <div>
            <div className="brand-name">
              GeneVision<span>•</span>
            </div>
            <div className="brand-caption">GENETICS EXPLORER</div>
          </div>

          <button
            className="icon-button mobile-close"
            onClick={close}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-list">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${active === id ? "nav-active" : ""}`}
              onClick={() => navigate(id)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {active === id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Sparkles size={17} />
            </div>

            <strong>Your virtual genetics lab</strong>

            <p>
              Learn, explore and experiment with genetic concepts.
            </p>

            <button onClick={() => navigate("tutor")}>
              Explore AI Tutor <ChevronRight size={15} />
            </button>
          </div>

          <button
            className={`nav-item settings-link ${
              active === "settings" ? "nav-active" : ""
            }`}
            onClick={() => navigate("settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="sidebar-footer">
            GENEVISION • EDUCATIONAL PROTOTYPE
          </div>
        </div>
      </aside>
    </>
  );
}

function ModuleCard({ module, onOpen }) {
  const Icon = module.icon;

  return (
    <button
      className="module-card"
      onClick={() => onOpen(module.id)}
    >
      <div className="module-top">
        <div className={`module-icon ${module.color}`}>
          <Icon size={21} />
        </div>
        <span className="module-number">{module.number}</span>
      </div>

      <div className="module-tag">{module.tag}</div>

      <h3>{module.title}</h3>

      <p>{module.description}</p>

      <div className="module-link">
        Open module <ChevronRight size={15} />
      </div>
    </button>
  );
}

function Dashboard({ setActive }) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="status-dot" /> YOUR GENETICS WORKSPACE
          </div>

          <h1>
            Explore the <span>building blocks</span>
            <br className="desktop-break" /> of life.
          </h1>

          <p className="welcome-copy">
            Step inside the world of genetics. Explore biological
            structures, understand gene expression and experiment
            with DNA sequences.
          </p>

          <button
            className="primary-button"
            onClick={() => setActive("explorer")}
          >
            <Dna size={18} />
            Enter Gene Explorer
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="hero-glow" />

          <DnaArt />

          <div className="floating-label label-top">
            <span className="label-dot cyan-dot" />
            DOUBLE HELIX
          </div>

          <div className="floating-label label-bottom">
            <span className="label-dot purple-dot" />
            MOLECULAR VIEW
          </div>

          <div className="coordinate">
            GEN / 001
            <br />
            23° 04&apos; DNA
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon cyan">
            <Dna size={19} />
          </div>

          <div>
            <span className="stat-label">LEARNING MODULES</span>
            <div className="stat-value">
              06 <small>planned</small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Microscope size={19} />
          </div>

          <div>
            <span className="stat-label">GENE EXPLORER</span>
            <div className="stat-value">
              Ready <small>UI prototype</small>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <FlaskConical size={19} />
          </div>

          <div>
            <span className="stat-label">SIMULATION ENGINE</span>
            <div className="stat-value">
              Active <small>mutation & expression</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <div className="eyebrow">DISCOVER YOUR WORKSPACE</div>
          <h2>Explore your lab</h2>
          <p>Choose a module to begin your journey through genetics.</p>
        </div>

        <span className="section-count">06 MODULES</span>
      </section>

      <section className="module-grid">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onOpen={setActive}
          />
        ))}
      </section>

      <section className="sequence-panel">
        <div className="sequence-heading">
          <div className="module-icon cyan">
            <Waypoints size={20} />
          </div>

          <div>
            <h3>Your first DNA sequence</h3>
            <p>
              Illustrative sample • not a patient or diagnostic record
            </p>
          </div>

          <span className="sample-badge">SAMPLE DATA</span>
        </div>

        <div className="sequence-letters">
          {sampleSequence.split(" ").map((codon, i) => (
            <span
              className={`codon codon-${i % 4}`}
              key={`${codon}-${i}`}
            >
              {codon}
            </span>
          ))}
        </div>

        <div className="sequence-foot">
          <span>6 codons including the stop codon</span>

          <button onClick={() => setActive("mutation")}>
            Try the Mutation Lab <ChevronRight size={15} />
          </button>
        </div>
      </section>

      <GeneDataPanel />
    </>
  );
}

function ModulePage({ active, setActive }) {
  const content = {
    immersive: {
      subtitle: "Prepare to enter an immersive biological world.",
      heading: "Immersive lab — coming next",
      body: "The future module will investigate WebXR support and immersive controls. Actual AR/VR features depend on the browser, device and available hardware.",
      next: "Next build: check WebXR support and add an immersive scene.",
      icon: Glasses,
    },

    insights: {
      subtitle: "Understand your simulation outputs.",
      heading: "Genetic insights",
      body: "Explore sequence statistics and educational examples of computational outcomes. Biological interpretations require validated scientific data.",
      next: "Next build: sequence metrics and result visualizations.",
      icon: ChartNoAxesCombined,
    },

    settings: {
      subtitle: "Application preferences.",
      heading: "GeneVision settings",
      body: "This prototype does not yet save user accounts or preferences. Persistent settings can be added after the core features are complete.",
      next: "Next step: plan settings and account preferences.",
      icon: Settings,
    },
  };

  const item = content[active] || content.immersive;
  const Icon = item.icon;

  return (
    <section className="module-workspace">
      <div className="eyebrow">GENEVISION / WORKSPACE</div>

      <div className="workspace-icon">
        <Icon size={30} />
      </div>

      <h1>{item.heading}</h1>

      <p className="workspace-subtitle">{item.subtitle}</p>

      <div className="workspace-card">
        <div className="workspace-card-title">
          <Sparkles size={18} />
          Module overview
        </div>

        <p>{item.body}</p>

        <div className="next-step">
          <span className="status-dot" />
          {item.next}
        </div>
      </div>

      <button
        className="primary-button"
        onClick={() => setActive("dashboard")}
      >
        <LayoutDashboard size={17} />
        Return to dashboard
      </button>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGene, setSelectedGene] = useState(null);

  const handleGeneLoaded = useCallback((geneData) => {
    setSelectedGene(geneData);
  }, []);

const activeTitle =
  active === "dashboard"
    ? "Overview"
    : active === "arvrlab"
      ? "Immersive Lab"
      : active === "hierarchy"
        ? "Biological Explorer"
        : modules.find((module) => module.id === active)?.title ||
          "Settings";

  const filteredModules = modules.filter((module) =>
    `${module.title} ${module.description} ${module.tag}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const navigate = (id) => {
    setActive(id);
    setSearch("");
  };

 
function renderActivePage() {
  switch (active) {
    case "dashboard":
      return <Dashboard setActive={navigate} />;

    case "explorer":
      return (
        <GeneExplorer3D onGeneLoaded={handleGeneLoaded} />
      );

    case "expression":
      return <GeneExpression />;

    case "mutation":
      return <MutationLab />;

    case "arvrlab":
      return <ProteinFolding3D />;

    case "hierarchy":
      return <BiologicalHierarchy />;

    case "tutor":
      return <GeneTutor geneContext={selectedGene} />;
    case "ai-analysis":
  return <GeneAIAnalysis />;

    case "insights":
    case "settings":
      return (
        <ModulePage
          active={active}
          setActive={navigate}
        />
      );
      

    default:
      return <Dashboard setActive={navigate} />;
  }
}

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={navigate}
        open={menuOpen}
        close={() => setMenuOpen(false)}
      />

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div className="breadcrumb">
              Workspace
              <ChevronRight size={14} />
              <strong>{activeTitle}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={16} />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search modules..."
                aria-label="Search modules"
              />

              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <button
              className="icon-button help-button"
              title="About GeneVision"
              onClick={() => navigate("tutor")}
              aria-label="Help"
            >
              <CircleHelp size={19} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {active === "dashboard" && search.trim() ? (
            <>
              <section className="section-heading search-results-heading">
                <div>
                  <div className="eyebrow">WORKSPACE SEARCH</div>
                  <h2>Search results</h2>
                  <p>
                    Modules matching &ldquo;{search.trim()}&rdquo;
                  </p>
                </div>
              </section>

              <section className="module-grid">
                {filteredModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onOpen={navigate}
                  />
                ))}
              </section>

              {filteredModules.length === 0 && (
                <div className="empty-state">
                  No modules found. Try &ldquo;DNA&rdquo;,
                  &ldquo;AI&rdquo; or &ldquo;mutation&rdquo;.
                </div>
              )}
            </>
          ) : (
            renderActivePage()
          )}
        </div>

        <footer className="app-footer">
          <span>
            <span className="status-dot" />
            GeneVision prototype
          </span>

          <span>Explore • Understand • Simulate</span>
        </footer>
      </main>
    </div>
  );
}