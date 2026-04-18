import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter object using SMTP transport
// You can supply these in the .env file.
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Optional: change to mailgun/brevo/sendgrid host if needed
    auth: {
      user: process.env.EMAIL_USER || 'test@example.com',
      pass: process.env.EMAIL_PASS || 'password',
    },
  });
};

export const sendStatusEmail = async (order) => {
  // If no credentials, just log
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL MOCK] Email system requires EMAIL_USER and EMAIL_PASS. Skipping actual send for order #${order._id}`);
    console.log(`[EMAIL MOCK] Subject would be: Your order is ${order.orderStatus.toLowerCase()}`);
    return false;
  }

  const transporter = getTransporter();

  const statusMap = {
    'Placed': { subject: 'Your order has been received', textBody: 'We have received your order and are currently processing it.' },
    'Confirmed': { subject: 'Your order is confirmed', textBody: 'Good news! Your order has been confirmed and we are preparing your items.' },
    'Packed': { subject: 'Your order has been packed', textBody: 'Your order has been securely packed and is awaiting courier pickup.' },
    'Shipped': { subject: 'Your order is on the way', textBody: 'Your order has shipped!' },
    'Out for Delivery': { subject: 'Your order is out for delivery', textBody: 'Your package is out for delivery today. Keep an eye out!' },
    'Delivered': { subject: 'Your order has been delivered', textBody: 'Your package has been successfully delivered. Enjoy!' },
    'Cancelled': { subject: 'Your order has been cancelled', textBody: 'Your order has been cancelled as per your request or due to an issue.' },
  };

  const statusInfo = statusMap[order.orderStatus] || { subject: `Order Update: ${order.orderStatus}`, textBody: `Your order status is now ${order.orderStatus}` };

  let trackingHtml = '';
  if (order.trackingId && (order.orderStatus === 'Shipped' || order.orderStatus === 'Out for Delivery')) {
    trackingHtml = `
      <div style="margin-top: 20px; padding: 15px; background: #fdfbf7; border-left: 4px solid #e67300;">
        <h3 style="margin-top: 0; color: #007a33;">Tracking Details</h3>
        <p><strong>Courier:</strong> ${order.courierCompany || 'Standard Shipping'}</p>
        <p><strong>Tracking ID:</strong> <span style="font-family: monospace; font-size: 1.1em; color: #333;">${order.trackingId}</span></p>
      </div>
    `;
  }

  const productList = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}x ${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-w-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #007a33; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Sadbhavna Tea</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #333;">Hello ${(order.userDetails?.name || order.user?.name || 'Customer').split(' ')[0]},</h2>
        <p style="font-size: 16px;">${statusInfo.textBody}</p>
        
        ${trackingHtml}

        <h3 style="border-bottom: 2px solid #e67300; padding-bottom: 5px; margin-top: 30px;">Order Summary & Invoice (#${order._id.toString().slice(-8)})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          ${productList}
          <tr>
            <td style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
            <td style="padding: 10px; font-weight: bold; text-align: right; color: #007a33;">₹${order.totalPrice}</td>
          </tr>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.CLIENT_URL || 'https://sadbhavnatea.vercel.app'}/invoice/${order._id}" style="background-color: #007a33; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download Full Invoice PDF</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">Thank you for shopping with us!</p>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Sadbhavna Tea" <${process.env.EMAIL_USER}>`,
      to: order.userDetails?.email || order.user?.email || order.shippingAddress?.email, // Fallback if order user structure varies
      subject: statusInfo.subject,
      text: `Hello ${order.userDetails?.name || order.user?.name || 'Customer'},\n\n${statusInfo.textBody}\nTotal: ₹${order.totalPrice}\n\nThank you for shopping with us.`,
      html: htmlContent,
    });
    console.log(`✅ Email sent for Order #${order._id} (${order.orderStatus})`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
