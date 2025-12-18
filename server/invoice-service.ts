import PDFDocument from "pdfkit";
import { s3Service } from "./s3-service";
import { Readable } from "stream";

interface InvoiceData {
  invoiceNumber: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerContact: string;
  customerState?: string;
  customerPincode?: string;
  planName: string;
  planType: string;
  deviceType: string;
  brand?: string;
  amount: number;
  validity?: string;
  coverage?: string;
  paymentDate: Date;
  referralCode?: string;
  hsnCode?: string;
  gstRate?: number;
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
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `XF-DT-${day}GZZFP${random}`;
  }

  private numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        if (n % 10 > 0) result += ' ' + ones[n % 10];
      } else if (n >= 10) {
        result += teens[n - 10];
      } else if (n > 0) {
        result += ones[n];
      }
      return result.trim();
    };

    if (num === 0) return 'Zero';
    
    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const remaining = num % 1000;

    let result = '';
    if (crores > 0) result += convertHundreds(crores) + ' Crore ';
    if (lakhs > 0) result += convertHundreds(lakhs) + ' Lakh ';
    if (thousands > 0) result += convertHundreds(thousands) + ' Thousand ';
    if (remaining > 0) result += convertHundreds(remaining);

    return result.trim() + ' Only';
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
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const gstRate = data.gstRate || 18;
        const gstAmount = (data.amount * gstRate) / (100 + gstRate);
        const baseAmount = data.amount - gstAmount;
        const hsnCode = data.hsnCode || "998413";
        let currentY = 50;

        // Header - XTRACOVER
        doc
          .fontSize(14)
          .fillColor("#254696")
          .text("XTRACOVER", 50, currentY);

        currentY += 18;

        // Company Details (left side)
        doc
          .fontSize(8)
          .fillColor("#333")
          .text("Xtracover Technologies Pvt Ltd (Delhi)", 50, currentY)
          .fontSize(7.5)
          .fillColor("#666")
          .text("Near U-Lehi Chowk, 3rd Floor, A1, FIEE Complex, Okhla Estste Phase-2", 50, currentY + 10)
          .text("New Delhi-110020", 50, currentY + 18)
          .text("GSTIN/UIN: 07A8BCD2012D1ZM | CIN: U74999DL2016PTC302763", 50, currentY + 26)
          .text("Email: complaints@xtracover.com | Phone: +91-8882136586", 50, currentY + 34);

        // Invoice Details (right side - simple box)
        const rightX = 340;
        doc
          .rect(rightX, currentY, 170, 65)
          .stroke("#999");

        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Invoice Details", rightX + 5, currentY + 3);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Invoice No.", rightX + 5, currentY + 18)
          .fillColor("#333")
          .text(invoiceNumber, rightX + 90, currentY + 18);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Date:", rightX + 5, currentY + 28)
          .fillColor("#333")
          .text(this.formatDate(data.paymentDate), rightX + 90, currentY + 28);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Ref No:", rightX + 5, currentY + 38)
          .fillColor("#333")
          .text(data.transactionId.substring(0, 25), rightX + 90, currentY + 38);

        // Online Payment Badge
        doc
          .rect(rightX, currentY + 50, 170, 15)
          .fill("#254696");
        doc
          .fontSize(8)
          .fillColor("#fff")
          .text("Online Payment", rightX + 5, currentY + 53, { width: 160, align: "center" });

        currentY += 80;

        // Customer Information Header
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Customer Information", 50, currentY);

        currentY += 12;

        // Customer Info Box
        doc
          .rect(50, currentY, 500, 50)
          .stroke("#ccc");

        // Left column
        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Name:", 58, currentY + 4)
          .fillColor("#333")
          .text(data.customerName, 100, currentY + 4);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Email:", 58, currentY + 14)
          .fillColor("#333")
          .text(data.customerEmail, 100, currentY + 14);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("State:", 58, currentY + 24)
          .fillColor("#333")
          .text(data.customerState || "—", 100, currentY + 24);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Pincode:", 58, currentY + 34)
          .fillColor("#333")
          .text(data.customerPincode || "—", 100, currentY + 34);

        // Right column
        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Phone:", 310, currentY + 4)
          .fillColor("#333")
          .text(data.customerContact, 365, currentY + 4);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Pincode:", 310, currentY + 14)
          .fillColor("#333")
          .text(data.customerPincode || "—", 365, currentY + 14);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("State", 310, currentY + 24)
          .fillColor("#333")
          .text("—", 365, currentY + 24);

        currentY += 60;

        // Items Table Header
        doc
          .rect(50, currentY, 500, 18)
          .fill("#1a3f5c");

        doc
          .fontSize(8)
          .fillColor("#fff")
          .text("Sl No:", 58, currentY + 5)
          .text("Description of Goods", 80, currentY + 5)
          .text("HSN/SAC", 300, currentY + 5)
          .text("Quantity", 365, currentY + 5)
          .text("Rate", 420, currentY + 5)
          .text("Amount", 490, currentY + 5, { align: "right" });

        currentY += 20;

        // Item Row
        doc
          .rect(50, currentY, 500, 22)
          .stroke("#ddd");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("1", 58, currentY + 3)
          .fontSize(7.5)
          .text(data.planName, 80, currentY + 3)
          .fontSize(7)
          .fillColor("#666")
          .text(`${data.planType.toUpperCase()} ${hsnCode}`, 80, currentY + 11);

        doc
          .fontSize(8)
          .fillColor("#333")
          .text(hsnCode, 300, currentY + 3)
          .text("1 pcs", 365, currentY + 3)
          .text(`₹${baseAmount.toFixed(2)}`, 420, currentY + 3)
          .text(`₹${baseAmount.toFixed(2)}`, 530, currentY + 3, { align: "right" });

        currentY += 24;

        // IGST Row
        doc
          .rect(50, currentY, 500, 18)
          .stroke("#ddd");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("IGST", 80, currentY + 3)
          .text(`${gstRate}%`, 420, currentY + 3)
          .text(`₹${gstAmount.toFixed(2)}`, 530, currentY + 3, { align: "right" });

        currentY += 20;

        // Round off Row
        doc
          .rect(50, currentY, 500, 18)
          .stroke("#ddd");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("Round off", 80, currentY + 3)
          .text("- 0.01", 530, currentY + 3, { align: "right" });

        currentY += 22;

        // Total Amount Chargeable
        doc
          .fontSize(8)
          .fillColor("#333")
          .text("1 pcs", 365, currentY)
          .fontSize(9)
          .fillColor("#254696")
          .text("Total Amount Chargeable", 310, currentY)
          .text(`₹${data.amount.toFixed(2)}`, 530, currentY, { align: "right" });

        currentY += 18;

        // Amount in words
        doc
          .fontSize(8)
          .fillColor("#333")
          .text(`INR ${this.numberToWords(Math.floor(data.amount))}`, 50, currentY);

        currentY += 22;

        // Tax Details Table
        const taxTableHeaderY = currentY;
        doc
          .rect(50, taxTableHeaderY, 500, 16)
          .fill("#e8e8e8")
          .stroke("#999");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("HSN/SAC", 58, taxTableHeaderY + 3)
          .text("Taxable Value", 120, taxTableHeaderY + 3)
          .text("IGST", 200, taxTableHeaderY + 3)
          .text("Rate", 260, taxTableHeaderY + 3)
          .text("Tax Total", 320, taxTableHeaderY + 3)
          .text("Amount", 490, taxTableHeaderY + 3, { align: "right" });

        // Tax Row 1
        const taxRow1Y = taxTableHeaderY + 18;
        doc
          .rect(50, taxRow1Y, 500, 16)
          .stroke("#ccc");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text(hsnCode, 58, taxRow1Y + 2)
          .text(`₹${baseAmount.toFixed(2)}`, 120, taxRow1Y + 2)
          .text(hsnCode, 200, taxRow1Y + 2)
          .text(`${gstRate}%`, 260, taxRow1Y + 2)
          .text(`₹${gstAmount.toFixed(2)}`, 320, taxRow1Y + 2)
          .text(`₹${baseAmount.toFixed(2)}`, 530, taxRow1Y + 2, { align: "right" });

        // Tax Row 2
        const taxRow2Y = taxRow1Y + 18;
        doc
          .rect(50, taxRow2Y, 500, 16)
          .stroke("#ccc");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("Total", 260, taxRow2Y + 2)
          .text(`- ${gstAmount.toFixed(2)}`, 320, taxRow2Y + 2)
          .text(`₹${data.amount.toFixed(2)}`, 530, taxRow2Y + 2, { align: "right" });

        currentY = taxRow2Y + 20;

        // Tax amount in words
        doc
          .fontSize(8)
          .fillColor("#333")
          .text(`Tax Amount in words: INR ${this.numberToWords(Math.floor(data.amount))} Only`, 50, currentY);

        currentY += 20;

        // Declaration Section
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Declaration", 50, currentY);

        currentY += 12;

        doc
          .fontSize(6.5)
          .fillColor("#666")
          .text("• BBG obligations arising for the original device registered with a valid BBG contract, expires, ZONE conditions, procedure applicable only for XtraCover plans with a registered plan holder from an authorized channel as allowed in the coupon as mentioned in terms.", 50, currentY, { width: 500, align: "left" })
          .text("• This invoice's liabilities are distinctionary any liability for data loss, misplacement, data corruption, unforeseenushalities, hardware defects/damage out of manual interference, software issues or damaged due to mishandled unintended use. Please read the complete insurance contract for full details.", 50, currentY + 22, { width: 500, align: "left" });

        currentY = 730;

        // Footer Section
        doc
          .fontSize(7.5)
          .fillColor("#333")
          .text("Xtracover Technologies Pvt Ltd", 50, currentY)
          .text("Near U Lehi Chowk, 3rd Floor, A1, FIEE Complex, Estste Phase-2", 50, currentY + 9)
          .text("New Delhi-110020", 50, currentY + 17)
          .text("Email: complaints@xtracover.com | Phone: +91-8882136586", 50, currentY + 25);

        // Bank Details
        doc
          .fontSize(7.5)
          .fillColor("#333")
          .text("Bank for Ept: EFT:", 320, currentY)
          .fontSize(7)
          .fillColor("#666")
          .text("IFSC: UBIND9819579", 320, currentY + 8)
          .text("A/C No: 04114783291076", 320, currentY + 16);

        // Computer Generated Note
        doc
          .fontSize(7)
          .fillColor("#999")
          .text("This is a Computer Generated Invoice", 50, 770, { align: "center", width: 500 });

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
    return `${day}/${month}/${year}`;
  }

  getInvoiceNumber(): string {
    return this.generateInvoiceNumber();
  }
}

export const invoiceService = new InvoiceService();
