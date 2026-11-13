
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dna,
  FlaskConical,
  Info,
  RotateCcw,
  Zap,
} from "lucide-react";
import "./GeneExpression.css";
import GeneExpression3D from "./GeneExpression3D";

const API_URL = "http://localhost:8000/api/expression/sample";
const SAMPLE_DNA = "ATGGCTTTTCAAGGATAA";

const DEFAULT_LEVELS = [
  { condition: "Low", value: 20, color: "#5eead4" },
  { condition: "Medium", value: 55, color: "#818cf8" },
  { condition: "High", value: 90, color: "#f0abfc" },
];

const CODONS = {
  UUU: ["Phe", "Phenylalanine"], UUC: ["Phe", "Phenylalanine"],
  UUA: ["Leu", "Leucine"], UUG: ["Leu", "Leucine"],
  UCU: ["Ser", "Serine"], UCC: ["Ser", "Serine"],
  UCA: ["Ser", "Serine"], UCG: ["Ser", "Serine"],
  UAU: ["Tyr", "Tyrosine"], UAC: ["Tyr", "Tyrosine"],
  UAA: ["Stop", "Stop codon"], UAG: ["Stop", "Stop codon"],
  UGU: ["Cys", "Cysteine"], UGC: ["Cys", "Cysteine"],
  UGA: ["Stop", "Stop codon"], UGG: ["Trp", "Tryptophan"],
  CUU: ["Leu", "Leucine"], CUC: ["Leu", "Leucine"],
  CUA: ["Leu", "Leucine"], CUG: ["Leu", "Leucine"],
  CCU: ["Pro", "Proline"], CCC: ["Pro", "Proline"],
  CCA: ["Pro", "Proline"], CCG: ["Pro", "Proline"],
  CAU: ["His", "Histidine"], CAC: ["His", "Histidine"],
  CAA: ["Gln", "Glutamine"], CAG: ["Gln", "Glutamine"],
  CGU: ["Arg", "Arginine"], CGC: ["Arg", "Arginine"],
  CGA: ["Arg", "Arginine"], CGG: ["Arg", "Arginine"],
  AUU: ["Ile", "Isoleucine"], AUC: ["Ile", "Isoleucine"],
  AUA: ["Ile", "Isoleucine"], AUG: ["Met", "Methionine"],
  ACU: ["Thr", "Threonine"], ACC: ["Thr", "Threonine"],
  ACA: ["Thr", "Threonine"], ACG: ["Thr", "Threonine"],
  AAU: ["Asn", "Asparagine"], AAC: ["Asn", "Asparagine"],
  AAA: ["Lys", "Lysine"], AAG: ["Lys", "Lysine"],
  AGU: ["Ser", "Serine"], AGC: ["Ser", "Serine"],
  AGA: ["Arg", "Arginine"], AGG: ["Arg", "Arginine"],
  GUU: ["Val", "Valine"], GUC: ["Val", "Valine"],
  GUA: ["Val", "Valine"], GUG: ["Val", "Valine"],
  GCU: ["Ala", "Alanine"], GCC: ["Ala", "Alanine"],
  GCA: ["Ala", "Alanine"], GCG: ["Ala", "Alanine"],
  GAU: ["Asp", "Aspartic acid"], GAC: ["Asp", "Aspartic acid"],
  GAA: ["Glu", "Glutamic acid"], GAG: ["Glu", "Glutamic acid"],
  GGU: ["Gly", "Glycine"], GGC: ["Gly", "Glycine"],
  GGA: ["Gly", "Glycine"], GGG: ["Gly", "Glycine"],
};

const STEPS = [
  { title: "DNA Sequence", short: "DNA", color: "mint" },
  { title: "Transcription", short: "mRNA", color: "blue" },
  { title: "Translation", short: "Protein", color: "violet" },
];

function getCodons(sequence) {
  const rna = sequence.replace(/T/g, "U");
  const result = [];

  for (let i = 0; i + 2 < rna.length; i += 3) {
    const codon = rna.slice(i, i + 3);
    const info = CODONS[codon] || ["???", "Incomplete codon"];
    result.push({
      codon,
      amino: info[0],
      fullName: info[1],
      index: result.length + 1,
      start: i + 1,
      isStop: info[0] === "Stop",
    });
    if (info[0] === "Stop") break;
  }

  return result;
}

