import PDFDocument from "pdfkit";
import { s3Service } from "./s3-service";
import { Readable } from "stream";

interface InvoiceData {
  invoiceNumber: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  planName: string;
  planType: string;
  deviceType: string;
  brand?: string;
  amount: number;
  validity?: string;
  coverage?: string;
  paymentDate: Date;
  referralCode?: string;
}

interface GeneratedInvoice {
  success: boolean;
  invoiceNumber: string;
  invoiceUrl?: string;
  pdfBuffer?: Buffer;
  error?: string;
}

class InvoiceService {
  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `INV-${year}${month}${day}-${random}`;
  }

  async generateInvoice(data: InvoiceData): Promise<GeneratedInvoice> {
    try {
      const invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();

      const pdfBuffer = await this.createPdfBuffer(data, invoiceNumber);

      let invoiceUrl: string | undefined;
      try {
        const fileName = `invoices/${invoiceNumber}.pdf`;
        invoiceUrl = await s3Service.uploadBuffer(pdfBuffer, fileName, "application/pdf");
        console.log("📄 Invoice uploaded to S3:", invoiceUrl);
      } catch (s3Error) {
        console.error("Failed to upload invoice to S3:", s3Error);
      }

      return {
        success: true,
        invoiceNumber,
        invoiceUrl,
        pdfBuffer,
      };
    } catch (error: any) {
      console.error("Invoice generation failed:", error);
      return {
        success: false,
        invoiceNumber: "",
        error: error.message,
      };
    }
  }

  private createPdfBuffer(data: InvoiceData, invoiceNumber: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: "A4" });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc
          .fontSize(24)
          .fillColor("#254696")
          .text("XtraCover", 50, 50)
          .fontSize(10)
          .fillColor("#666")
          .text("Device Protection Services", 50, 80);

        doc
          .fontSize(20)
          .fillColor("#333")
          .text("INVOICE", 400, 50, { align: "right" });

        doc
          .fontSize(10)
          .fillColor("#666")
          .text(`Invoice #: ${invoiceNumber}`, 400, 80, { align: "right" })
          .text(`Date: ${this.formatDate(data.paymentDate)}`, 400, 95, { align: "right" })
          .text(`Transaction ID: ${data.transactionId}`, 400, 110, { align: "right" });

        doc.moveTo(50, 140).lineTo(550, 140).stroke("#ddd");

        doc
          .fontSize(12)
          .fillColor("#254696")
          .text("BILL TO:", 50, 160);

        doc
          .fontSize(11)
          .fillColor("#333")
          .text(data.customerName, 50, 180)
          .fontSize(10)
          .fillColor("#666")
          .text(data.customerEmail, 50, 195)
          .text(`Phone: ${data.customerContact}`, 50, 210);

        const tableTop = 260;
        doc
          .fontSize(10)
          .fillColor("#fff")
          .rect(50, tableTop, 500, 25)
          .fill("#254696");

        doc
          .fillColor("#fff")
          .text("Description", 60, tableTop + 8)
          .text("Details", 250, tableTop + 8)
          .text("Amount", 480, tableTop + 8, { align: "right" });

        const row1Top = tableTop + 35;
        doc
          .fillColor("#333")
          .fontSize(11)
          .text(data.planName, 60, row1Top)
          .fontSize(9)
          .fillColor("#666")
          .text(`${data.planType.toUpperCase()} Protection Plan`, 60, row1Top + 15)
          .text(`Device: ${data.deviceType}${data.brand ? ` - ${data.brand}` : ""}`, 60, row1Top + 28);

        doc
          .fontSize(10)
          .fillColor("#333")
          .text(data.validity || "As per plan terms", 250, row1Top)
          .text(data.coverage || "Full coverage", 250, row1Top + 15);

        doc
          .fontSize(12)
          .fillColor("#333")
          .text(`₹${data.amount.toFixed(2)}`, 480, row1Top + 10, { align: "right" });

        doc.moveTo(50, row1Top + 60).lineTo(550, row1Top + 60).stroke("#ddd");

        const totalTop = row1Top + 80;
        doc
          .fontSize(10)
          .fillColor("#666")
          .text("Subtotal:", 380, totalTop)
          .text("GST (Included):", 380, totalTop + 18)
          .fontSize(12)
          .fillColor("#254696")
          .text("Total:", 380, totalTop + 40);

        doc
          .fontSize(10)
          .fillColor("#333")
          .text(`₹${data.amount.toFixed(2)}`, 480, totalTop, { align: "right" })
          .text("Inclusive", 480, totalTop + 18, { align: "right" })
          .fontSize(14)
          .fillColor("#254696")
          .text(`₹${data.amount.toFixed(2)}`, 480, totalTop + 40, { align: "right" });

        doc
          .rect(50, totalTop + 70, 500, 40)
          .fill("#e8f5e9");

        doc
          .fontSize(11)
          .fillColor("#2e7d32")
          .text("✓ PAID", 60, totalTop + 82)
          .fontSize(9)
          .text(`Payment received via PayU on ${this.formatDate(data.paymentDate)}`, 60, totalTop + 96);

        if (data.referralCode) {
          doc
            .fontSize(9)
            .fillColor("#666")
            .text(`Referral Code: ${data.referralCode}`, 50, totalTop + 130);
        }

        const footerTop = 720;
        doc.moveTo(50, footerTop).lineTo(550, footerTop).stroke("#ddd");

        doc
          .fontSize(9)
          .fillColor("#999")
          .text("Thank you for choosing XtraCover!", 50, footerTop + 15, { align: "center", width: 500 })
          .text("For support, contact: support@xtracover.com", 50, footerTop + 30, { align: "center", width: 500 })
          .text("This is a computer generated invoice.", 50, footerTop + 45, { align: "center", width: 500 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  getInvoiceNumber(): string {
    return this.generateInvoiceNumber();
  }
}

export const invoiceService = new InvoiceService();
