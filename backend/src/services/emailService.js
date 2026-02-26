const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

exports.sendPasswordResetEmail = async (to, resetUrl, nome) => {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Recuperação de Senha',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Recuperação de Senha</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background-color: #16a34a; color: #ffffff; padding: 14px 28px;
                    text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #555; font-size: 14px;">
          Este link é válido por <strong>1 hora</strong>. Se você não solicitou a recuperação de senha, ignore este e-mail.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br/>
          <a href="${resetUrl}" style="color: #16a34a;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
};
