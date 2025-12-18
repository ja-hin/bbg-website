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
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `XF-DT-${month}${random}`;
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
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const gstRate = data.gstRate || 18;
        const gstAmount = (data.amount * gstRate) / (100 + gstRate);
        const baseAmount = data.amount - gstAmount;
        const hsnCode = data.hsnCode || "998413";

        // Main box background
        doc.rect(30, 30, 555, 750).fill("#f9f9f9");

        let currentY = 50;

        // Header Section - XTRACOVER
        doc
          .fontSize(16)
          .fillColor("#254696")
          .text("XTRACOVER", 50, currentY);

        currentY += 20;

        // Company Details
        doc
          .fontSize(8.5)
          .fillColor("#333")
          .text("Xtracover Technologies Pvt Ltd (Delhi)", 50, currentY)
          .fontSize(7.5)
          .fillColor("#666")
          .text("Near U-Lehi Chowk, 3rd Floor, A1, FIEE Complex, Okhla Estste Phase-2", 50, currentY + 10)
          .text("New Delhi-110020", 50, currentY + 17)
          .text("GSTIN/UIN: 07A8BCD2012D1ZM | CIN: U74999DL2016PTC302763", 50, currentY + 24)
          .text("Email: complaints@xtracover.com | Phone: +91-8882136586", 50, currentY + 31);

        // Invoice Details Box on right
        doc
          .rect(380, currentY, 185, 65)
          .fill("#f0f0f0");

        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Invoice Details", 390, currentY + 5, { width: 175, align: "center" });

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Invoice No.", 390, currentY + 20)
          .fillColor("#333")
          .text(invoiceNumber, 470, currentY + 20);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Date:", 390, currentY + 30)
          .fillColor("#333")
          .text(this.formatDate(data.paymentDate), 470, currentY + 30);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Ref No:", 390, currentY + 40)
          .fillColor("#333")
          .text(data.transactionId, 470, currentY + 40);

        // Online Payment Badge
        doc
          .rect(380, currentY + 50, 185, 18)
          .fill("#254696");
        doc
          .fontSize(8)
          .fillColor("#fff")
          .text("Online Payment", 390, currentY + 54, { width: 165, align: "center" });

        currentY += 85;

        // Customer Information Section
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Customer Information", 50, currentY);

        currentY += 20;

        // Customer Info Box
        doc
          .rect(50, currentY, 515, 60)
          .stroke("#ddd");

        // Left column
        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Name:", 60, currentY + 5)
          .fillColor("#333")
          .text(data.customerName, 110, currentY + 5);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Email:", 60, currentY + 18)
          .fillColor("#333")
          .text(data.customerEmail, 110, currentY + 18);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("State:", 60, currentY + 31)
          .fillColor("#333")
          .text(data.customerState || "—", 110, currentY + 31);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Pincode:", 60, currentY + 44)
          .fillColor("#333")
          .text(data.customerPincode || "—", 110, currentY + 44);

        // Right column
        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Phone:", 340, currentY + 5)
          .fillColor("#333")
          .text(data.customerContact, 400, currentY + 5);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("Pincode:", 340, currentY + 18)
          .fillColor("#333")
          .text(data.customerPincode || "—", 400, currentY + 18);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("State", 340, currentY + 31)
          .fillColor("#333")
          .text("—", 400, currentY + 31);

        currentY += 75;

        // Items Table
        const tableHeaderY = currentY;
        doc
          .rect(50, tableHeaderY, 515, 22)
          .fill("#1a3f5c");

        doc
          .fontSize(8)
          .fillColor("#fff")
          .text("Sl No:", 60, tableHeaderY + 6)
          .text("Description of Goods", 95, tableHeaderY + 6)
          .text("HSN/SAC", 330, tableHeaderY + 6)
          .text("Quantity", 390, tableHeaderY + 6)
          .text("Rate", 450, tableHeaderY + 6)
          .text("Amount", 505, tableHeaderY + 6, { align: "right" });

        // Item Row 1
        const itemRow1Y = tableHeaderY + 25;
        doc
          .rect(50, itemRow1Y, 515, 35)
          .stroke("#ddd");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("1", 60, itemRow1Y + 3)
          .fontSize(8)
          .text(`${data.planName}`, 95, itemRow1Y + 3)
          .fontSize(7)
          .fillColor("#666")
          .text(`${data.planType.toUpperCase()} ${hsnCode}`, 95, itemRow1Y + 12);

        doc
          .fontSize(8)
          .fillColor("#333")
          .text(hsnCode, 330, itemRow1Y + 3)
          .text("1 pcs", 390, itemRow1Y + 3)
          .text(`₹${baseAmount.toFixed(2)}`, 450, itemRow1Y + 3, { align: "right" })
          .text(`₹${baseAmount.toFixed(2)}`, 520, itemRow1Y + 3, { align: "right" });

        // IGST Row
        const igstRowY = itemRow1Y + 38;
        doc
          .rect(50, igstRowY, 515, 20)
          .stroke("#ddd");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("IGST", 95, igstRowY + 4)
          .text(`${gstRate}%`, 450, igstRowY + 4, { align: "right" })
          .text(`₹${gstAmount.toFixed(2)}`, 520, igstRowY + 4, { align: "right" });

        // Round off Row
        const roundOffRowY = igstRowY + 22;
        doc
          .rect(50, roundOffRowY, 515, 20)
          .stroke("#ddd");

        doc
          .fontSize(8)
          .fillColor("#333")
          .text("Round off", 95, roundOffRowY + 4)
          .text("- 0.01", 520, roundOffRowY + 4, { align: "right" });

        // Total Amount Chargeable
        const totalRowY = roundOffRowY + 22;
        doc
          .rect(50, totalRowY, 515, 25)
          .fill("#f9f9f9")
          .stroke("#333");

        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Total Amount Chargeable", 300, totalRowY + 5, { align: "right" })
          .text("1 pcs", 390, totalRowY + 5)
          .fontSize(10)
          .fillColor("#254696")
          .text(`₹${data.amount.toFixed(2)}`, 520, totalRowY + 5, { align: "right" });

        // Amount in words
        currentY = totalRowY + 30;
        doc
          .fontSize(8)
          .fillColor("#333")
          .text(`INR ${this.numberToWords(Math.floor(data.amount))}`, 60, currentY);

        currentY += 20;

        // Tax Details Table
        const taxTableHeaderY = currentY;
        doc
          .rect(50, taxTableHeaderY, 515, 18)
          .fill("#f0f0f0")
          .stroke("#ddd");

        doc
          .fontSize(7.5)
          .fillColor("#333")
          .text("HSN/SAC", 60, taxTableHeaderY + 4)
          .text("Taxable Value", 120, taxTableHeaderY + 4)
          .text("IGST", 210, taxTableHeaderY + 4)
          .text("Rate", 280, taxTableHeaderY + 4)
          .text("Tax Total", 330, taxTableHeaderY + 4)
          .text("Amount", 505, taxTableHeaderY + 4, { align: "right" });

        const taxRow1Y = taxTableHeaderY + 20;
        doc
          .rect(50, taxRow1Y, 515, 18)
          .stroke("#ddd");

        doc
          .fontSize(7.5)
          .fillColor("#333")
          .text(hsnCode, 60, taxRow1Y + 4)
          .text(`₹${baseAmount.toFixed(2)}`, 120, taxRow1Y + 4)
          .text(hsnCode, 210, taxRow1Y + 4)
          .text(`${gstRate}%`, 280, taxRow1Y + 4)
          .text(`₹${gstAmount.toFixed(2)}`, 330, taxRow1Y + 4)
          .text(`₹${baseAmount.toFixed(2)}`, 505, taxRow1Y + 4, { align: "right" });

        const taxRow2Y = taxRow1Y + 20;
        doc
          .rect(50, taxRow2Y, 515, 18)
          .stroke("#ddd");

        doc
          .fontSize(7.5)
          .fillColor("#333")
          .text("Total", 280, taxRow2Y + 4)
          .text(`- ${gstAmount.toFixed(2)}`, 330, taxRow2Y + 4)
          .text(`₹${data.amount.toFixed(2)}`, 505, taxRow2Y + 4, { align: "right" });

        // Tax amount in words
        currentY = taxRow2Y + 22;
        doc
          .fontSize(8)
          .fillColor("#333")
          .text(`Tax Amount in words: INR ${this.numberToWords(Math.floor(data.amount))} Only`, 60, currentY);

        // Declaration Section
        currentY += 25;
        doc
          .fontSize(10)
          .fillColor("#333")
          .text("Declaration", 60, currentY);

        currentY += 15;

        doc
          .fontSize(7)
          .fillColor("#666")
          .text("• BBG obligations arising for the original device registered with a valid BBG contract, expires, ZONE conditions, procedure applicable only for XtraCover plans with a registered plan holder from an authorized channel as allowed in the coupon as mentioned in terms.", 60, currentY, { width: 495, align: "left" })
          .text("• This invoice's liabilities are distinctionary any liability for data loss, misplacement, data corruption, unforeseenushalities, hardware defects/damage out of manual interference, software issues or damaged due to mishandled unintended use. Please read the complete insurance contract for full details.", 60, currentY + 25, { width: 495, align: "left" });

        // Footer - Company Details
        currentY = 740;
        doc
          .fontSize(8)
          .fillColor("#333")
          .text("Xtracover Technologies Pvt Ltd", 60, currentY)
          .fontSize(7)
          .fillColor("#666")
          .text("Near U Lehi Chowk, 3rd Floor, A1, FIEE Complex, Estste Phase-2", 60, currentY + 10)
          .text("New Delhi-110020", 60, currentY + 18)
          .text("Email: complaints@xtracover.com | Phone: +91-8882136586", 60, currentY + 26);

        // Bank Details
        doc
          .fontSize(8)
          .fillColor("#333")
          .text("Bank for Ept: EFT:", 360, currentY);

        doc
          .fontSize(7)
          .fillColor("#666")
          .text("IFSC: UBIND9819579", 360, currentY + 8)
          .text("A/C No: 04114783291076", 360, currentY + 16);

        // Computer Generated Note
        doc
          .fontSize(7)
          .fillColor("#999")
          .text("This is a Computer Generated Invoice", 50, 775, { align: "center", width: 515 });

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
