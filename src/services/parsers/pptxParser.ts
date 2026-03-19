import AdmZip from 'adm-zip';
import { ParseResult } from './index.js';

export async function parsePptx(buffer: Buffer): Promise<ParseResult> {
  const zip = new AdmZip(buffer);
  const slides: string[] = [];

  const entries = zip.getEntries();
  const slideEntries = entries
    .filter((e) => e.entryName.match(/ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.entryName.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  for (const entry of slideEntries) {
    const xml = entry.getData().toString('utf-8');
    // Extract text from XML <a:t> tags
    const textMatches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (textMatches) {
      const slideText = textMatches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .join(' ');
      const slideNum = entry.entryName.match(/slide(\d+)/)?.[1] || '?';
      slides.push(`Slide ${slideNum}: ${slideText}`);
    }
  }

  return { text: slides.join('\n\n') };
}
