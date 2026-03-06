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

    // --- 1. Header & Branding ---
    doc.fillColor("#2c3e50").fontSize(22).font("Helvetica-Bold").text(data.millName.toUpperCase(), { align: "center" });
    doc.fontSize(10).fillColor("#7f8c8d").text("TIMBER MERCHANTS & SAW MILL", { align: "center" });
    
    doc.moveDown(0.5);
    doc.moveTo(30, doc.y).lineTo(565, doc.y).strokeColor("#ecf0f1").stroke();
    doc.moveDown(0.8);

    // --- 2. Info Section (Left & Right) ---
    const infoY = doc.y;
    doc.fillColor("#2c3e50").fontSize(9).font("Helvetica-Bold").text("MILL DETAILS:", 40, infoY);
    doc.font("Helvetica").fontSize(8.5)
       .text(`GSTIN: ${data.gst || "N/A"}`)
       .text(`Address: ${data.millAddress}`)
       .text(`Date: ${data.date}`);

    doc.font("Helvetica-Bold").fontSize(9).text("OWNER DETAILS:", 350, infoY);
    doc.font("Helvetica").fontSize(8.5)
       .text(`Name: ${data.ownerName}`, 350)
       .text(`Address: ${data.ownerAddress}`, 350)
       .text(`Pickup No: ${data.pickupNumber}`, 350);

    // --- 3. Main Product Heading (Highlighted) ---
    doc.moveDown(2);
  doc.fillColor("#1a252f").fontSize(18).font("Helvetica-Bold")
       .text("AKASHMONI SAWN TIMBER", 30, 165, { align: "center", width: "100%" });
    doc.moveDown(1);
    // --- 4. 2-Column Table Logic ---
    const tableTop = doc.y + 15; // Heading ke just niche start hoga
    const colDiff = 270; 
    const rowHeight = 18;
    const maxRowsPerSide = 25; 

    const drawHeader = (xPos) => {
        doc.rect(xPos, tableTop, 270, 20).fill("#f2f2f2");
        doc.fillColor("#333").font("Helvetica-Bold").fontSize(8);
        doc.text("S.N", xPos + 5, tableTop + 6);
        doc.text("WIDTH", xPos + 30, tableTop + 6);
        doc.text("THICK", xPos + 70, tableTop + 6);
        doc.text("LENGTH", xPos + 115, tableTop + 6);
        doc.text("PCS", xPos + 165, tableTop + 6);
        doc.text("TOTAL CFT", xPos + 205, tableTop + 6);
    };

    drawHeader(40);      
    drawHeader(40 + colDiff); 

    // --- 5. Rendering Rows ---
    doc.font("Helvetica").fontSize(8).fillColor("#444");

    data.rows.forEach((r, i) => {
        const isRightSide = i >= maxRowsPerSide;
        const xOffset = isRightSide ? 40 + colDiff : 40;
        const rowIndex = isRightSide ? i - maxRowsPerSide : i;
        const yPos = tableTop + 20 + (rowIndex * rowHeight);

        // Sub-divider line
        doc.moveTo(xOffset, yPos + rowHeight).lineTo(xOffset + 270, yPos + rowHeight).strokeColor("#eeeeee").lineWidth(0.5).stroke();

        doc.text(i + 1, xOffset + 5, yPos + 5);
        doc.text(r.width, xOffset + 30, yPos + 5);
        doc.text(r.thick, xOffset + 70, yPos + 5);
        doc.text(r.length, xOffset + 115, yPos + 5);
        doc.text(r.piece, xOffset + 165, yPos + 5);
        doc.text(parseFloat(r.total).toFixed(2), xOffset + 205, yPos + 5);
    });

    // --- 6. Summary Section ---
    // Hum summary ko hamesha footer ke thoda upar fix rakhte hain taaki layout clean lage
    const summaryY = 700;
    
    doc.rect(350, summaryY, 205, 50).strokeColor("#2c3e50").lineWidth(1).stroke();
    doc.fillColor("#2c3e50").font("Helvetica-Bold").fontSize(10);
    
    doc.text(`Total Pieces:`, 360, summaryY + 12);
    doc.text(data.totalPieces, 500, summaryY + 12, { align: "right", width: 45 });
    
    doc.text(`Grand Total CFT:`, 360, summaryY + 30);
    doc.fillColor("#d35400").text(parseFloat(data.totalCft).toFixed(2), 500, summaryY + 30, { align: "right", width: 45 });

    // --- 7. Professional Footer ---
    const footerY = 780;
    doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor("#2c3e50").lineWidth(2).stroke();
    doc.fillColor("#2c3e50").fontSize(10).font("Helvetica-Bold").text("AKASHMONI SAWN TIMBER", 40, footerY + 10);
    doc.font("Helvetica").fontSize(9).text("Authorized Signatory", 400, footerY + 10, { align: "right" });

    doc.end();
});

app.listen(5000, () => console.log("Server running on 5000"));