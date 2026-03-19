import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export const exportService = {
  async generatePdf(output: Record<string, unknown>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      const companyName = (output.companyName as string) || 'Investment Analysis';
      doc.fontSize(24).font('Helvetica-Bold').text(companyName, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Generated: ${output.generatedAt || new Date().toISOString()}`, { align: 'center' });
      doc.moveDown(2);

      // Sections (full memo)
      if (output.sections && Array.isArray(output.sections)) {
        for (const section of output.sections as Record<string, unknown>[]) {
          doc.fontSize(16).font('Helvetica-Bold').text(section.title as string);
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica').text(section.content as string, { align: 'justify' });
          doc.moveDown(1.5);
        }
      }

      // Quick snapshot
      if (output.summary) {
        doc.fontSize(16).font('Helvetica-Bold').text('Summary');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(output.summary as string);
        doc.moveDown(1.5);
      }

      if (output.marketBullets && Array.isArray(output.marketBullets)) {
        doc.fontSize(16).font('Helvetica-Bold').text('Market');
        doc.moveDown(0.5);
        for (const bullet of output.marketBullets as Record<string, unknown>[]) {
          doc.fontSize(11).font('Helvetica').text(`• ${bullet.text}`);
        }
        doc.moveDown(1.5);
      }

      if (output.keyMetrics && Array.isArray(output.keyMetrics)) {
        doc.fontSize(16).font('Helvetica-Bold').text('Key Metrics');
        doc.moveDown(0.5);
        for (const metric of output.keyMetrics as Record<string, unknown>[]) {
          doc.fontSize(11).font('Helvetica').text(`${metric.label}: ${metric.value}`);
        }
        doc.moveDown(1.5);
      }

      // Confidence
      if (output.overallConfidence) {
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text(`Overall Confidence: ${output.overallConfidence}%`);
      }

      doc.end();
    });
  },

  async generateDocx(output: Record<string, unknown>): Promise<Buffer> {
    const companyName = (output.companyName as string) || 'Investment Analysis';
    const children: Paragraph[] = [];

    children.push(
      new Paragraph({
        text: companyName,
        heading: HeadingLevel.TITLE,
      }),
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Generated: ${output.generatedAt || new Date().toISOString()}`, italics: true })],
      }),
    );

    children.push(new Paragraph({}));

    // Sections (full memo)
    if (output.sections && Array.isArray(output.sections)) {
      for (const section of output.sections as Record<string, unknown>[]) {
        children.push(new Paragraph({ text: section.title as string, heading: HeadingLevel.HEADING_1 }));
        children.push(new Paragraph({ text: section.content as string }));
        children.push(new Paragraph({}));
      }
    }

    // Quick snapshot
    if (output.summary) {
      children.push(new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_1 }));
      children.push(new Paragraph({ text: output.summary as string }));
      children.push(new Paragraph({}));
    }

    if (output.marketBullets && Array.isArray(output.marketBullets)) {
      children.push(new Paragraph({ text: 'Market', heading: HeadingLevel.HEADING_1 }));
      for (const bullet of output.marketBullets as Record<string, unknown>[]) {
        children.push(new Paragraph({ text: `• ${bullet.text}` }));
      }
    }

    const doc = new Document({
      sections: [{ children }],
    });

    return Buffer.from(await Packer.toBuffer(doc));
  },

  generateMarkdown(output: Record<string, unknown>): string {
    const companyName = (output.companyName as string) || 'Investment Analysis';
    const lines: string[] = [];

    lines.push(`# ${companyName}`);
    lines.push(`*Generated: ${output.generatedAt || new Date().toISOString()}*`);
    lines.push('');

    // Sections (full memo)
    if (output.sections && Array.isArray(output.sections)) {
      for (const section of output.sections as Record<string, unknown>[]) {
        lines.push(`## ${section.title}`);
        lines.push('');
        lines.push(section.content as string);
        lines.push('');
      }
    }

    // Quick snapshot
    if (output.summary) {
      lines.push('## Summary');
      lines.push('');
      lines.push(output.summary as string);
      lines.push('');
    }

    if (output.marketBullets && Array.isArray(output.marketBullets)) {
      lines.push('## Market');
      lines.push('');
      for (const bullet of output.marketBullets as Record<string, unknown>[]) {
        lines.push(`- ${bullet.text}`);
      }
      lines.push('');
    }

    if (output.keyMetrics && Array.isArray(output.keyMetrics)) {
      lines.push('## Key Metrics');
      lines.push('');
      lines.push('| Metric | Value |');
      lines.push('|--------|-------|');
      for (const metric of output.keyMetrics as Record<string, unknown>[]) {
        lines.push(`| ${metric.label} | ${metric.value} |`);
      }
      lines.push('');
    }

    if (output.topRisks && Array.isArray(output.topRisks)) {
      lines.push('## Top Risks');
      lines.push('');
      for (const risk of output.topRisks as Record<string, unknown>[]) {
        lines.push(`- ${risk.text}`);
      }
      lines.push('');
    }

    if (output.overallConfidence) {
      lines.push(`**Overall Confidence: ${output.overallConfidence}%**`);
    }

    return lines.join('\n');
  },
};
