export async function streamResponse(
  text: string,
  updateFn: (text: string) => void
) {
  const delay = 20; // ms per character
  let accumulated = "";

  for (let i = 0; i < text.length; i++) {
    accumulated += text[i];
    updateFn(accumulated);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export function createReadableStream(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunks = text.split(" ");
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk + " "));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      controller.close();
    },
  });
  return stream;
}
