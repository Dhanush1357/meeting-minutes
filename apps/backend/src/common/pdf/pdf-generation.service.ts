import * as PDFDocument from 'pdfkit';
import type { PDFKit } from 'pdfkit';
import { Injectable } from '@nestjs/common';
import { MoM, User, Project } from '@prisma/client';

@Injectable()
export class PdfGenerationService {
  private createHeader(doc: PDFKit.PDFDocument, momNumber: string, year: string) {
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('ME E T I N G', {
        align: 'center',
        characterSpacing: 2,
      })
      .moveDown(0.5)
      .text('MINUTES', {
        align: 'center',
        characterSpacing: 1,
      })
      .moveDown(0.5)
      .text(`MOM AIDB RRL ${momNumber} ${year}`, {
        align: 'center',
      })
      .moveDown(0.5);
  }

  private createCirculatedBy(doc: PDFKit.PDFDocument, creator: User) {
    doc
      .font('Helvetica')
      .fontSize(11)
      .text('C ir c u l a te d  by :', {
        continued: true,
        characterSpacing: 0.5,
      })
      .text(` ${creator?.first_name} ${creator?.last_name}`, {
        characterSpacing: 0.5,
      })
      .moveDown(1);
  }

  private createInfoSection(
    doc: PDFKit.PDFDocument,
    mom: MoM,
    facilitators: string[],
    place: string,
  ) {
    // Create info section with specific spacing
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('Date:', {
        continued: true,
        width: 150,
      })
      .font('Helvetica')
      .text(new Date(mom.created_at).toLocaleDateString('en-GB'))
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Facilitator:', {
        continued: false,
      });

    // Add facilitators with company names
    facilitators.forEach((facilitator) => {
      doc
        .font('Helvetica')
        .text(facilitator, {
          indent: 20,
        })
        .moveDown(0.3);
    });

    doc
      .moveDown(0.2)
      .font('Helvetica-Bold')
      .text('Time:', {
        continued: true,
        width: 150,
      })
      .font('Helvetica')
      .text(new Date(mom.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }))
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('Place:', {
        continued: true,
        width: 150,
      })
      .font('Helvetica')
      .text(place)
      .moveDown(1);
  }

  private createContentSection(doc: PDFKit.PDFDocument, title: string, items: { text: string; completed: boolean }[]) {
    doc.font('Helvetica-Bold').text(`${title}:`, { continued: false }).font('Helvetica').moveDown(0.5);

    if (!items.length) {
      doc.text('1. None', { indent: 20 }).moveDown(0.5);
    } else {
      items.forEach((item, index) => {
        const statusSymbol = item.completed ? '[✔]' : '[ ]';
        doc.text(`${index + 1}. ${statusSymbol} ${item.text}`, { indent: 20 }).moveDown(0.5);
      });
    }
  }

  async generateMoMPdf(
    mom: MoM,
    project: Project,
  ): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
      });

      // Collect PDF data chunks
      doc.on('data', chunks.push.bind(chunks));
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });

      const currentYear = new Date().getFullYear();
      const financialYear = `${currentYear} - ${(currentYear + 1).toString().slice(2)}`;

      // Create PDF content
      this.createHeader(doc, mom?.mom_number || '', financialYear);
      this.createContentSection(doc, 'Discussion', mom.discussion as any);
      this.createContentSection(doc, 'Open Issues', mom.open_issues as any);
      this.createContentSection(doc, 'Updates', mom.updates as any);
      this.createContentSection(doc, 'Notes', mom.notes as any);

      // Add page numbers if needed
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).text(
          `Page ${i + 1} of ${pages.count}`,
          doc.page.margins.left,
          doc.page.height - doc.page.margins.bottom - 20,
          {
            align: 'center',
          },
        );
      }

      // Finalize PDF
      doc.end();
    });
  }
}