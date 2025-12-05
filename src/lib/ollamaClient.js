export async function askOllama(prompt) {
  const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}
