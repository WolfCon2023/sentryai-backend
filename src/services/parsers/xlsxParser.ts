import * as XLSX from 'xlsx';
import { ParseResult } from './index.js';

export async function parseXlsx(buffer: Buffer): Promise<ParseResult> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const texts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    texts.push(`Sheet: ${sheetName}\n${csv}`);
  }

  return { text: texts.join('\n\n') };
}
