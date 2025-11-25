export const morningReminderTemplate = (customerName, barberName, date, time, services) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Luxe Barber</h1>
      <h2>Appointment Reminder</h2>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>This is a friendly reminder of your upcoming appointment today.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Barber:</strong> ${barberName}</li>
        <li><strong>Services:</strong> ${services.join(', ')}</li>
      </ul>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br>Luxe Barber Team</p>
    </div>
    <div class="footer">
      <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
    </div>
  </div>
</body>
</html>
`;

export const oneHourReminderTemplate = (customerName, barberName, date, time, services) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Luxe Barber</h1>
      <h2>Appointment Reminder - 1 Hour Away</h2>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>Your appointment is just 1 hour away! Here's a reminder:</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Barber:</strong> ${barberName}</li>
        <li><strong>Services:</strong> ${services.join(', ')}</li>
      </ul>
      <p>See you soon!</p>
      <p>Best regards,<br>Luxe Barber Team</p>
    </div>
    <div class="footer">
      <p>If you're running late, please give us a call.</p>
    </div>
  </div>
</body>
</html>
`;