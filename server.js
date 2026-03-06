const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate-pdf", (req, res) => {
  const data = req.body;
  const doc = new PDFDocument({ size: "A4", margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // --- 1. Top Branding Header ---
  doc
    .fillColor("#2c3e50")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("AKASHMONI SAWN TIMBER", { align: "center" });

  doc.moveDown(0.5);
  doc
    .moveTo(30, doc.y)
    .lineTo(565, doc.y)
    .strokeColor("#2c3e50")
    .lineWidth(1)
    .stroke();
  doc.moveDown(1);

  // --- 2. Info Section (Mill Name now inside Mill Details) ---
  const infoY = doc.y;
  doc
    .fillColor("#2c3e50")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("MILL DETAILS:", 40, infoY);
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .text(`Name: ${data.millName.toUpperCase()}`, 40, infoY + 12)
    .text(`GSTIN: ${data.gst || "N/A"}`, 40, infoY + 25)
    .text(`Address: ${data.millAddress}`, 40, infoY + 37)
    .text(`Date: ${data.date}`, 40, infoY + 49);

  doc.font("Helvetica-Bold").fontSize(9).text("OWNER DETAILS:", 350, infoY);
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .text(`Name: ${data.ownerName}`, 350, infoY + 12)
    .text(`Address: ${data.ownerAddress}`, 350, infoY + 24)
    .text(`Pickup No: ${data.pickupNumber}`, 350, infoY + 36);

  // --- 3. 2-Column Table Settings ---
  const tableTop = 200;
  const colDiff = 280;
  const rowHeight = 20;
  const maxRowsPerSide = 24;

  // Column widths for centering logic
  const colWidths = { sn: 25, w: 45, t: 45, l: 45, p: 40, tot: 60 };

  const drawHeader = (xPos) => {
    doc.rect(xPos, tableTop, 270, 22).fill("#f2f2f2");
    doc.fillColor("#333").font("Helvetica-Bold").fontSize(8);

    // Centered Header Text
    doc.text("S.N", xPos, tableTop + 8, {
      width: colWidths.sn,
      align: "center",
    });
    doc.text("WIDTH", xPos + 25, tableTop + 8, {
      width: colWidths.w,
      align: "center",
    });
    doc.text("THICK", xPos + 70, tableTop + 8, {
      width: colWidths.t,
      align: "center",
    });
    doc.text("LENGTH", xPos + 115, tableTop + 8, {
      width: colWidths.l,
      align: "center",
    });
    doc.text("PCS", xPos + 160, tableTop + 8, {
      width: colWidths.p,
      align: "center",
    });
    doc.text("TOTAL CFT", xPos + 200, tableTop + 8, {
      width: colWidths.tot,
      align: "center",
    });
  };

  drawHeader(40);
  drawHeader(40 + colDiff);

  // --- 4. Rendering Rows ---
  data.rows.forEach((r, i) => {
    const isRightSide = i >= maxRowsPerSide;
    const xOffset = isRightSide ? 40 + colDiff : 40;
    const rowIndex = isRightSide ? i - maxRowsPerSide : i;
    const yPos = tableTop + 22 + rowIndex * rowHeight;

    // Row border
    doc
      .moveTo(xOffset, yPos + rowHeight)
      .lineTo(xOffset + 270, yPos + rowHeight)
      .strokeColor("#eeeeee")
      .lineWidth(0.5)
      .stroke();

    // Data with Centering
    doc
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(i + 1, xOffset, yPos + 6, { width: colWidths.sn, align: "center" }); // Bold S.No

    doc.font("Helvetica").fillColor("#444");
    doc.text(r.width, xOffset + 25, yPos + 6, {
      width: colWidths.w,
      align: "center",
    });
    doc.text(r.thick, xOffset + 70, yPos + 6, {
      width: colWidths.t,
      align: "center",
    });
    doc.text(r.length, xOffset + 115, yPos + 6, {
      width: colWidths.l,
      align: "center",
    });
    doc.text(r.piece, xOffset + 160, yPos + 6, {
      width: colWidths.p,
      align: "center",
    });
    doc.text(parseFloat(r.total).toFixed(2), xOffset + 200, yPos + 6, {
      width: colWidths.tot,
      align: "center",
    });
  });

  // --- 5. Summary Section ---
  const summaryY = 710;
  doc.rect(350, summaryY, 205, 50).strokeColor("#2c3e50").lineWidth(1).stroke();
  doc.fillColor("#2c3e50").font("Helvetica-Bold").fontSize(10);

  doc.text(`Total Pieces:`, 360, summaryY + 12);
  doc.text(data.totalPieces, 500, summaryY + 12, { align: "right", width: 45 });

  doc.text(`Grand Total CFT:`, 360, summaryY + 30);
  doc
    .fillColor("#d35400")
    .text(parseFloat(data.totalCft).toFixed(2), 500, summaryY + 30, {
      align: "right",
      width: 45,
    });

  // --- 6. Footer ---
  const footerY = 785;
  doc
    .moveTo(40, footerY)
    .lineTo(555, footerY)
    .strokeColor("#2c3e50")
    .lineWidth(2)
    .stroke();
  doc
    .fillColor("#2c3e50")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("AKASHMONI SAWN TIMBER", 40, footerY + 10);
  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Authorized Signatory", 400, footerY + 10, { align: "right" });

  doc.end();
});

app.listen(5000, () => console.log("Server running on 5000"));
