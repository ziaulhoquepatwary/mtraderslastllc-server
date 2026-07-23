import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "mzh.mmrahman@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD || "llac ubms yymp nuzt"
    }
});

export const sendOrderConfirmationEmail = async ({ toEmail, userName, orderId, packageTitle, price, deliveryTime, deliveryDate, resourceLink }) => {
    const formattedDate = new Date(deliveryDate).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });

    const mailOptions = {
        from: `"M Traders Last LLC" <mzh.mmrahman@gmail.com>`,
        to: toEmail,
        subject: `🎉 Order Confirmation - #${orderId.toString().slice(-6).toUpperCase()} | M Traders Last LLC`,
        html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #334155;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0891b2 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Order Confirmed!</h1>
              <p style="color: #e0f2fe; margin-top: 8px; font-size: 14px;">We have received your payment and started working on your project.</p>
            </div>

            <!-- Body Content -->
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
                Thank you for choosing <strong>M Traders Last LLC</strong>. Your order has been placed successfully and our team is already reviewing your requirements.
              </p>

              <!-- Order Summary Card -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Order Details</h3>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Order ID:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">#${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Package:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${packageTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Amount Paid:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0891b2;">$${price} USD</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Delivery Time:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;">${deliveryTime} days</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Estimated Delivery:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #2563eb;">${formattedDate}</td>
                  </tr>
                  ${resourceLink ? `
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Resource Link:</td>
                    <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0f172a;"><a href="${resourceLink}" target="_blank" style="color: #2563eb; text-decoration: underline;">View Provided Link</a></td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://mtraderslastllc.com'}/dashboard/orders" 
                   style="background: linear-gradient(135deg, #0891b2 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(8, 145, 178, 0.25);">
                  Track Order in Dashboard →
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 16px;">
                You will receive updates on your dashboard as we progress.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} M Traders Last LLC. All rights reserved.</p>
              <p style="margin: 4px 0 0 0;">St. Petersburg, FL 33702, USA</p>
            </div>

          </div>
        </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};