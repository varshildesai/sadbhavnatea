import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Example: "+14155238886"

const client = (accountSid && authToken && twilioNumber) ? twilio(accountSid, authToken) : null;

export const sendWhatsAppNotification = async (order) => {
  const statusMap = {
    'Placed': { subject: 'Order Received', textBody: 'We have received your order and are currently processing it.' },
    'Confirmed': { subject: 'Order Confirmed', textBody: 'Good news! Your order has been confirmed and we are preparing your items.' },
    'Packed': { subject: 'Order Packed', textBody: 'Your order has been securely packed and is awaiting courier pickup.' },
    'Shipped': { subject: 'Order Shipped', textBody: 'Your order has shipped!' },
    'Out for Delivery': { subject: 'Out for Delivery', textBody: 'Your package is out for delivery today. Keep an eye out!' },
    'Delivered': { subject: 'Delivered', textBody: 'Your package has been successfully delivered. Enjoy!' },
    'Cancelled': { subject: 'Cancelled', textBody: 'Your order has been cancelled.' },
  };

  const statusInfo = statusMap[order.orderStatus || 'Placed'];

  let customerPhone = order.userDetails?.phone || order.user?.phone || order.shippingAddress?.phone || '';

  // Extract digits
  let formattedPhone = customerPhone.replace(/\D/g, '');
  
  // Quick format assuming Indian context if they only provided 10 digits
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  // If no Twilio keys, just log to the console (developer mode fallback)
  if (!client) {
    console.log('\n===========================================');
    console.log('[MOCK WHATSAPP MESSAGE (API Keys Missing)]');
    console.log(`To: whatsapp:+${formattedPhone}`);
    console.log(`Body: *Sadbhavna Tea Update*\nHello ${order.userDetails?.name || order.user?.name || 'Customer'},\n${statusInfo.textBody}\n\nTotal: ₹${order.totalPrice}`);
    console.log('===========================================\n');
    return true;
  }

  try {
    if (!formattedPhone) {
      console.log('❌ WhatsApp Skipped: No valid phone number provided.');
      return false;
    }

    const message = await client.messages.create({
      body: `*Sadbhavna Tea Update*\n\nHello ${order.userDetails?.name || order.user?.name || 'Customer'},\n${statusInfo.textBody}\n\nTotal: ₹${order.totalPrice}`,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:+${formattedPhone}`
    });

    console.log(`✅ WhatsApp sent for Order #${order._id} (${order.orderStatus})`, message.sid);
    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return false;
  }
};
