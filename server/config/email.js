// For demo purposes, simulating email sending with console.log

export const sendEmail = async (to, subject, html) => {
  console.log(`[EMAIL SIMULATION] To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log('---');
  return { messageId: 'simulated-' + Date.now() };
};