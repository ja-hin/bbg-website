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
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const gstRate = data.gstRate || 18;
        const gstAmount = (data.amount * gstRate) / (100 + gstRate);
        const baseAmount = data.amount - gstAmount;
        const hsnCode = data.hsnCode || "998413";

        // Header - XtraCover
        doc
          .fontSize(18)
          .fillColor("#254696")
          .text("XTRACOVER", 40, 40);

        // Company details
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Xtracover Technologies Pvt Ltd (Delhi)", 40, 62)
          .fontSize(8)
          .fillColor("#666")
          .text("Near U-Lehi Chowk, 3rd Floor, A1, FIEE Complex, Okhla Estste Phase-2", 40, 74)
          .text("New Delhi-110020", 40, 82)
          .text("GSTIN/UIN: 07A8BCD2012D1ZM | CIN: U74999DL2016PTC302763", 40, 90)
          .text("Email: complaints@xtracover.com | Phone: +91-8882136586", 40, 98);

        // Invoice Details Box (right side)
        const invoiceDetailsX = 320;
        doc
          .fontSize(11)
          .fillColor("#333")
          .text("Invoice Details", invoiceDetailsX, 45);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Invoice No.", invoiceDetailsX, 65)
          .fontSize(9)
          .fillColor("#333")
          .text(invoiceNumber, invoiceDetailsX + 120, 65);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Date:", invoiceDetailsX, 82)
          .fontSize(9)
          .fillColor("#333")
          .text(this.formatDate(data.paymentDate), invoiceDetailsX + 120, 82);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Ref No:", invoiceDetailsX, 99)
          .fontSize(9)
          .fillColor("#333")
          .text(data.transactionId, invoiceDetailsX + 120, 99);

        // Online Payment Badge
        doc
          .rect(invoiceDetailsX, 118, 155, 22)
          .fill("#254696");
        doc
          .fontSize(9)
          .fillColor("#fff")
          .text("Online Payment", invoiceDetailsX + 8, 123, { width: 140, align: "center" });

        // Customer Information Section
        doc
          .fontSize(10)
          .fillColor("#333")
          .text("Customer Information", 40, 175);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Name:", 40, 195)
          .fillColor("#333")
          .text(data.customerName, 110, 195);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Email:", 40, 210)
          .fillColor("#333")
          .text(data.customerEmail, 110, 210);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("State:", 40, 225)
          .fillColor("#333")
          .text(data.customerState || "—", 110, 225);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Phone:", 320, 195)
          .fillColor("#333")
          .text(data.customerContact, 380, 195);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Pincode:", 320, 210)
          .fillColor("#333")
          .text(data.customerPincode || "—", 380, 210);

        doc
          .fontSize(9)
          .fillColor("#666")
          .text("State", 320, 225)
          .fillColor("#333")
          .text("—", 380, 225);

        // Table Header
        const tableTop = 260;
        const columnPositions = { siNo: 40, desc: 80, hsn: 320, qty: 380, rate: 430, amount: 490 };

        doc
          .rect(40, tableTop, 515, 22)
          .fill("#1a3f5c");

        const headerY = tableTop + 6;
        doc
          .fontSize(9)
          .fillColor("#fff")
          .text("Sl No:", columnPositions.siNo, headerY)
          .text("Description of Goods", columnPositions.desc, headerY)
          .text("HSN/SAC", columnPositions.hsn, headerY)
          .text("Quantity", columnPositions.qty, headerY)
          .text("Rate", columnPositions.rate, headerY)
          .text("Amount", columnPositions.amount, headerY);

        // Table Row 1 - Plan Item
        const row1Y = tableTop + 30;
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("1", columnPositions.siNo, row1Y)
          .text(data.planName, columnPositions.desc, row1Y)
          .fontSize(8)
          .fillColor("#666")
          .text(`${data.planType.toUpperCase()} ${hsnCode}`, columnPositions.desc, row1Y + 12)
          .fontSize(9)
          .fillColor("#333")
          .text(hsnCode, columnPositions.hsn, row1Y)
          .text("1 pcs", columnPositions.qty, row1Y)
          .text(`₹${baseAmount.toFixed(2)}`, columnPositions.rate, row1Y, { align: "right" })
          .text(`₹${baseAmount.toFixed(2)}`, columnPositions.amount, row1Y, { align: "right" });

        // Table Row 2 - IGST
        const row2Y = row1Y + 30;
        doc
          .fontSize(9)
          .fillColor("#666")
          .text("IGST", columnPositions.desc, row2Y)
          .fontSize(9)
          .fillColor("#333")
          .text(`${gstRate}%`, columnPositions.rate, row2Y, { align: "right" })
          .text(`₹${gstAmount.toFixed(2)}`, columnPositions.amount, row2Y, { align: "right" });

        // Table Row 3 - Round off (if needed)
        const row3Y = row2Y + 18;
        doc
          .fontSize(9)
          .fillColor("#666")
          .text("Round off", columnPositions.desc, row3Y)
          .fillColor("#333")
          .text("- 0.01", columnPositions.amount, row3Y, { align: "right" });

        // Total section
        const totalBoxY = row3Y + 25;
        doc
          .fontSize(10)
          .fillColor("#333")
          .text("Total Amount Chargeable", 280, totalBoxY, { align: "right" })
          .text("1 pcs", columnPositions.qty, totalBoxY)
          .fontSize(11)
          .fillColor("#254696")
          .text(`₹${data.amount.toFixed(2)}`, columnPositions.amount, totalBoxY, { align: "right" });

        // Amount in words
        doc
          .fontSize(9)
          .fillColor("#333")
          .text(`INR ${this.numberToWords(Math.floor(data.amount))}`, 40, totalBoxY + 22);

        // Tax Details Table
        const taxTableY = totalBoxY + 50;
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("HSN/SAC", 40, taxTableY)
          .text("Taxable Value", 110, taxTableY)
          .text("IGST", 210, taxTableY)
          .text("Rate", 280, taxTableY)
          .text("Tax Total", 340, taxTableY)
          .text("Amount", 420, taxTableY);

        const taxRow1Y = taxTableY + 18;
        doc
          .fontSize(9)
          .text(hsnCode, 40, taxRow1Y)
          .text(`₹${baseAmount.toFixed(2)}`, 110, taxRow1Y)
          .text(hsnCode, 210, taxRow1Y)
          .text(`${gstRate}%`, 280, taxRow1Y)
          .text(`₹${gstAmount.toFixed(2)}`, 340, taxRow1Y)
          .text(`₹${baseAmount.toFixed(2)}`, 420, taxRow1Y);

        const taxRow2Y = taxRow1Y + 18;
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Total", 280, taxRow2Y, { align: "right" })
          .text(`- ${gstAmount.toFixed(2)}`, 340, taxRow2Y, { align: "right" })
          .text(`₹${data.amount.toFixed(2)}`, 420, taxRow2Y, { align: "right" });

        // Tax amount in words
        doc
          .fontSize(9)
          .fillColor("#333")
          .text(`Tax Amount in words: INR ${this.numberToWords(Math.floor(data.amount))} Only`, 40, taxRow2Y + 25);

        // Declaration Section
        const declarationY = taxRow2Y + 45;
        doc
          .fontSize(11)
          .fillColor("#333")
          .text("Declaration", 40, declarationY);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("• BBG obligations arising for the original device registered with a valid BBG contract, expires, ZONE conditions, procedure applicable only for XtraCover plans with a registered plan holder from an authorized channel as allowed in the coupon as mentioned in terms.", 40, declarationY + 18, { width: 515, align: "left" })
          .text("• XtraCover cannot guarantee coverage under all circumstances. Coverage exclusions apply as per the plan terms.", 40, declarationY + 50, { width: 515, align: "left" })
          .text("• This invoice's liabilities are distinctionary any liability for data loss, misplacement, data corruption, unforeseenushalities, hardware defects/damage out of manual interference, software issues or damaged due to mishandled unintended use.  Please read the complete insurance contract for full details.", 40, declarationY + 75, { width: 515, align: "left" });

        // Footer - Company Details
        const footerY = declarationY + 120;
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Xtracover Technologies Pvt Ltd", 40, footerY)
          .fontSize(8)
          .fillColor("#666")
          .text("Near U Lehi Chowk, 3rd Floor, A1, FIEE Complex, Estste Phase-2", 40, footerY + 12)
          .text("New Delhi-110020", 40, footerY + 20)
          .text("Email: complaints@xtracover.com", 40, footerY + 28)
          .text("Phone: +91-8882136586", 40, footerY + 36);

        // Bank Details (right side of footer)
        doc
          .fontSize(9)
          .fillColor("#333")
          .text("Bank for Ept: EFT:", 320, footerY);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("IFSC:", 320, footerY + 12)
          .fillColor("#333")
          .text("UBIND9819579", 380, footerY + 12);

        doc
          .fontSize(8)
          .fillColor("#666")
          .text("A/C No:", 320, footerY + 20)
          .fillColor("#333")
          .text("04114783291076", 380, footerY + 20);

        // Computer Generated Note
        doc
          .fontSize(8)
          .fillColor("#999")
          .text("This is a Computer Generated Invoice", 40, footerY + 50);

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