function normalizeExpressionData(json) {
  // Accept common FastAPI response formats while retaining demo fallbacks.
  const candidates = [
    json,
    json?.data,
    json?.expression_data,
    json?.levels,
    json?.conditions,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const normalized = DEFAULT_LEVELS.map((fallback) => {
        const match = candidate.find((item) => {
          const name = String(
            item.condition ?? item.level ?? item.name ?? ""
          ).toLowerCase();
          return name === fallback.condition.toLowerCase();
        });
        const value = Number(
          match?.value ?? match?.expression ?? match?.expression_level
        );
        return {
          ...fallback,
          value: Number.isFinite(value) ? value : fallback.value,
        };
      });
      return normalized;
    }
  }

  return DEFAULT_LEVELS;
}

export default function GeneExpression() {
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [condition, setCondition] = useState("Medium");
  const [dna, setDna] = useState(SAMPLE_DNA);
  const [step, setStep] = useState(0);
  const [selectedCodon, setSelectedCodon] = useState(0);
  const [apiStatus, setApiStatus] = useState("loading");
  const [error, setError] = useState("");
  const [sequenceNotice, setSequenceNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExpression() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Expression API request failed");
        const json = await response.json();

        if (active) {
          setLevels(normalizeExpressionData(json));
          setApiStatus("connected");
        }
      } catch {
        if (active) {
          setLevels(DEFAULT_LEVELS);
          setApiStatus("offline");
        }
      }
    }

    loadExpression();
    return () => {
      active = false;
    };
  }, []);

  const selectedLevel =
    levels.find((item) => item.condition === condition) ?? levels[1];

  const cleanDNA = dna.toUpperCase().replace(/\s/g, "");
  const validCharacters = /^[ATGC]+$/.test(cleanDNA);
  const sequenceValid =
    cleanDNA.length >= 3 && validCharacters && cleanDNA.length % 3 === 0;

  const codons = useMemo(
    () => (validCharacters ? getCodons(cleanDNA) : []),
    [cleanDNA, validCharacters]
  );

  const rna = validCharacters ? cleanDNA.replace(/T/g, "U") : "";
  const currentCodon = codons[selectedCodon] ?? codons[0];
  const protein = codons.filter((item) => !item.isStop);

  function updateDNA(value) {
    setDna(value.toUpperCase());
    setSelectedCodon(0);
    setSequenceNotice("");
    const cleaned = value.toUpperCase().replace(/\s/g, "");

    if (cleaned && !/^[ATGC]+$/.test(cleaned)) {
      setError("Use only A, T, G and C in the coding DNA sequence.");
    } else if (cleaned.length > 0 && cleaned.length < 3) {
      setError("Enter at least one complete codon (3 nucleotides).");
    } else if (cleaned.length > 0 && cleaned.length % 3 !== 0) {
      setError("The sequence has extra nucleotides that do not form a complete codon.");
    } else {
      setError("");
    }
  }

  function resetSequence() {
    setDna(SAMPLE_DNA);
    setStep(0);
    setSelectedCodon(0);
    setError("");
    setSequenceNotice("Sample sequence restored.");
  }

  function copyNextStep() {
    setStep((current) => Math.min(2, current + 1));
  }

  function copyPreviousStep() {
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <main className="ge-dashboard">
      <header className="ge-header">
        <div className="ge-brand">
          <div className="ge-brand-icon"><Dna size={25} /></div>
          <div>
            <p className="ge-eyebrow">GENEVISION </p>
            <h1>Gene Expression Lab</h1>
            <p className="ge-subtitle">
              Explore transcription, translation and simulated gene activity.
            </p>
          </div>
        </div>
        <span className={`ge-status ${apiStatus}`}>
          <span className="ge-status-dot" />
          {apiStatus === "connected"
            ? "FASTAPI CONNECTED"
            : apiStatus === "loading"
              ? "CONNECTING..."
              : "DEMO DATA"}
        </span>
      </header>

      <section className="ge-metric-grid">
        <article className="ge-metric-card">
          <div className="ge-metric-top">
            <span>ACTIVE GENE</span><Dna size={18} />
          </div>
          <h2>GENE-DEMO</h2>
          <p>Illustrative coding sequence</p>
        </article>
        <article className="ge-metric-card">
          <div className="ge-metric-top">
            <span>EXPRESSION LEVEL</span><Activity size={18} />
          </div>
          <h2>{selectedLevel.value}<small> units</small></h2>
          <p>{condition} simulated condition</p>
        </article>
        <article className="ge-metric-card">
          <div className="ge-metric-top">
            <span>SEQUENCE LENGTH</span><FlaskConical size={18} />
          </div>
          <h2>{cleanDNA.length}<small> nt</small></h2>
          <p>{codons.length} translated codon groups</p>
        </article>
      </section>

      <GeneExpression3D
  dna={cleanDNA}
  rna={rna}
  protein={protein}
  step={step}
/>

      {/* <section className="ge-panel">
        <div className="ge-section-heading">
          <div>
            <p className="ge-eyebrow">SIMULATION / 01</p>
            <h2>Expression activity</h2>
            <p>Choose a condition to compare illustrative expression values.</p>
          </div>
          <span className="ge-chip"><Zap size={14} /> Simulated data</span>
        </div>

        <div className="ge-condition-grid">
          {levels.map((item) => (
            <button
              key={item.condition}
              type="button"
              className={`ge-condition-card ${
                condition === item.condition ? "selected" : ""
              }`}
              onClick={() => setCondition(item.condition)}
              style={{ "--level-color": item.color }}
              aria-pressed={condition === item.condition}
            >
              <span className="ge-condition-name">{item.condition}</span>
              <strong>{item.value}</strong>
              <span className="ge-units">relative units</span>
              <span className="ge-progress-track">
                <span
                  className="ge-progress-fill"
                  style={{ width: `${Math.min(100, item.value)}%` }}
                />
              </span>
              {condition === item.condition && (
                <span className="ge-selected-label">
                  <CheckCircle2 size={13} /> Selected
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="ge-activity-chart">
          <div className="ge-chart-title">
            <div>
              <h3>Condition comparison</h3>
              <p>Relative expression units · demo values</p>
            </div>
            <span className="ge-chart-value">{selectedLevel.value} <small>units</small></span>
          </div>
          <div className="ge-bar-chart">
            {levels.map((item) => (
              <button
                key={item.condition}
                type="button"
                className={`ge-bar-row ${
                  condition === item.condition ? "active" : ""
                }`}
                onClick={() => setCondition(item.condition)}
                aria-label={`Select ${item.condition} expression, ${item.value} units`}
              >
                <span className="ge-bar-label">{item.condition}</span>
                <span className="ge-bar-track">
                  <span
                    className="ge-bar"
                    style={{
                      width: `${Math.min(100, item.value)}%`,
                      background: item.color,
                    }}
                  />
                </span>
                <strong>{item.value}</strong>
              </button>
            ))}
          </div>
          <p className="ge-chart-footnote">
            Selecting a condition updates the highlighted value. These numbers
            are illustrative, not measured gene-expression results.
          </p>
        </div>
      </section> */}

      <section className="ge-panel ge-sequence-panel">
        <div className="ge-section-heading">
          <div>
            <p className="ge-eyebrow">SIMULATION </p>
            <h2>DNA → RNA → Protein</h2>
            <p>Edit the sequence, select codons and move through each stage.</p>
          </div>
          <button className="ge-reset-button" type="button" onClick={resetSequence}>
            <RotateCcw size={15} /> Reset sample
          </button>
        </div>

        <label className="ge-field-label" htmlFor="ge-dna-input">
          Coding DNA strand <span>5′ → 3′</span>
        </label>
        <textarea
          id="ge-dna-input"
          className="ge-dna-input"
          value={dna}
          onChange={(event) => updateDNA(event.target.value)}
          spellCheck="false"
          rows={2}
          placeholder="Enter a sequence using A, T, G and C..."
        />
        <div className="ge-sequence-meta">
          <span>{cleanDNA.length} nucleotides</span>
          <span>{Math.floor(cleanDNA.length / 3)} complete codons</span>
          {sequenceValid && <span className="ge-valid"><CheckCircle2 size={13} /> Valid frame</span>}
        </div>
        {error && <p className="ge-error" role="alert">{error}</p>}
        {sequenceNotice && <p className="ge-success">{sequenceNotice}</p>}

        <div className="ge-stepper" aria-label="Gene expression steps">
          {STEPS.map((item, index) => (
            <button
              type="button"
              key={item.short}
              className={`ge-step ${step === index ? "active" : ""} ${
                step > index ? "completed" : ""
              }`}
              onClick={() => setStep(index)}
              aria-current={step === index ? "step" : undefined}
            >
              <span className="ge-step-number">
                {step > index ? <CheckCircle2 size={16} /> : `0${index + 1}`}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{index === 0 ? "Input sequence" : index === 1 ? "Convert T to U" : "Read codons"}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="ge-stage-content">
          <div className="ge-stage-heading">
            <div>
              <span className="ge-stage-kicker">STEP 0{step + 1} / 03</span>
              <h3>{STEPS[step].title}</h3>
            </div>
            <span className={`ge-stage-icon ${STEPS[step].color}`}>
              {step === 0 ? <Dna /> : step === 1 ? <Activity /> : <FlaskConical />}
            </span>
          </div>

          {step === 0 && (
            <>
              <p className="ge-explanation">
                DNA stores sequence information. Edit the sequence above to
                explore how changes affect the simplified translation output.
              </p>
              <div className="ge-base-strip">
                {cleanDNA.split("").map((base, index) => (
                  <span
                    key={`${index}-${base}`}
                    className={`ge-base base-${base}`}
                    title={`Nucleotide ${index + 1}: ${base}`}
                  >
                    {base}
                  </span>
                ))}
                {cleanDNA.length === 0 && <span className="ge-empty">Enter a DNA sequence above.</span>}
              </div>
              <div className="ge-legend">
                <span><i className="base-A" /> A · Adenine</span>
                <span><i className="base-T" /> T · Thymine</span>
                <span><i className="base-G" /> G · Guanine</span>
                <span><i className="base-C" /> C · Cytosine</span>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="ge-explanation">
                In this simplified coding-strand example, the displayed mRNA
                sequence is produced by replacing DNA T with RNA U.
              </p>
              <div className="ge-molecule-label">mRNA · 5′ → 3′</div>
              <div className="ge-base-strip ge-rna-strip">
                {rna.split("").map((base, index) => (
                  <span key={`${index}-${base}`} className={`ge-base base-${base}`}>
                    {base}
                  </span>
                ))}
              </div>
              <div className="ge-rule-card">
                <Info size={17} />
                <span>For a coding DNA strand, the mRNA sequence matches it except that U appears in place of T.</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="ge-explanation">
                Each complete mRNA codon maps to an amino acid or a stop signal.
                Select a codon below to inspect its translation.
              </p>
              <div className="ge-codon-grid">
                {codons.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.codon}-${index}`}
                    className={`ge-codon-card ${
                      selectedCodon === index ? "selected" : ""
                    } ${item.isStop ? "stop" : ""}`}
                    onClick={() => setSelectedCodon(index)}
                    aria-pressed={selectedCodon === index}
                  >
                    <span className="ge-codon-index">CODON {String(index + 1).padStart(2, "0")}</span>
                    <strong>{item.codon}</strong>
                    <span>{item.amino}</span>
                  </button>
                ))}
                {codons.length === 0 && <p className="ge-empty">Enter a valid sequence to generate codons.</p>}
              </div>

              {currentCodon && (
                <div className="ge-codon-detail">
                  <div className="ge-codon-detail-symbol">
                    {currentCodon.isStop ? "STOP" : currentCodon.amino}
                  </div>
                  <div>
                    <span>SELECTED CODON · {currentCodon.codon}</span>
                    <h4>{currentCodon.fullName}</h4>
                    <p>
                      {currentCodon.isStop
                        ? "This codon signals termination in the standard genetic code."
                        : `Codon ${currentCodon.index} begins at nucleotide ${currentCodon.start} in the displayed mRNA.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="ge-protein-summary">
                <span>SIMPLIFIED AMINO-ACID CHAIN</span>
                <div className="ge-protein-chain">
                  {protein.map((item, index) => (
                    <span key={`${item.codon}-${index}`} title={item.fullName}>
                      {item.amino}
                    </span>
                  ))}
                  {protein.length === 0 && <span>—</span>}
                  {codons.some((item) => item.isStop) && <span className="ge-stop-pill">STOP</span>}
                </div>
                <p>{protein.length} amino acid(s) before any stop codon shown.</p>
              </div>
            </>
          )}
        </div>

        <div className="ge-stage-controls">
          <button
            type="button"
            className="ge-secondary-button"
            onClick={copyPreviousStep}
            disabled={step === 0}
          >
            <ArrowLeft size={16} /> Previous
          </button>
          <span>Step {step + 1} of 3</span>
          <button
            type="button"
            className="ge-primary-button"
            onClick={copyNextStep}
            disabled={step === 2 || !sequenceValid}
          >
            Next step <ArrowRight size={16} />
          </button>
        </div>
        {!sequenceValid && (
          <p className="ge-inline-hint">
            Enter complete codons using A, T, G and C to enable step navigation.
          </p>
        )}
      </section>

      {/* <footer className="ge-disclaimer">
        <Info size={18} />
        <div>
          <strong>Educational simulation only</strong>
          <p>
            Expression values are illustrative. Sequence translation uses a
            simplified coding-strand example and the standard genetic code.
            Real gene expression and protein production depend on many
            biological factors. This tool is not for clinical analysis,
            diagnosis or prediction of health effects.
          </p>
        </div>
      </footer> */}
    </main>
  );
}
