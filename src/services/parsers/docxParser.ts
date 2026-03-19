import mammoth from 'mammoth';
import { ParseResult } from './index.js';

export async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value };
}
