/**
 * notification-lambda.js
 * SQS → Lambda → SES (con soporte de imagen adjunta)
 */

const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');

const ses        = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'no-reply@example.com';

/**
 * Construye un email MIME multipart con texto, HTML e imagen opcional.
 */
function buildRawEmail({ from, to, subject, message, image }) {
  const boundary      = `boundary_${Date.now()}`;
  const altBoundary   = `alt_${Date.now()}`;
  const hasImage      = image && image.data && image.name && image.mimeType;

  const htmlBody = `
<html>
  <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#0F766E">${subject}</h2>
    <p style="color:#4B5563;line-height:1.6">${message}</p>
    ${hasImage ? `<img src="cid:attached_image" style="max-width:100%;border-radius:8px;margin-top:16px" alt="imagen adjunta"/>` : ''}
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
    <p style="color:#999;font-size:12px">Enviado desde App Felix – AWS Serverless</p>
  </body>
</html>`;

  let mime = '';
  mime += `From: ${from}\r\n`;
  mime += `To: ${to}\r\n`;
  mime += `Subject: ${subject}\r\n`;
  mime += `MIME-Version: 1.0\r\n`;

  if (hasImage) {
    mime += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;
  } else {
    mime += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;
  }

  // Parte texto plano
  mime += `--${altBoundary}\r\n`;
  mime += `Content-Type: text/plain; charset=UTF-8\r\n\r\n`;
  mime += `${message}\r\n\r\n`;

  // Parte HTML
  mime += `--${altBoundary}\r\n`;
  mime += `Content-Type: text/html; charset=UTF-8\r\n\r\n`;
  mime += `${htmlBody}\r\n\r\n`;
  mime += `--${altBoundary}--\r\n`;

  // Imagen adjunta
  if (hasImage) {
    mime += `\r\n--${boundary}\r\n`;
    mime += `Content-Type: ${image.mimeType}\r\n`;
    mime += `Content-Transfer-Encoding: base64\r\n`;
    mime += `Content-ID: <attached_image>\r\n`;
    mime += `Content-Disposition: inline; filename="${image.name}"\r\n\r\n`;
    // Dividir base64 en líneas de 76 chars (estándar MIME)
    const b64 = image.data.replace(/\s/g, '');
    mime += b64.match(/.{1,76}/g).join('\r\n');
    mime += `\r\n\r\n--${boundary}--\r\n`;
  }

  return mime;
}

exports.handler = async (event) => {
  console.log('📨 Notification Lambda invocada');
  console.log('Records recibidos:', event.Records?.length || 0);

  const results = [];

  for (const record of event.Records) {
    try {
      const snsWrapper = JSON.parse(record.body);

      let payload;
      try {
        payload = JSON.parse(snsWrapper.Message);
      } catch {
        payload = { message: snsWrapper.Message };
      }

      const { email, subject, message, image } = payload;

      console.log(`📧 Enviando email a: ${email}`);

      if (!email || !subject || !message) {
        console.warn('⚠️  Payload incompleto – saltando');
        results.push({ status: 'skipped' });
        continue;
      }

      const rawEmail = buildRawEmail({
        from:    FROM_EMAIL,
        to:      email,
        subject,
        message,
        image:   image || null,
      });

      const command = new SendRawEmailCommand({
        RawMessage: { Data: Buffer.from(rawEmail) },
      });

      const response = await ses.send(command);
      console.log(`✅ Email enviado. MessageId: ${response.MessageId}`);

      results.push({ status: 'sent', email, messageId: response.MessageId });

    } catch (error) {
      console.error('❌ Error procesando record:', error.message);
      results.push({ status: 'error', error: error.message });
    }
  }

  console.log('📊 Resultados:', JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify(results) };
};
