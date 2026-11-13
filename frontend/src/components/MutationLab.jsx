
import { useEffect, useState } from "react";
import { Dna, FlaskConical, RotateCcw, ArrowRight, AlertCircle } from "lucide-react";
import { getSampleGene, simulateMutation } from "../api/geneApi";
import "./MutationLab.css";

const BASES = ["A", "T", "G", "C"];

const BASE_COLORS = {
  A: "#58e6a9",
  T: "#ffb86b",
  G: "#65c7ff",
  C: "#bd91ff",
};

export default function MutationLab() {
  const [originalSequence, setOriginalSequence] = useState("");
  const [position, setPosition] = useState(1);
  const [newBase, setNewBase] = useState("A");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSampleGene()
      .then((gene) => {
        setOriginalSequence(
          (gene.sequence || "").toUpperCase().replace(/\s/g, "")
        );
      })
      .catch(() => {
        setError("Could not load DNA sequence. Check your backend.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleMutation() {
    setError("");
    setResult(null);

    if (!originalSequence) {
      setError("No DNA sequence is available.");
      return;
    }

    if (position < 1 || position > originalSequence.length) {
      setError(`Choose a position from 1 to ${originalSequence.length}.`);
      return;
    }

    if (originalSequence[position - 1] === newBase) {
      setError("Choose a base different from the original nucleotide.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await simulateMutation(
        originalSequence,
        position,
        newBase
      );

      if (!data.success) {
        setError(data.message || "Mutation could not be simulated.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Could not contact the mutation API.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetLab() {
    setPosition(1);
    setNewBase("A");
    setResult(null);
    setError("");
  }

  function renderSequence(sequence, changedPosition = null) {
    return sequence.split("").map((base, index) => {
      const changed = index + 1 === changedPosition;

      return (
        <span
          key={`${index}-${base}`}
          className={`mutation-base ${changed ? "changed-base" : ""}`}
          style={{ "--base-color": BASE_COLORS[base] || "#ffffff" }}
          title={`Position ${index + 1}: ${base}`}
        >
          {base}
        </span>
      );
    });
  }

  if (loading) {
    return <section className="mutation-lab">Loading DNA sequence...</section>;
  }

  return (
    <section className="mutation-lab">
      <header className="mutation-heading">
        <div className="mutation-title-icon">
          <FlaskConical size={23} />
        </div>

        <div>
          <span className="mutation-eyebrow">GENEVISION / MODULE 04</span>
          <h2>Mutation Lab</h2>
          <p>Simulate a single nucleotide substitution.</p>
        </div>
      </header>

      <div className="mutation-info">
        <Dna size={19} />
        <div>
          <strong>Educational DNA sequence</strong>
          <p>{originalSequence.length} nucleotides loaded from FastAPI</p>
        </div>
      </div>

      <div className="mutation-controls">
        <label>
          Nucleotide position
          <input
            type="number"
            min="1"
            max={originalSequence.length}
            value={position}
            onChange={(event) => {
              setPosition(Number(event.target.value));
              setResult(null);
              setError("");
            }}
          />
          <small>Valid range: 1–{originalSequence.length}</small>
        </label>

        <label>
          Replace with
          <select
            value={newBase}
            onChange={(event) => {
              setNewBase(event.target.value);
              setResult(null);
              setError("");
            }}
          >
            {BASES.map((base) => (
              <option key={base} value={base}>
                {base}
              </option>
            ))}
          </select>
          <small>
            Current base: {originalSequence[position - 1] || "—"}
          </small>
        </label>
      </div>

      <div className="mutation-preview">
        <span className="mutation-label">ORIGINAL SEQUENCE</span>
        <div className="mutation-sequence">
          {renderSequence(originalSequence)}
        </div>
      </div>

      <div className="mutation-actions">
        <button
          className="run-mutation"
          onClick={handleMutation}
          disabled={submitting || !originalSequence}
        >
          <FlaskConical size={16} />
          {submitting ? "Simulating..." : "Simulate Mutation"}
          <ArrowRight size={16} />
        </button>

        <button className="reset-mutation" onClick={resetLab}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      {error && (
        <div className="mutation-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {result && (
        <div className="mutation-results">
          <div className="mutation-result-heading">
            <div>
              <span className="mutation-eyebrow">SIMULATION RESULT</span>
              <h3>Substitution completed</h3>
            </div>
            <span className="mutation-type">{result.mutation_type}</span>
          </div>

          <div className="mutation-change">
            <div>
              <span>POSITION</span>
              <strong>{result.position}</strong>
            </div>
            <div>
              <span>ORIGINAL</span>
              <strong style={{ color: BASE_COLORS[result.original_base] }}>
                {result.original_base}
              </strong>
            </div>
            <ArrowRight size={19} />
            <div>
              <span>REPLACEMENT</span>
              <strong style={{ color: BASE_COLORS[result.new_base] }}>
                {result.new_base}
              </strong>
            </div>
          </div>

          <div className="mutation-preview">
            <span className="mutation-label">MUTATED SEQUENCE</span>
            <div className="mutation-sequence">
              {renderSequence(result.mutated_sequence, result.position)}
            </div>
          </div>

          <p className="mutation-message">{result.message}</p>
         {/* <p className="mutation-disclaimer">{result.disclaimer}</p> */}
        </div>
      )}

      <div className="mutation-legend">
        {BASES.map((base) => (
          <span key={base}>
            <i style={{ background: BASE_COLORS[base] }} />
            {base}
          </span>
        ))}
      </div>
    </section>
  );
}
