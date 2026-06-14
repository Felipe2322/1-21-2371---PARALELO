/**
 * notification.controller.js
 * Publica correos simples en SNS y envia correos con imagen directo por SES.
 */

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { sendRawNotification } = require('../services/email.service');

const sns = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const MAX_IMAGE_BASE64_BYTES = 7 * 1024 * 1024;

const sendNotification = async (req, res) => {
  try {
    const { email, subject, message, image } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Los campos email, subject y message son requeridos',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es valido',
      });
    }

    if (image?.data) {
      const imageBytes = Buffer.byteLength(image.data, 'base64');
      if (imageBytes > MAX_IMAGE_BASE64_BYTES) {
        return res.status(413).json({
          success: false,
          message: 'La imagen es muy grande. Usa una imagen menor a 7MB.',
        });
      }

      const response = await sendRawNotification({
        to: email,
        subject,
        message,
        image,
      });

      console.log(`Email con imagen enviado por SES. MessageId: ${response.MessageId}`);

      return res.status(200).json({
        success: true,
        message: 'Notificacion enviada exitosamente',
        messageId: response.MessageId,
        transport: 'ses',
      });
    }

    const topicArn = process.env.SNS_TOPIC_ARN;
    if (!topicArn) {
      return res.status(500).json({
        success: false,
        message: 'SNS_TOPIC_ARN no configurado',
      });
    }

    const payload = JSON.stringify({ email, subject, message, image: null });
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: payload,
      Subject: subject,
    });

    const response = await sns.send(command);
    console.log(`Mensaje publicado en SNS. MessageId: ${response.MessageId}`);

    return res.status(200).json({
      success: true,
      message: 'Notificacion enviada exitosamente',
      messageId: response.MessageId,
      transport: 'sns',
    });
  } catch (error) {
    console.error('Error enviando notificacion:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar la notificacion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { sendNotification };
