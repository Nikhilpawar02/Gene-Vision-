
import { useState } from "react";
import { Dna, ArrowDown, RotateCcw, Activity } from "lucide-react";
import "./GeneExpressionSimulator.css";

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

const SAMPLE_SEQUENCE = "ATGGCTTTTCAAGGATAA";

function splitCodons(sequence) {
  const result = [];
  for (let i = 0; i + 2 < sequence.length; i += 3) {
    result.push(sequence.slice(i, i + 3));
  }
  return result;
}

export default function GeneExpressionSimulator() {
  const [inputSequence, setInputSequence] = useState(SAMPLE_SEQUENCE);
  const [submittedSequence, setSubmittedSequence] =
    useState(SAMPLE_SEQUENCE);
  const [error, setError] = useState("");

  const dna = submittedSequence;
  const mrna = dna.replaceAll("T", "U");
  const dnaCodons = splitCodons(dna);
  const mrnaCodons = splitCodons(mrna);

  const aminoAcids = dnaCodons.map((codon) => CODON_TABLE[codon]);
  const stopIndex = aminoAcids.indexOf("Stop");
  const protein = stopIndex === -1
    ? aminoAcids
    : aminoAcids.slice(0, stopIndex + 1);

  function simulate() {
    const cleaned = inputSequence
      .toUpperCase()
      .replace(/\s+/g, "");

    if (!cleaned) {
      setError("Enter a DNA sequence first.");
      return;
    }

    if (!/^[ATGC]+$/.test(cleaned)) {
      setError("Only DNA bases A, T, G, and C are allowed.");
      return;
    }

    setError("");
    setSubmittedSequence(cleaned);
  }

  function reset() {
    setInputSequence(SAMPLE_SEQUENCE);
    setSubmittedSequence(SAMPLE_SEQUENCE);
    setError("");
  }

  return (
    <section className="expression-page">
      <header className="expression-header">
        <div className="expression-heading-icon">
          <Dna size={28} />
        </div>
        <div>
          <span className="expression-eyebrow">
            GENEVISION 
          </span>
          <h2>Gene Expression Simulator</h2>
          <p>Explore transcription and translation using sample DNA.</p>
        </div>
      </header>

      <div className="expression-notice">
        <Activity size={18} />
        Educational simulation · Not clinical or diagnostic data
      </div>

      <section className="expression-card">
        <div className="expression-card-heading">
          <div>
            <span className="expression-step">STEP 01</span>
            <h3>DNA coding sequence</h3>
          </div>
          <button
            className="expression-reset"
            type="button"
            onClick={reset}
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>

        <label htmlFor="expression-dna-input">
          Enter DNA bases (A, T, G, C)
        </label>
        <textarea
          id="expression-dna-input"
          value={inputSequence}
          onChange={(event) => setInputSequence(event.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="Example: ATGGCTTTTCAAGGATAA"
        />

        {error && (
          <p className="expression-error" role="alert">{error}</p>
        )}

        <button
          className="expression-primary-button"
          type="button"
          onClick={simulate}
        >
          Simulate gene expression <ArrowDown size={17} />
        </button>
      </section>

      <div className="expression-flow-arrow">
        <ArrowDown size={22} />
        <span>TRANSCRIPTION</span>
      </div>

      <section className="expression-card">
        <span className="expression-step">STEP 02</span>
        <h3>mRNA transcript</h3>
        <p className="expression-description">
          In this simplified model, the DNA coding strand is transcribed
          by replacing T with U.
        </p>
        <div className="expression-codon-list">
          {mrnaCodons.map((codon, index) => (
            <span className="expression-codon mrna-codon" key={index}>
              {codon}
            </span>
          ))}
          {mrna.length % 3 !== 0 && (
            <span className="expression-remainder">
              {mrna.slice(mrna.length - (mrna.length % 3))}
            </span>
          )}
        </div>
        <p className="expression-description">
          mRNA sequence: <strong>{mrna}</strong>
        </p>
      </section>

      <div className="expression-flow-arrow">
        <ArrowDown size={22} />
        <span>TRANSLATION</span>
      </div>

      <section className="expression-card">
        <span className="expression-step">STEP 03</span>
        <h3>Protein translation</h3>
        <p className="expression-description">
          Codons are interpreted using the standard genetic code.
          Translation is shown from the first base of the entered sequence.
        </p>

        <div className="expression-codon-list">
          {dnaCodons.map((codon, index) => {
            const aminoAcid = CODON_TABLE[codon];
            const isStop = aminoAcid === "Stop";

            return (
              <div
                className={`expression-amino-card ${
                  isStop ? "expression-stop" : ""
                }`}
                key={index}
              >
                <span className="expression-codon-label">
                  {mrnaCodons[index]}
                </span>
                <strong>{aminoAcid}</strong>
                <small>
                  {isStop ? "Stop signal" : `Residue ${index + 1}`}
                </small>
              </div>
            );
          })}
        </div>

        <div className="expression-protein-result">
          <span>Simulated translation output</span>
          <strong>
            {protein.length
              ? protein.join(" – ")
              : "No complete codons available"}
          </strong>
          {stopIndex === -1 && (
            <small>
              No stop codon found in the complete codons shown.
            </small>
          )}
        </div>
      </section>

      {/* <footer className="expression-footer">
        This simplified educational model starts reading at the first
        entered base. It does not identify reading frames, splice RNA,
        or validate a real gene. In cells, transcription uses a DNA
        template strand, and translation uses mRNA at a ribosome.
      </footer> */}
    </section>
  );
}
