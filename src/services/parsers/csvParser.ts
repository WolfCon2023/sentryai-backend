import { ParseResult } from './index.js';

export async function parseCsv(buffer: Buffer): Promise<ParseResult> {
  // Use raw text — many "CSV" files in VDRs are really freeform text with commas
  const text = buffer.toString('utf-8');
  return { text };
}
