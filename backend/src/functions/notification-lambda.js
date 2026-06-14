/**
 * notification-lambda.js
 * SQS -> Lambda -> SES.
 */

const { sendRawNotification } = require('../services/email.service');

exports.handler = async (event) => {
  console.log('Notification Lambda invocada');
  console.log('Records recibidos:', event.Records?.length || 0);

  const results = [];

  for (const record of event.Records || []) {
    try {
      const snsWrapper = JSON.parse(record.body);

      let payload;
      try {
        payload = JSON.parse(snsWrapper.Message);
      } catch {
        payload = { message: snsWrapper.Message };
      }

      const { email, subject, message, image } = payload;

      if (!email || !subject || !message) {
        console.warn('Payload incompleto, saltando record');
        results.push({ status: 'skipped' });
        continue;
      }

      const response = await sendRawNotification({
        to: email,
        subject,
        message,
        image: image || null,
      });

      console.log(`Email enviado. MessageId: ${response.MessageId}`);
      results.push({ status: 'sent', email, messageId: response.MessageId });
    } catch (error) {
      console.error('Error procesando record:', error.message);
      results.push({ status: 'error', error: error.message });
    }
  }

  console.log('Resultados:', JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify(results) };
};
