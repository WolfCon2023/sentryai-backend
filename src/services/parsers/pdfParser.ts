import pdfParse from 'pdf-parse';
import { ParseResult } from './index.js';

export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pages: [{ pageNumber: 1, text: data.text }],
  };
}
