/**
 * notification.controller.js
 * Controlador para publicar mensajes en SNS
 * POST /api/notifications/send
 */

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const sns = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

const sendNotification = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    // Validación
    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Los campos email, subject y message son requeridos',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido',
      });
    }

    const topicArn = process.env.SNS_TOPIC_ARN;
    if (!topicArn) {
      return res.status(500).json({
        success: false,
        message: 'SNS_TOPIC_ARN no configurado',
      });
    }

    // Publicar en SNS
    const payload = JSON.stringify({ email, subject, message });

    const command = new PublishCommand({
      TopicArn: topicArn,
      Message:  payload,
      Subject:  subject,
    });

    const response = await sns.send(command);

    console.log(`✅ Mensaje publicado en SNS. MessageId: ${response.MessageId}`);

    res.status(200).json({
      success:   true,
      message:   'Notificación enviada exitosamente',
      messageId: response.MessageId,
    });

  } catch (error) {
    console.error('Error publicando en SNS:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la notificación',
      error:   process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { sendNotification };
