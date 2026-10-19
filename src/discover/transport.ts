export async function readJson(
  response: Response,
  maxBytes: number,
): Promise<unknown> {
  if (
    !response.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    void response.body?.cancel().catch(() => {});
    throw new Error("Invalid data");
  }
  if (Number(response.headers.get("content-length")) > maxBytes) {
    void response.body?.cancel().catch(() => {});
    throw new Error("Response too large");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing data");
  let bytes = 0;
  let text = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        void reader.cancel().catch(() => {});
        throw new Error("Response too large");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(text) as unknown;
}
