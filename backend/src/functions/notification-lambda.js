/**
 * notification-lambda.js
 * Lambda de Notificaciones – SQS → Lambda → SES (correo)
 *
 * Flujo:
 *  SQS recibe mensaje desde SNS
 *  → Lambda procesa cada record
 *  → Envía email con AWS SES
 *  → Registra en CloudWatch
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Dirección verificada en SES que actúa como remitente
const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'no-reply@felixcabrera.dev';

exports.handler = async (event) => {
  console.log('📨 Notification Lambda invocada');
  console.log('Records recibidos:', event.Records?.length || 0);

  const results = [];

  for (const record of event.Records) {
    try {
      // SQS recibe el mensaje de SNS envuelto en un JSON
      const snsWrapper = JSON.parse(record.body);

      // El mensaje real viene en snsWrapper.Message (string JSON)
      let payload;
      try {
        payload = JSON.parse(snsWrapper.Message);
      } catch {
        payload = { message: snsWrapper.Message };
      }

      const { email, subject, message } = payload;

      console.log(`📧 Enviando email a: ${email}`);
      console.log(`   Asunto: ${subject}`);

      if (!email || !subject || !message) {
        console.warn('⚠️  Payload incompleto – saltando registro');
        results.push({ status: 'skipped', reason: 'incomplete payload' });
        continue;
      }

      const command = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: message,
              Charset: 'UTF-8',
            },
            Html: {
              Data: `
                <html>
                  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">${subject}</h2>
                    <p style="color: #555; line-height: 1.6;">${message}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px;">
                      Enviado desde App Felix – AWS Serverless
                    </p>
                  </body>
                </html>
              `,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await ses.send(command);
      console.log(`✅ Email enviado. MessageId: ${response.MessageId}`);

      results.push({
        status:    'sent',
        email,
        messageId: response.MessageId,
      });

    } catch (error) {
      console.error('❌ Error procesando record:', error.message);
      results.push({ status: 'error', error: error.message });
      // No lanzamos el error para que SQS no reintente indefinidamente
    }
  }

  console.log('📊 Resultados:', JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify(results) };
};
