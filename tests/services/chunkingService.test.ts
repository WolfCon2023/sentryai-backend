import { describe, it, expect } from 'vitest';
import { chunkText } from '../../src/services/chunkingService.js';

describe('ChunkingService', () => {
  const metadata = { fileId: 'file-1', fileName: 'test.pdf', dealId: 'deal-1' };

  it('should chunk text into pieces', () => {
    const text = 'A'.repeat(2500);
    const chunks = chunkText(text, metadata, 1000, 200);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].metadata.chunkIndex).toBe(0);
    expect(chunks[0].metadata.fileId).toBe('file-1');
  });

  it('should return a single chunk for short text', () => {
    const chunks = chunkText('Short text.', metadata, 1000, 200);
    expect(chunks.length).toBe(1);
    expect(chunks[0].text).toBe('Short text.');
  });

  it('should handle empty text', () => {
    const chunks = chunkText('', metadata);
    expect(chunks.length).toBe(0);
  });

  it('should apply overlap between chunks', () => {
    const text = 'word '.repeat(500); // ~2500 chars
    const chunks = chunkText(text, metadata, 1000, 200);
    // Each chunk (except possibly last) should be around chunkSize
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(1200); // some slack for sentence boundary
    }
  });

  it('should preserve metadata across chunks', () => {
    const text = 'A'.repeat(3000);
    const chunks = chunkText(text, { ...metadata, pageNumber: 5 });
    for (const chunk of chunks) {
      expect(chunk.metadata.dealId).toBe('deal-1');
      expect(chunk.metadata.pageNumber).toBe(5);
    }
  });
});
