import { useState } from "react";
import "./GeneTutor.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GeneTutorActivities from "./GeneTutorActivities";

const API_URL = "http://localhost:8000/api/tutor/ask";

const suggestions = [
  "What is DNA?",
  "Explain gene mutations with an example.",
  "What is gene expression?",
];

function cleanTutorMarkdown(text) {
  return text.replace(/\\([*_#|`~])/g, "$1");
}

export default function GeneTutor({ geneContext }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendQuestion(event, suggestedQuestion) {
    event?.preventDefault();

    const text = (suggestedQuestion ?? question).trim();

    if (!text || loading) return;

    const history = messages.map((message) => ({
      role: message.role,
      text: message.text,
    }));

    setMessages((previous) => [
      ...previous,
      { role: "user", text },
    ]);

    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  question: text,
  history,
  gene_context: geneContext
    ? {
        name: geneContext.name,
        sequence: geneContext.sequence,
        source: geneContext.source,
        disclaimer: geneContext.disclaimer,
      }
    : null,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Request failed with status ${response.status}`
        );
      }

      if (!data.success || !data.answer) {
        throw new Error("The tutor returned an empty response.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "model", text: data.answer },
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Unable to contact the AI Gene Tutor. Check the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    if (loading) return;
    setMessages([]);
    setError("");
    setQuestion("");
  }

  return (
    <section className="gene-tutor" id="gene-tutor">
      <div className="tutor-header">
        <div>
          <span className="tutor-eyebrow">GENEVISION AI</span>
          <h2>AI Gene Tutor</h2>
          <p>
            Explore DNA, genetics, mutations and gene expression
            through interactive questions.
          </p>
        </div>

        <button
          className="tutor-clear"
          type="button"
          onClick={clearChat}
          disabled={loading || messages.length === 0}
        >
          Clear chat
        </button>
      </div>

      <div className="tutor-suggestions">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={(event) => sendQuestion(event, item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="tutor-messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="tutor-welcome">
            <div className="tutor-icon">🧬</div>
            <h3>Ask your first genetics question</h3>
            <p>
              Try a suggested question above, or type your own below.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            className={`tutor-message ${
              message.role === "user" ? "user-message" : "ai-message"
            }`}
            key={`${index}-${message.role}`}
          >
            <span className="message-label">
              {message.role === "user" ? "You" : "GeneVision Tutor"}
            </span>
            <div className="tutor-markdown">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {cleanTutorMarkdown(message.text)}
  </ReactMarkdown>
</div>
            {message.role === "model" &&
  /dna|gene|protein|gene expression|mutation/i.test(
    messages[index - 1]?.text || ""
  ) && (
    <GeneTutorActivities
      topic={messages[index - 1]?.text || ""}
    />
  )}

          </div>
        ))}

        {loading && (
          <div className="tutor-message ai-message">
            <span className="message-label">GeneVision Tutor</span>
            <p>Thinking about your question...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="tutor-error" role="alert">
          <strong>Could not get an answer.</strong>
          <p>{error}</p>
        </div>
      )}

      <form
        className="tutor-input-area"
        onSubmit={(event) => sendQuestion(event)}
      >
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about DNA, genes, mutations..."
          aria-label="Ask a genetics question"
          maxLength={2000}
          rows={2}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? "Thinking..." : "Ask Tutor"}
        </button>
      </form>

      {/* <p className="tutor-disclaimer">
        Educational information only. AI-generated answers can contain
        errors and are not a substitute for professional medical advice.
      </p> */}
    </section>
  );
}