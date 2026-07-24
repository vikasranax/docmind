interface Chunk {
  text: string;
  index: number;
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 150): Chunk[] {
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkContent = text.slice(startIndex, endIndex).trim();

    if (chunkContent.length > 0) {
      chunks.push({
        text: chunkContent,
        index: chunkIndex,
      });
      chunkIndex++;
    }

    if (endIndex === text.length) {
      break;
    }

    startIndex += chunkSize - overlap;
  }

  return chunks;
}