import PDFDocument from 'pdfkit';

/**
 * Generates a clean, professional PDF invoice for an order and streams it to the response
 * @param {Object} order - Order document populated with user details
 * @param {Object} writeStream - Writable stream (e.g., Express res object)
 */
export const generateInvoicePDF = (order, writeStream) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Pipe to response
  doc.pipe(writeStream);

  // --- HEADER SECTION ---
  doc
    .fillColor('#2e7d32') // Green theme color
    .fontSize(20)
    .text('ONLINE GROCERY DELIVERY SYSTEM', { align: 'center' });
  doc
    .fillColor('#333333')
    .fontSize(10)
    .text('E-Store Receipt & Order Details', { align: 'center' });
  doc.moveDown(1.5);

  // Horizontal line divider
  doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#cccccc').stroke();
  doc.moveDown(1);

  // --- INVOICE METADATA ---
  doc.fontSize(12).fillColor('#000000');
  doc.text(`Invoice ID: ${order.orderId}`, { bold: true });
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.moveDown(1);

  // --- CLIENT & SHIPPING DETAILS ---
  const leftColX = 50;
  const rightColX = 300;
  const currentY = doc.y;

  // Customer Details (Left Column)
  doc.text('Customer Details:', leftColX, currentY, { underline: true });
  doc.fontSize(10);
  doc.text(`Name: ${order.userId.name}`, leftColX, doc.y + 5);
  doc.text(`Email: ${order.userId.email}`, leftColX);
  doc.text(`Phone: ${order.userId.phone}`, leftColX);

  // Shipping Address (Right Column)
  doc.fontSize(12);
  doc.text('Shipping Address:', rightColX, currentY, { underline: true });
  doc.fontSize(10);
  doc.text(`Recipient: ${order.shippingAddress.name}`, rightColX, doc.y + 5);
  doc.text(`Phone: ${order.shippingAddress.phone}`, rightColX);
  doc.text(`Address: ${order.shippingAddress.streetAddress}`, rightColX);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, rightColX);
  doc.text(`Country: ${order.shippingAddress.country}`, rightColX);

  doc.moveDown(2);
  doc.fontSize(12);

  // --- ITEMS TABLE SECTION ---
  doc.text('Ordered Items:', 50, doc.y, { underline: true });
  doc.moveDown(0.5);

  let tableTop = doc.y;
  doc.fontSize(10).fillColor('#ffffff');
  
  // Header background block
  doc.rect(50, tableTop, 495, 20).fill('#2e7d32');
  
  // Column titles text
  doc.fillColor('#ffffff');
  doc.text('Product Name', 60, tableTop + 5, { width: 220 });
  doc.text('Qty', 290, tableTop + 5, { width: 40, align: 'center' });
  doc.text('Unit Price', 340, tableTop + 5, { width: 80, align: 'right' });
  doc.text('Subtotal', 430, tableTop + 5, { width: 100, align: 'right' });

  let runningY = tableTop + 20;
  doc.fillColor('#333333');

  order.items.forEach((item, index) => {
    // Alternate row styling
    if (index % 2 === 1) {
      doc.rect(50, runningY, 495, 20).fill('#f9f9f9');
    }
    doc.fillColor('#333333');
    doc.text(item.name, 60, runningY + 5, { width: 220 });
    doc.text(item.quantity.toString(), 290, runningY + 5, { width: 40, align: 'center' });
    doc.text(`Rs. ${item.price.toFixed(2)}`, 340, runningY + 5, { width: 80, align: 'right' });
    doc.text(`Rs. ${item.subtotal.toFixed(2)}`, 430, runningY + 5, { width: 100, align: 'right' });

    runningY += 20;
  });

  doc.moveDown(1.5);
  doc.y = runningY + 10;

  // --- PRICING SUMMARY ---
  const summaryX = 350;
  doc.fontSize(10).fillColor('#333333');
  doc.text(`Subtotal: Rs. ${order.subtotal.toFixed(2)}`, summaryX, doc.y, { align: 'right', width: 180 });
  doc.text(`Discount: - Rs. ${order.discountAmount.toFixed(2)}`, summaryX, doc.y + 15, { align: 'right', width: 180 });
  doc.text(`Delivery Charge: Rs. ${order.deliveryCharges.toFixed(2)}`, summaryX, doc.y + 15, { align: 'right', width: 180 });
  doc.text(`GST (5%): Rs. ${order.taxAmount.toFixed(2)}`, summaryX, doc.y + 15, { align: 'right', width: 180 });
  
  // Double line border for total
  doc.moveTo(350, doc.y + 15).lineTo(530, doc.y + 15).strokeColor('#cccccc').stroke();
  doc.moveDown(0.5);
  
  doc.fontSize(12).fillColor('#2e7d32').text(`Total Amount: Rs. ${order.totalAmount.toFixed(2)}`, summaryX, doc.y + 10, { align: 'right', width: 180, bold: true });

  // --- FOOTER NOTE ---
  doc.moveDown(3);
  doc
    .fontSize(10)
    .fillColor('#777777')
    .text('Thank you for shopping with Online Grocery Delivery!', { align: 'center' });
  doc.text('For support or queries, contact us at support@onlinegrocery.com', { align: 'center' });

  // End and finalize document
  doc.end();
};
