
import { useEffect, useState } from "react";
import { getSampleGene } from "../api/geneApi";
import { Dna, RefreshCw, Server, AlertCircle } from "lucide-react";

export default function GeneDataPanel() {
  const [gene, setGene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadGene() {
    setLoading(true);
    setError("");

    try {
      const data = await getSampleGene();
      setGene(data);
    } catch (err) {
      setError(
        "Could not connect to GeneVision API. Check that the FastAPI server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGene();
  }, []);

  return (
    <section className="gene-data-panel">
      <div className="gene-panel-heading">
        <div className="module-icon cyan">
          <Dna size={22} />
        </div>

        <div>
          <h2>Gene Data Explorer</h2>
          <p>Live data fetched from the GeneVision backend</p>
        </div>

        <span className={`api-status ${error ? "api-error" : gene ? "api-connected" : ""}`}>
          <span className="status-dot" />
          {loading ? "CONNECTING" : error ? "OFFLINE" : "CONNECTED"}
        </span>
      </div>

      {loading && (
        <div className="api-message">
          <RefreshCw size={19} className="spin-icon" />
          Loading sample gene data...
        </div>
      )}

      {error && (
        <div className="api-message error-message">
          <AlertCircle size={20} />
          <div>
            <strong>Connection failed</strong>
            <p>{error}</p>
            <button className="api-retry" onClick={loadGene}>
              Retry connection
            </button>
          </div>
        </div>
      )}

      {gene && !loading && !error && (
        <div className="gene-result">
          <div className="gene-result-label">GENE RECORD</div>
          <h3>{gene.name}</h3>

          <div className="gene-metadata">
            <div>
              <span>Sequence type</span>
              <strong>{gene.sequence_type}</strong>
            </div>
            <div>
              <span>Data source</span>
              <strong>{gene.source}</strong>
            </div>
          </div>

          <div className="api-sequence">
            {gene.sequence.match(/.{1,3}/g)?.map((codon, index) => (
              <span key={`${codon}-${index}`}>{codon}</span>
            ))}
          </div>

          <p className="gene-disclaimer">{gene.disclaimer}</p>

          <button className="api-retry" onClick={loadGene}>
            <RefreshCw size={14} /> Refresh from API
          </button>
        </div>
      )}

      <div className="api-panel-footer">
        <Server size={14} />
        <span>FastAPI · localhost:8000</span>
      </div>
    </section>
  );
}
