import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PrinterIcon } from "lucide-react";
import { MoMType } from "../../types";
import { formatDate } from "@/lib/utils";

type MoMPDFDownloadProps = {
  mom: MoMType;
};

const MoMPDFDownload: React.FC<MoMPDFDownloadProps> = ({ mom }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);

    // Create a hidden iframe to generate the PDF content
    const iframe = document.createElement("iframe");
    iframe.style.visibility = "hidden";
    iframe.style.position = "absolute";
    document.body.appendChild(iframe);

    // Generate the HTML content for the PDF with null checks
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${mom?.title || "Meeting Minutes"}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            color: #000;
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 0;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
          }
          
          .content-container {
            background-color: white;
            border: 1px solid #000;
            border-radius: 10px;
            margin: 5mm;
            padding: 15mm 10mm;
            height: 100%;
            position: relative;
          }
          
          .header {
            display: flex;
            flex-direction: column;
            position: relative;
          }
          
          .title-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .meeting-title {
            font-family: 'Roboto', sans-serif;
            letter-spacing: 5px;
            font-size: 24px;
            margin: 0;
            padding: 0;
            text-transform: uppercase;
          }
          
          .minutes-title {
            font-size: 24px;
            letter-spacing: 6px;
            font-weight: 700;
            margin-top: 0;
            padding-top: 0;
            line-height: 1;
            text-transform: uppercase;
          }
          
          .mom-title {
            margin-top: 20px;
            font-weight: 500;
            letter-spacing: 6px;
            font-size: 18px;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          
          .circulated-by {
            font-size: 14px;
            margin-top: 5px;
            letter-spacing: 3px;
            margin: 0;
            padding: 0;
          }

          .status {
            font-size: 13px;
            margin: 0;
            padding-top: 1px;
          }
          
          .logo-container {
            text-align: right;
          }

          .logo-image {
            width: 80px;
            height: 80px;
          }
          
          .company-logo {
            position: absolute;
            margin-top: 95px;
            right: 0;
            max-width: 100%;
            text-align: right;
          }

          .company-logo-image {
            width: 300px;
            height: auto;
          }
          
          .info-grid {
            display: grid;
            background-color: #E1E1E1;
            border-radius: 10px;
            padding: 20px 10px;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 50px;
          }
          
          .info-box {
            display: flex;
          }
          
          .info-label {
            background-color: #0e7a85;
            color: white;
            padding: 10px ;
            margin-right: 10px;
            border-radius: 10px;
            width: 90px;
            display: flex;
            align-items: center;
          }
          
          .info-value {
            border: 1px solid #000;
            border-radius: 1px;
            padding: 5px;
            background-color: white;
            flex-grow: 1;
            font-size: 13px;
            white-space: pre-line;
          }
          
          .sections-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
          }
          
          .section {
            display: flex;
            flex-direction: column;
            margin-bottom: 10px;
            padding: 10px;
          }
          
          .section-header {
            background-color: #0e7a85;
            color: white;
            padding: 5px 10px;
            border-radius: 10px;
            font-weight: 500;
          }
          
          .section-content {
            background-color: #E1E1E1;
            border-radius: 10px;
            min-height: 200px;
          }
          
          .bullet-list {
            margin: 10px;
            padding: 10px;
            background-color: #fff;
            border: 1px solid #000;
          }
          
          .bullet-item {
            margin-bottom: 1px;
            position: relative;
          }

          .bullet-item .number {
            margin-right: 4px;
            font-weight: 500;
          }
          
          .bullet-item .text {
            font-size: 13px;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              margin: 0;
            }
            
            .page {
              margin: 0;
              border: none;
            }
            
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="content-container">
            <div class="header">
              <div class="title-container">
                <div>
                  <h1 class="meeting-title">MEETING</h1>
                  <h2 class="minutes-title">MINUTES</h2>
                </div>
                <div class="logo-container">
                  <img src="/logo/activus-logo.svg" alt="Logo" class="logo-image">
                </div>
              </div>
              
              <div class="company-logo">
                <img src="/logo/activus-full.svg" alt="Company Logo" class="company-logo-image">
              </div>
              
              ${mom?.title ? `<h3 class="mom-title">${mom.title}${mom?.mom_number ? ` - ${mom.mom_number}` : ""}</h3>` : ''}
              ${mom?.created_by?.first_name && mom?.created_by?.last_name ? 
                `<p class="circulated-by">Circulated by: ${mom.created_by.first_name} ${mom.created_by.last_name}</p>` : ''}
              ${mom?.status ? `<p class="status">Status Of MoM: ${mom.status}</p>` : ''}
            </div>
            
            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">Creation:</div>
                <div class="info-value">${mom?.created_at ? formatDate(mom.created_at) : "N/A"}</div>
              </div>
              
              <div class="info-box">
                <div class="info-label">Completion:</div>
                <div class="info-value">${mom?.completion_date ? formatDate(mom.completion_date) : "N/A"}</div>
              </div>
              
              <div class="info-box">
                <div class="info-label">Facilitator:</div>
                <div class="info-value">
                  ${mom?.project?.user_roles && Array.isArray(mom.project.user_roles) && mom.project.user_roles.length > 0 
                    ? mom.project.user_roles
                        .filter(role => role?.user?.first_name && role?.user?.last_name)
                        .map(role => `${role.user.first_name} ${role.user.last_name}`)
                        .join(", ")
                    : "N/A"}
                </div>
              </div>
              
              <div class="info-box">
                <div class="info-label">Place:</div>
                <div class="info-value">${mom?.place || "N/A"}</div>
              </div>
            </div>
            
            <div class="sections-grid">
              <div class="section">
                <div class="section-header">Discussion:</div>
                <div class="section-content">
                  <div class="bullet-list">
                    ${mom?.discussion && Array.isArray(mom.discussion) && mom.discussion.length > 0
                      ? mom.discussion
                          .map(
                            (item, index) => `
                          <div class="bullet-item">
                            <span class="number">${index + 1}.</span>
                            <span class="text" style="${
                              item.completed
                                ? "text-decoration: line-through;"
                                : ""
                            }">${item.text || ""}</span>
                          </div>
                        `
                          )
                          .join("")
                      : "<div>No discussions recorded</div>"}
                  </div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-header">Open Issue:</div>
                <div class="section-content">
                  <div class="bullet-list">
                    ${mom?.open_issues && Array.isArray(mom.open_issues) && mom.open_issues.length > 0
                      ? mom.open_issues
                          .map(
                            (item, index) => `
                          <div class="bullet-item">
                            <span class="number">${index + 1}.</span>
                            <span class="text" style="${
                              item.completed
                                ? "text-decoration: line-through;"
                                : ""
                            }">${item.text || ""}</span>
                          </div>
                        `
                          )
                          .join("")
                      : "<div>No open issues recorded</div>"}
                  </div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-header">Updates:</div>
                <div class="section-content">
                  <div class="bullet-list">
                    ${mom?.updates && Array.isArray(mom.updates) && mom.updates.length > 0
                      ? mom.updates
                          .map(
                            (item, index) => `
                          <div class="bullet-item">
                            <span class="number">${index + 1}.</span>
                            <span class="text" style="${
                              item.completed
                                ? "text-decoration: line-through;"
                                : ""
                            }">${item.text || ""}</span>
                          </div>
                        `
                          )
                          .join("")
                      : "<div>No updates recorded</div>"}
                  </div>
                </div>
              </div>
              
              <div class="section">
                <div class="section-header">Notes:</div>
                <div class="section-content">
                  <div class="bullet-list">
                    ${mom?.notes && Array.isArray(mom.notes) && mom.notes.length > 0
                      ? mom.notes
                          .map(
                            (item, index) => `
                          <div class="bullet-item">
                            <span class="number">${index + 1}.</span>
                            <span class="text" style="${
                              item.completed
                                ? "text-decoration: line-through;"
                                : ""
                            }">${item.text || ""}</span>
                          </div>
                        `
                          )
                          .join("")
                      : "<div>No notes recorded</div>"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the content to the iframe document
    iframe?.contentWindow?.document.open();
    iframe?.contentWindow?.document.write(pdfContent);
    iframe?.contentWindow?.document.close();

    // Using setTimeout to ensure the iframe content is fully rendered
    setTimeout(() => {
      // Use the browser's print functionality to save as PDF
      iframe?.contentWindow?.print();

      // Clean up
      document.body.removeChild(iframe);
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Button
        onClick={generatePDF}
        className="w-full flex items-center justify-center gap-2"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <PrinterIcon className="h-4 w-4" />
            Print MoM
          </>
        )}
      </Button>
    </div>
  );
};

export default MoMPDFDownload;