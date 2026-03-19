export interface TextChunk {
  text: string;
  metadata: {
    fileId: string;
    fileName: string;
    dealId: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

export function chunkText(
  text: string,
  metadata: Omit<TextChunk['metadata'], 'chunkIndex'>,
  chunkSize = 1000,
  chunkOverlap = 200,
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at a sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }

    const chunkText = text.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        metadata: { ...metadata, chunkIndex },
      });
      chunkIndex++;
    }

    start = end - chunkOverlap;
    if (start >= text.length) break;
  }

  return chunks;
}
