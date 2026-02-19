import PDFDocument from "pdfkit";
import { s3Service } from "./s3-service";

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
  deviceModel?: string; // Added deviceModel
  amount: number;
  validity?: string;
  coverage?: string;
  paymentDate: Date;
  referralCode?: string;
  voucherCode?: string; // Added voucherCode
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
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (n: number): string => {
      let result = "";
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)];
        if (n % 10 > 0) result += " " + ones[n % 10];
      } else if (n >= 10) {
        result += teens[n - 10];
      } else if (n > 0) {
        result += ones[n];
      }
      return result.trim();
    };

    if (num === 0) return "Zero";

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const remaining = num % 1000;

    let result = "";
    if (crores > 0) result += convertHundreds(crores) + " Crore ";
    if (lakhs > 0) result += convertHundreds(lakhs) + " Lakh ";
    if (thousands > 0) result += convertHundreds(thousands) + " Thousand ";
    if (remaining > 0) result += convertHundreds(remaining);

    return result.trim() + " Only";
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async generateInvoice(data: InvoiceData): Promise<GeneratedInvoice> {
    try {
      const invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();

      const pdfBuffer = await this.createPdfBuffer(data, invoiceNumber);

      let invoiceUrl: string | undefined;
      try {
        const fileName = `invoices/${invoiceNumber}.pdf`;
        invoiceUrl = await s3Service.uploadBuffer(
          pdfBuffer,
          fileName,
          "application/pdf",
        );
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

  private createPdfBuffer(
    data: InvoiceData,
    invoiceNumber: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        const gstRate = data.gstRate ?? 18;
        const taxableValue = +(data.amount / (1 + gstRate / 100)).toFixed(2);
        const gstAmount = +(data.amount - taxableValue).toFixed(2);
        const hsn = data.hsnCode ?? "998413";

        let y = 40;

        /* ================= HEADER ================= */
        doc.fontSize(18).fillColor("#1f3c88").text("XTRACOVER", 40, y);

        y += 28;

        doc
          .fontSize(9)
          .fillColor("#333")
          .text("XTRACOVER TECHNOLOGIES PRIVATE LIMITED", 40, y)
          .fontSize(8)
          .fillColor("#666")
          .text("A-1, 3rd Floor, FIEE Complex Okhla Industrial Area Phase-2", 40, y + 12)
          .text("New Delhi South Delhi DL 110020 IN", 40, y + 22)
          .text(
            "CIN : U74999DL2017PTC313555",
            40,
            y + 32,
          )
          .text(
            "For any query call on 886 039 6039 between 09:30 to 18:30 IST",
            40,
            y + 42,
          )
          .text(
            "or by email at contactus@xtracover.com",
            40,
            y + 52,
          );

        /* Invoice box (right) */
        doc.roundedRect(360, y - 4, 190, 85, 6).stroke("#bbb");

        doc.fontSize(10).fillColor("#1f3c88").text("Invoice Details", 370, y);
        doc.fontSize(8).fillColor("#333");
        doc.text("Invoice No:", 370, y + 18);
        doc.text(invoiceNumber, 450, y + 18);

        doc.text("Date:", 370, y + 32);
        doc.text(this.formatDate(data.paymentDate), 450, y + 32);

        doc.text("Ref No:", 370, y + 46);
        doc.text(data.voucherCode || data.transactionId.slice(0, 20), 450, y + 46);

        doc.rect(370, y + 62, 170, 16).fill("#1f3c88");
        doc
          .fillColor("#fff")
          .fontSize(8)
          .text("Online Payment", 370, y + 66, {
            width: 170,
            align: "center",
          });

        y += 100;

        /* ================= CUSTOMER INFO ================= */
        doc.fontSize(10).fillColor("#333").text("Customer Information", 40, y);
        y += 12;

        doc.roundedRect(40, y, 510, 55, 6).stroke("#ccc");

        doc.fontSize(8).fillColor("#666");
        doc.text("Name:", 50, y + 8);
        doc.text("Email:", 50, y + 22);
        doc.text("State:", 50, y + 36);

        doc.fillColor("#333");
        doc.text(data.customerName, 100, y + 8);
        doc.text(data.customerEmail, 100, y + 22);
        doc.text(data.customerState ?? "—", 100, y + 36);

        doc.fillColor("#666");
        doc.text("Phone:", 330, y + 8);
        doc.text("Pincode:", 330, y + 22);

        doc.fillColor("#333");
        doc.text(data.customerContact, 390, y + 8);
        doc.text(data.customerPincode ?? "—", 390, y + 22);

        y += 70;

        /* ================= ITEMS TABLE ================= */
        doc.rect(40, y, 510, 22).fill("#1f3c88");
        doc.fillColor("#fff").fontSize(8);
        doc.text("Sl", 45, y + 6);
        doc.text("Description of Goods", 70, y + 6);
        doc.text("HSN/SAC", 300, y + 6);
        doc.text("Qty", 365, y + 6);
        doc.text("Rate", 410, y + 6);
        doc.text("Amount", 520, y + 6, { align: "right" });

        y += 22;

        /* Adjusted row height to 38 into accommodation two lines of text */
        doc.rect(40, y, 510, 38).stroke("#ddd");
        doc.fillColor("#333").fontSize(8);
        doc.text("1", 45, y + 12);

        // Line 1: Plan Name
        doc.text(data.planName, 70, y + 8, { width: 220, ellipsis: true });

        // Line 2: Device Details
        const deviceDetails = [data.deviceType, data.brand, data.deviceModel].filter(Boolean).join(" ");
        doc
          .fontSize(7)
          .fillColor("#666")
          .text(deviceDetails, 70, y + 20, { width: 220, ellipsis: true });

        // Reset for other columns
        doc.fontSize(8).fillColor("#333");

        doc.text(hsn, 300, y + 12);
        doc.text("1 pcs", 365, y + 12);
        doc.text(taxableValue.toFixed(2), 410, y + 12);
        doc.text(taxableValue.toFixed(2), 520, y + 12, { align: "right" });

        y += 40; // Adjusted Y increment

        /* IGST */
        doc.rect(40, y, 510, 18).stroke("#eee");
        doc.fillColor("#333").fontSize(8);
        doc.text("IGST", 70, y + 4);
        doc.text(`${gstRate}%`, 410, y + 4);
        doc.text(gstAmount.toFixed(2), 520, y + 4, { align: "right" });

        y += 20;

        /* Total */
        doc.fontSize(9).fillColor("#1f3c88");
        doc.text("Total Amount Chargeable", 300, y);
        doc.text(data.amount.toFixed(2), 520, y, { align: "right" });

        y += 18;

        doc.fontSize(8).fillColor("#333");
        doc.text(`INR ${this.numberToWords(Math.floor(data.amount))}`, 40, y);

        y += 26;

        /* ================= TAX SUMMARY ================= */
        doc.rect(40, y, 510, 18).fill("#f1f1f1").stroke("#ccc");
        doc.fillColor("#333").fontSize(8);
        doc.text("HSN", 50, y + 4);
        doc.text("Taxable", 120, y + 4);
        doc.text("Rate", 230, y + 4);
        doc.text("Tax", 300, y + 4);
        doc.text("Amount", 520, y + 4, { align: "right" });

        y += 18;

        doc.rect(40, y, 510, 18).stroke("#eee");
        doc.fillColor("#333").fontSize(8);
        doc.text(hsn, 50, y + 4);
        doc.text(taxableValue.toFixed(2), 120, y + 4);
        doc.text(`${gstRate}%`, 230, y + 4);
        doc.text(gstAmount.toFixed(2), 300, y + 4);
        doc.text(data.amount.toFixed(2), 520, y + 4, { align: "right" });

        y += 30;

        /* ================= DECLARATION ================= */
        doc.fontSize(9).fillColor("#333").text("Declaration", 40, y);
        y += 12;

        doc
          .fontSize(7)
          .fillColor("#666")
          .text(
            "BBG applicable only on original device registered with valid BBG voucher and tax invoice. Xtracover is not liable for data recovery. Customer must reset and remove all data before handover.",
            40,
            y,
            { width: 510 },
          );

        /* ================= FOOTER ================= */
        doc.fontSize(7.5).fillColor("#333");
        doc.text("Xtracover Technologies Pvt Ltd", 40, 760);
        doc.text("New Delhi - 110020 | complaints@xtracover.com", 40, 772);

        doc.fontSize(7).fillColor("#999");
        doc.text("This is a Computer Generated Invoice", 40, 790, {
          width: 510,
          align: "center",
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  getInvoiceNumber(): string {
    return this.generateInvoiceNumber();
  }
}

export const invoiceService = new InvoiceService();
