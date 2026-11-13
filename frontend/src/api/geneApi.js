
const API_BASE_URL = "http://localhost:8000";

export async function getSampleGene() {
  const response = await fetch(`${API_BASE_URL}/api/genes/sample`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function checkApiHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error("GeneVision backend is unavailable.");
  }

  return response.json();
}

export async function simulateMutation(sequence, position, newBase) {
  const response = await fetch(
    `${API_BASE_URL}/api/mutations/simulate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence,
        position: Number(position),
        new_base: newBase,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Mutation request failed.");
  }

  return data;
}
