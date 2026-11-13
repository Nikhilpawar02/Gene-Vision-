
import { useMemo, useState } from "react";
import {
  BrainCircuit,
  Dna,
  Activity,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SAMPLE_SEQUENCE = "ACGT".repeat(15);

const CLASS_INFO = {
  EI: {
    title: "Exon to Intron",
    description: "The model classified this sequence as an EI splice-junction example.",
  },
  IE: {
    title: "Intron to Exon",
    description: "The model classified this sequence as an IE splice-junction example.",
  },
  N: {
    title: "Neither",
    description: "The model classified this sequence as neither an EI nor an IE splice junction.",
  },
};

export default function GeneAIAnalysis() {
  const [sequence, setSequence] = useState(SAMPLE_SEQUENCE);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanSequence = sequence.replace(/\s/g, "").toUpperCase();

  const validSequence =
    cleanSequence.length === 60 &&
    /^[ACGT]+$/.test(cleanSequence);

  const baseCounts = useMemo(() => {
    return {
      A: (cleanSequence.match(/A/g) || []).length,
      C: (cleanSequence.match(/C/g) || []).length,
      G: (cleanSequence.match(/G/g) || []).length,
      T: (cleanSequence.match(/T/g) || []).length,
    };
  }, [cleanSequence]);

  const handlePredict = async () => {
    if (!validSequence) {
      setError("Enter exactly 60 valid DNA bases using only A, C, G and T.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/ml/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequence: cleanSequence,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Prediction request failed (${response.status})`
        );
      }

      if (!data.success) {
        throw new Error("The prediction API did not return a successful result.");
      }

      setResult(data);

      setHistory((previous) => [
        {
          id: `${Date.now()}-${previous.length}`,
          predictedClass: data.predicted_class,
          confidence: data.confidence,
          sequence: cleanSequence,
        },
        ...previous,
      ].slice(0, 5));
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the GeneVision prediction API."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSequence(SAMPLE_SEQUENCE);
    setResult(null);
    setError("");
  };

  const classInfo = result
    ? CLASS_INFO[result.predicted_class]
    : null;

  return (
    <div className="ai-analysis">
      <section className="ai-hero">
        <div className="ai-hero-icon">
          <BrainCircuit size={27} />
        </div>

        <div>
          <div className="eyebrow">
            <span className="status-dot" />
            GENEVISION / MACHINE LEARNING
          </div>

          <h1>AI Gene Analysis</h1>

          <p>
            Analyze DNA sequences using your trained 1D CNN
            classification model.
          </p>
        </div>

        <div className="ai-model-badge">
          <Sparkles size={14} />
          1D CNN MODEL
        </div>
      </section>

      <section className="ai-input-panel">
        <div className="ai-section-heading">
          <div className="module-icon cyan">
            <Dna size={20} />
          </div>

          <div>
            <h2>DNA sequence input</h2>
            <p>Enter a sequence containing exactly 60 nucleotides.</p>
          </div>
        </div>

        <textarea
          className="ai-sequence-input"
          value={sequence}
          onChange={(event) => {
            setSequence(event.target.value.toUpperCase());
            setError("");
            setResult(null);
          }}
          placeholder="Enter DNA sequence using A, C, G and T..."
          spellCheck="false"
          aria-label="DNA sequence"
        />

        <div className="ai-input-meta">
          <span>
            Sequence length: <strong>{cleanSequence.length} / 60</strong>
          </span>

          <span className={validSequence ? "ai-valid" : "ai-invalid"}>
            {validSequence ? "Valid DNA sequence" : "Requires 60 valid bases"}
          </span>
        </div>

        <div className="ai-base-counts">
          {Object.entries(baseCounts).map(([base, count]) => (
            <div className={`ai-base ai-base-${base}`} key={base}>
              <strong>{base}</strong>
              <span>{count}</span>
            </div>
          ))}
        </div>

        <div className="ai-actions">
          <button
            className="primary-button"
            onClick={handlePredict}
            disabled={!validSequence || loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="spin-icon" size={17} />
                Analyzing sequence...
              </>
            ) : (
              <>
                <BrainCircuit size={17} />
                Run CNN Prediction
              </>
            )}
          </button>

          <button
            className="ai-reset-button"
            onClick={resetAnalysis}
            disabled={loading}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        {error && (
          <div className="ai-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result && (
        <section className="ai-results">
          <div className="ai-section-heading">
            <div className="module-icon purple">
              <Activity size={20} />
            </div>

            <div>
              <h2>Classification results</h2>
              <p>Prediction returned by your trained CNN model.</p>
            </div>

            <span className="ai-success-label">
              <CheckCircle2 size={14} />
              SUCCESS
            </span>
          </div>

          <div className="ai-prediction-card">
            <div>
              <div className="ai-result-label">PREDICTED CLASS</div>
              <h2>{result.predicted_class}</h2>
              <h3>{classInfo?.title || "Classification result"}</h3>
              <p>
                {classInfo?.description || result.interpretation}
              </p>
            </div>

            <div className="ai-confidence">
              <strong>{Number(result.confidence).toFixed(2)}%</strong>
              <span>Model confidence</span>
            </div>
          </div>

          <div className="ai-probability-panel">
            <h3>Class probability distribution</h3>

            {Object.entries(result.probabilities || {}).map(
              ([label, probability]) => (
                <div className="ai-probability-row" key={label}>
                  <div className="ai-probability-label">
                    <strong>{label}</strong>
                    <span>{Number(probability).toFixed(2)}%</span>
                  </div>

                  <div className="ai-progress-track">
                    <div
                      className={`ai-progress-fill ${
                        label === result.predicted_class
                          ? "ai-progress-selected"
                          : ""
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(probability))
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div className="ai-result-details">
            <div>
              <span>Model</span>
              <strong>{result.model}</strong>
            </div>

            <div>
              <span>Sequence length</span>
              <strong>{result.sequence_length} bases</strong>
            </div>

            <div>
              <span>Interpretation</span>
              <strong>{result.interpretation}</strong>
            </div>
          </div>

          <p className="ai-disclaimer">
            {result.disclaimer ||
              "Educational sequence classification only. Not a clinical or diagnostic prediction."}
          </p>
        </section>
      )}

      <section className="ai-history-panel">
        <div className="ai-section-heading">
          <div className="module-icon orange">
            <Activity size={19} />
          </div>

          <div>
            <h2>Recent predictions</h2>
            <p>Latest results from this browser session.</p>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="ai-empty-history">
            No predictions yet. Run your first CNN analysis above.
          </p>
        ) : (
          <div className="ai-history-list">
            {history.map((item) => (
              <div className="ai-history-item" key={item.id}>
                <div>
                  <strong>{item.predictedClass}</strong>
                  <span>{item.sequence.slice(0, 18)}...</span>
                </div>

                <span>{Number(item.confidence).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="ai-educational-note">
        <AlertCircle size={16} />
        <p>
          <strong>Educational prototype:</strong> This CNN demonstrates
          DNA sequence classification using a training dataset. Its
          output is not a validated biological, medical or diagnostic
          result.
        </p>
      </div>
    </div>
  );
}
