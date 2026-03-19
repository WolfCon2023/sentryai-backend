import { parsePdf } from './pdfParser.js';
import { parseXlsx } from './xlsxParser.js';
import { parseCsv } from './csvParser.js';
import { parseDocx } from './docxParser.js';
import { parsePptx } from './pptxParser.js';

export interface ParseResult {
  text: string;
  pages?: { pageNumber: number; text: string }[];
}

const parsers: Record<string, (buffer: Buffer) => Promise<ParseResult>> = {
  pdf: parsePdf,
  xlsx: parseXlsx,
  csv: parseCsv,
  docx: parseDocx,
  pptx: parsePptx,
};

export function getParser(fileType: string): ((buffer: Buffer) => Promise<ParseResult>) | undefined {
  return parsers[fileType.toLowerCase()];
}

export { parsePdf, parseXlsx, parseCsv, parseDocx, parsePptx };
