import { useState } from "react";
import "./GeneTutorActivities.css";

const concepts = {
  DNA: {
    title: "DNA",
    subtitle: "The information molecule",
    description:
      "DNA stores genetic information using four chemical bases: A, T, C and G.",
    example:
      "Think of DNA as the entire cookbook containing many different instructions.",
    fact: "DNA contains both genes and regions that do not encode proteins.",
  },
  Gene: {
    title: "Gene",
    subtitle: "A functional DNA sequence",
    description:
      "A gene is a region of DNA that produces a functional product, such as a protein or functional RNA.",
    example:
      "Think of a gene as one recipe in the cookbook.",
    fact: "Not every gene directly encodes a protein; some produce functional RNA.",
  },
  Protein: {
    title: "Protein",
    subtitle: "A molecule made by cellular machinery",
    description:
      "Proteins perform many jobs in cells, including catalysis, transport and structural support.",
    example:
      "Think of a protein as the finished dish prepared using a recipe.",
    fact: "Cells use RNA and ribosomes to make proteins from coding instructions.",
  },
};

const quizQuestions = [
  {
    question: "Which statement best describes a gene?",
    options: [
      "The entire DNA molecule in a cell",
      "A functional region of DNA",
      "A type of cell membrane",
    ],
    correct: 1,
    explanation:
      "A gene is a functional region of DNA that produces a functional RNA or protein product.",
  },
  {
    question: "Which bases are found in DNA?",
    options: [
      "A, T, C and G",
      "A, U, C and G",
      "A, T, U and G",
    ],
    correct: 0,
    explanation:
      "DNA uses adenine (A), thymine (T), cytosine (C) and guanine (G). RNA usually uses uracil (U) instead of thymine.",
  },
  {
    question: "What is the relationship between DNA and a gene?",
    options: [
      "They are completely unrelated",
      "DNA is made from proteins",
      "A gene is a region of DNA",
    ],
    correct: 2,
    explanation:
      "Genes are particular regions within DNA; DNA also contains other sequences.",
  },
];

export default function GeneTutorActivities({ topic = "" }) {
  const [activeTab, setActiveTab] = useState("explore");
  const [concept, setConcept] = useState("DNA");
  const [stage, setStage] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    {
      title: "DNA",
      detail: "Stores genetic information.",
    },
    {
      title: "Gene",
      detail: "A functional region of DNA.",
    },
    {
      title: "RNA",
      detail: "Carries or performs a biological role in gene expression.",
    },
    {
      title: "Protein",
      detail: "Many genes provide instructions for proteins.",
    },
  ];

  const question = quizQuestions[quizIndex];
  const score = quizQuestions.reduce(
    (total, item, index) =>
      total + (answers[index] === item.correct ? 1 : 0),
    0
  );

  function chooseAnswer(optionIndex) {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [quizIndex]: optionIndex,
    }));
  }

  function nextQuestion() {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((previous) => previous + 1);
    } else {
      setSubmitted(true);
    }
  }

  function restartQuiz() {
    setQuizIndex(0);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section className="gene-activities">
      <div className="activity-heading">
        <span>INTERACTIVE LEARNING</span>
        <h3>Explore the concept</h3>
        <p>
          Based on your question
          {topic ? `: ${topic.slice(0, 100)}` : ""}.
        </p>
      </div>

      <div className="activity-tabs" role="tablist" aria-label="Learning activities">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "explore"}
          className={activeTab === "explore" ? "active" : ""}
          onClick={() => setActiveTab("explore")}
        >
          Explore
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "flow"}
          className={activeTab === "flow" ? "active" : ""}
          onClick={() => setActiveTab("flow")}
        >
          Gene pathway
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "quiz"}
          className={activeTab === "quiz" ? "active" : ""}
          onClick={() => setActiveTab("quiz")}
        >
          Quick quiz
        </button>
      </div>

      {activeTab === "explore" && (
        <div className="concept-explorer">
          <div className="concept-buttons">
            {Object.keys(concepts).map((name) => (
              <button
                type="button"
                key={name}
                className={concept === name ? "selected" : ""}
                onClick={() => setConcept(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <article className="concept-card" aria-live="polite">
            <div className="concept-symbol">
              {concept === "DNA" ? "🧬" : concept === "Gene" ? "🔬" : "🧫"}
            </div>
            <span>{concepts[concept].subtitle}</span>
            <h4>{concepts[concept].title}</h4>
            <p>{concepts[concept].description}</p>
            <div className="concept-example">
              <strong>Analogy</strong>
              <p>{concepts[concept].example}</p>
            </div>
            <div className="concept-fact">
              <strong>Did you know?</strong>
              <p>{concepts[concept].fact}</p>
            </div>
          </article>
        </div>
      )}

      {activeTab === "flow" && (
        <div className="pathway-explorer">
          <p>
            Explore how genetic information can be used to produce a protein.
            This is a simplified educational model.
          </p>

          <div className="pathway-steps">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.title}
                className={stage === index ? "current" : ""}
                onClick={() => setStage(index)}
                aria-pressed={stage === index}
              >
                <span className="pathway-number">{index + 1}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>

          <div className="pathway-detail" aria-live="polite">
            <span>STEP {stage + 1} OF {steps.length}</span>
            <h4>{steps[stage].title}</h4>
            <p>{steps[stage].detail}</p>

            <div className="pathway-controls">
              <button
                type="button"
                onClick={() => setStage((previous) => Math.max(0, previous - 1))}
                disabled={stage === 0}
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setStage((previous) => Math.min(steps.length - 1, previous + 1))
                }
                disabled={stage === steps.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          <p className="activity-note">
            Not every RNA molecule is translated into a protein, and gene
            expression is more complex than this simplified pathway.
          </p>
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="quiz-panel">
          {!submitted ? (
            <>
              <div className="quiz-progress">
                Question {quizIndex + 1} of {quizQuestions.length}
              </div>

              <h4>{question.question}</h4>

              <div className="quiz-options">
                {question.options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    className={answers[quizIndex] === index ? "chosen" : ""}
                    aria-pressed={answers[quizIndex] === index}
                    onClick={() => chooseAnswer(index)}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {option}
                  </button>
                ))}
              </div>

              {answers[quizIndex] !== undefined && (
                <p className="quiz-feedback" aria-live="polite">
                  {answers[quizIndex] === question.correct
                    ? "Correct! "
                    : "Not quite. "}
                  {question.explanation}
                </p>
              )}

              <button
                type="button"
                className="quiz-next"
                disabled={answers[quizIndex] === undefined}
                onClick={nextQuestion}
              >
                {quizIndex === quizQuestions.length - 1
                  ? "See score"
                  : "Next question"}
              </button>
            </>
          ) : (
            <div className="quiz-results">
              <span>QUIZ COMPLETE</span>
              <h4>
                You scored {score} / {quizQuestions.length}
              </h4>
              <p>
                {score === quizQuestions.length
                  ? "Excellent work! You have mastered these basics."
                  : "Review the concepts above and try again to improve your score."}
              </p>
              <button type="button" className="quiz-next" onClick={restartQuiz}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}