const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({
  region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1',
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'no-reply@example.com';

const cleanBase64 = (value = '') => value.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');

const escapeHeader = (value = '') => String(value).replace(/[\r\n]+/g, ' ').trim();

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function buildRawEmail({ from = FROM_EMAIL, to, subject, message, image }) {
  const boundary = `mixed_${Date.now()}`;
  const altBoundary = `alt_${Date.now()}`;
  const relatedBoundary = `related_${Date.now()}`;
  const hasImage = image && image.data && image.name && image.mimeType;
  const safeSubject = escapeHeader(subject);
  const safeName = escapeHeader(image?.name || 'imagen.jpg');

  const htmlBody = [
    '<html>',
    '<body style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827">',
    `<h2 style="margin:0 0 14px;color:#312E81">${escapeHtml(subject)}</h2>`,
    `<p style="line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p>`,
    hasImage ? '<p style="margin-top:18px"><img src="cid:attached_image" style="max-width:100%;border-radius:10px" alt="imagen adjunta"/></p>' : '',
    '<hr style="border:none;border-top:1px solid #E5E7EB;margin:22px 0"/>',
    '<p style="color:#6B7280;font-size:12px">Enviado desde App Felix - AWS Serverless</p>',
    '</body>',
    '</html>',
  ].join('');

  let mime = '';
  mime += `From: ${from}\r\n`;
  mime += `To: ${escapeHeader(to)}\r\n`;
  mime += `Subject: ${safeSubject}\r\n`;
  mime += 'MIME-Version: 1.0\r\n';

  if (hasImage) {
    mime += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;
    mime += `--${boundary}\r\n`;
    mime += `Content-Type: multipart/related; boundary="${relatedBoundary}"\r\n\r\n`;
    mime += `--${relatedBoundary}\r\n`;
    mime += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;
  } else {
    mime += `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n`;
  }

  mime += `--${altBoundary}\r\n`;
  mime += 'Content-Type: text/plain; charset=UTF-8\r\n\r\n';
  mime += `${message}\r\n\r\n`;

  mime += `--${altBoundary}\r\n`;
  mime += 'Content-Type: text/html; charset=UTF-8\r\n\r\n';
  mime += `${htmlBody}\r\n\r\n`;
  mime += `--${altBoundary}--\r\n`;

  if (hasImage) {
    const b64 = cleanBase64(image.data);
    mime += `\r\n--${relatedBoundary}\r\n`;
    mime += `Content-Type: ${escapeHeader(image.mimeType)}; name="${safeName}"\r\n`;
    mime += 'Content-Transfer-Encoding: base64\r\n';
    mime += 'Content-ID: <attached_image>\r\n';
    mime += `Content-Disposition: inline; filename="${safeName}"\r\n\r\n`;
    mime += b64.match(/.{1,76}/g).join('\r\n');
    mime += `\r\n--${relatedBoundary}--\r\n`;
    mime += `\r\n--${boundary}--\r\n`;
  }

  return mime;
}

async function sendRawNotification({ to, subject, message, image }) {
  const rawEmail = buildRawEmail({
    from: FROM_EMAIL,
    to,
    subject,
    message,
    image,
  });

  const response = await ses.send(new SendRawEmailCommand({
    RawMessage: { Data: Buffer.from(rawEmail) },
  }));

  return response;
}

module.exports = {
  buildRawEmail,
  sendRawNotification,
};
