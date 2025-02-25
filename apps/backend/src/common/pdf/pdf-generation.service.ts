import * as PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';
import { MoM, User, Project, ProjectUserRole } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

type MoMWithRelations = MoM & {
  created_by: User;
  project: Project & {
    user_roles: (ProjectUserRole & {
      user: User;
    })[];
  };
};

@Injectable()
export class PdfGenerationService {
  async generateMoMPdf(mom: MoMWithRelations): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      
      // Create a new PDF with the same A4 size as frontend
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: mom?.title || 'Meeting Minutes',
          Author: mom?.created_by ? `${mom.created_by.first_name} ${mom.created_by.last_name}` : 'Unknown',
        }
      });

      // Collect PDF data chunks
      doc.on('data', chunks.push.bind(chunks));
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });

      // Start creating the PDF content
      this.createDocument(doc, mom);
      
      // Finalize PDF
      doc.end();
    });
  }

  private createDocument(doc: PDFKit.PDFDocument, mom: MoMWithRelations): void {
    // Setup fonts
    this.setupFonts(doc);
    
    // Create header section
    this.createHeader(doc, mom);
    
    // Create info grid
    this.createInfoGrid(doc, mom);
    
    // Create content sections
    this.createSectionsGrid(doc, mom);
    
    // Add page numbers
    this.addPageNumbers(doc);
  }

  private setupFonts(doc: PDFKit.PDFDocument): void {
    // Register fonts similar to the Roboto in the frontend
    // Note: In a real implementation, you would embed the actual Roboto font files
    doc.registerFont('Roboto-Regular', 'Helvetica');
    doc.registerFont('Roboto-Bold', 'Helvetica-Bold');
  }

  private createHeader(doc: PDFKit.PDFDocument, mom: MoMWithRelations): void {
    const startY = 50;
    
    // Title container area
    doc.font('Roboto-Bold')
      .fontSize(24)
      .text('MEETING', 50, startY, {
        characterSpacing: 5
      });
    
    doc.font('Roboto-Bold')
      .fontSize(24)
      .text('MINUTES', 50, startY + 30, {
        characterSpacing: 6,
        lineBreak: false
      });
    
    // Add logo if we have the files
    // In production, you would use actual file paths
    try {
      const logoPath = path.join(process.cwd(), 'assets', 'activus-logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 470, startY, { width: 80 });
      }

      const fullLogoPath = path.join(process.cwd(), 'assets', 'activus-full.png');
      if (fs.existsSync(fullLogoPath)) {
        doc.image(fullLogoPath, 250, startY + 95, { width: 300 });
      }
    } catch (error) {
      // Logo loading failed, continue without logo
      console.error('Failed to load logo:', error);
    }
    
    // Add MoM title and info
    if (mom?.title) {
      doc.font('Roboto-Regular')
        .fontSize(18)
        .text(`${mom.title}${mom?.mom_number ? ` - ${mom.mom_number}` : ""}`, 50, startY + 120, {
          characterSpacing: 3
        });
    }
    
    // Add circulated by info
    if (mom?.created_by?.first_name && mom?.created_by?.last_name) {
      doc.font('Roboto-Regular')
        .fontSize(14)
        .text(`Circulated by: ${mom.created_by.first_name} ${mom.created_by.last_name}`, 50, startY + 150, {
          characterSpacing: 2
        });
    }
    
    // Add status if available
    if (mom?.status) {
      doc.font('Roboto-Regular')
        .fontSize(13)
        .text(`Status Of MoM: ${mom.status}`, 50, startY + 170);
    }
  }

  private createInfoGrid(doc: PDFKit.PDFDocument, mom: MoMWithRelations): void {
    const startY = 230;
    const boxHeight = 30;
    const gridWidth = 500;
    const boxLabelWidth = 90;
    
    // Draw background rectangle
    doc.rect(50, startY, gridWidth, 110)
      .fill('#E1E1E1');
    
    // Creation date
    this.drawInfoBox(doc, 50, startY + 10, 'Creation:', this.formatDate(mom?.created_at), gridWidth/2 - 10, boxHeight);
    
    // Completion date
    this.drawInfoBox(doc, 50 + gridWidth/2, startY + 10, 'Completion:', this.formatDate(mom?.completion_date), gridWidth/2 - 10, boxHeight);
    
    // Facilitator
    let facilitators = 'N/A';
    if (mom?.project?.user_roles && Array.isArray(mom.project.user_roles) && mom.project.user_roles.length > 0) {
      facilitators = mom.project.user_roles
        .filter(role => role?.user?.first_name && role?.user?.last_name)
        .map(role => `${role.user.first_name} ${role.user.last_name}`)
        .join(", ");
    }
    this.drawInfoBox(doc, 50, startY + 55, 'Facilitator:', facilitators, gridWidth/2 - 10, boxHeight);
    
    // Place
    this.drawInfoBox(doc, 50 + gridWidth/2, startY + 55, 'Place:', mom?.place || 'N/A', gridWidth/2 - 10, boxHeight);
  }

  private drawInfoBox(doc: PDFKit.PDFDocument, x: number, y: number, label: string, value: string, width: number, height: number): void {
    const labelWidth = 90;
    const valueWidth = width - labelWidth - 10;
    
    // Draw label background
    doc.rect(x, y, labelWidth, height)
      .fill('#0e7a85');
    
    // Draw label text
    doc.fillColor('white')
      .font('Roboto-Regular')
      .fontSize(11)
      .text(label, x + 5, y + 10, { width: labelWidth - 10, align: 'left' });
    
    // Draw value background
    doc.fillColor('white')
      .rect(x + labelWidth + 10, y, valueWidth, height)
      .fillAndStroke('white', '#000000');
    
    // Draw value text
    doc.fillColor('black')
      .font('Roboto-Regular')
      .fontSize(11)
      .text(value, x + labelWidth + 15, y + 10, { width: valueWidth - 10, lineBreak: true });
  }

  private createSectionsGrid(doc: PDFKit.PDFDocument, mom: MoMWithRelations): void {
    const startY = 350;
    const sectionWidth = 240;
    const sectionHeight = 200;
    const margin = 20;
    
    // Create the four sections in a grid layout
    this.createSection(doc, 50, startY, 'Discussion', mom?.discussion as any[] || [], sectionWidth, sectionHeight);
    this.createSection(doc, 50 + sectionWidth + margin, startY, 'Open Issue', mom?.open_issues as any[] || [], sectionWidth, sectionHeight);
    this.createSection(doc, 50, startY + sectionHeight + margin, 'Updates', mom?.updates as any[] || [], sectionWidth, sectionHeight);
    this.createSection(doc, 50 + sectionWidth + margin, startY + sectionHeight + margin, 'Notes', mom?.notes as any[] || [], sectionWidth, sectionHeight);
  }

  private createSection(doc: PDFKit.PDFDocument, x: number, y: number, title: string, items: { text: string; completed: boolean }[], width: number, height: number): void {
    // Draw section header background
    doc.rect(x, y, width, 25)
      .fill('#0e7a85');
    
    // Draw section header text
    doc.fillColor('white')
      .font('Roboto-Bold')
      .fontSize(12)
      .text(title, x + 10, y + 7);
    
    // Draw section content background
    doc.fillColor('#E1E1E1')
      .rect(x, y + 25, width, height - 25)
      .fill();
    
    // Draw bullet list background
    doc.fillColor('white')
      .rect(x + 10, y + 35, width - 20, height - 45)
      .fillAndStroke('white', '#000000');
    
    // Draw bullet list items
    if (items.length === 0) {
      doc.fillColor('black')
        .font('Roboto-Regular')
        .fontSize(12)
        .text('No items recorded', x + 20, y + 45);
    } else {
      items.forEach((item, index) => {
        const textOptions: PDFKit.Mixins.TextOptions = {
          width: width - 40,
          lineBreak: true
        };
        
        // Use strikethrough for completed items by drawing a line
        const textY = y + 45 + (index * 20);
        
        doc.fillColor('black')
          .font('Roboto-Bold')
          .fontSize(13)
          .text(`${index + 1}.`, x + 20, textY, { continued: true });
        
        doc.font('Roboto-Regular')
          .fontSize(13)
          .text(` ${item.text || ""}`, { ...textOptions });
        
        // Add strikethrough if item is completed
        if (item.completed) {
          const textWidth = doc.widthOfString(` ${item.text || ""}`, textOptions);
          doc.moveTo(x + 20, textY + 7)
            .lineTo(x + 20 + Math.min(textWidth, width - 40), textY + 7)
            .stroke();
        }
      });
    }
  }

  private addPageNumbers(doc: PDFKit.PDFDocument): void {
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .text(
          `Page ${i + 1} of ${totalPages}`,
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 }
        );
    }
  }

  private formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  }
}