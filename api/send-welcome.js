const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, tempPassword, youtubeLink } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Nenhum e-mail ou nome fornecido.' });
  }

  try {
    // Configurações do SMTP da HostGator puxadas das Variáveis de Ambiente da Vercel
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.drpauloguimaraesjr.com.br', 
      port: parseInt(process.env.SMTP_PORT) || 465, 
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER, // ex: contato@drpauloguimaraesjr.com.br
        pass: process.env.SMTP_PASS, // a senha real desse e-mail configurada na hostgator
      },
    });

    const firstName = name.split(' ')[0] || 'Colega';

    // O corpo do e-mail com HTML mega atraente
    const mailOptions = {
      from: `"Dr. Paulo Guimarães Jr." <${process.env.SMTP_USER || 'contato@drpauloguimaraesjr.com.br'}>`,
      to: email,
      subject: 'Acesso Liberado: Sua Vaga na Aula Magna e Plataforma!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #2563eb;">Olá, ${firstName}!</h2>
          <p style="font-size: 16px; color: #333;">A sua vaga na nossa aula <strong>Modulação Fisiológica: Prescrição de testosterona, monitoramento, mitos e verdades</strong> está oficialmente garantida.</p>
          
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ef4444;">Aviso Urgente:</h3>
            <p style="margin-bottom: 0; font-size: 15px;">A aula acontece <strong>HOJE, às 19h30min</strong> (Horário de Brasília).</p>
            ${youtubeLink ? `<a href="${youtubeLink}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">📺 Acessar Link do YouTube Agora</a>` : ''}
          </div>

          <h3 style="color: #333; margin-top: 30px;">Seus Dados de Acesso Oficial</h3>
          <p style="font-size: 15px; color: #555;">Nossa plataforma já criou o seu cadastro como aluno. Use as credenciais abaixo para acessar a área do aluno posteriormente:</p>
          <ul style="background-color: #1e293b; color: white; padding: 15px 30px; border-radius: 6px; font-size: 15px; list-style-type: none; margin-left: 0;">
            <li style="margin-bottom: 10px;"><strong>Login/E-mail:</strong> ${email}</li>
            <li><strong>Senha Temporária:</strong> <span style="background-color: #0f172a; padding: 5px 10px; border-radius: 3px; color: #60a5fa; font-weight: bold; font-family: monospace; font-size: 18px;">${tempPassword}</span></li>
            <li style="margin-top: 15px;"><strong>Onde acessar:</strong> <a href="https://hub.drpauloguimaraesjr.com.br" style="color: #60a5fa;">https://hub.drpauloguimaraesjr.com.br</a></li>
          </ul>

          <p style="font-size: 14px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            Se você tiver qualquer dificuldade, certifique-se de salvar este e-mail como favorito. Caso haja algum imprevisto técnico, este é o seu porto seguro.<br>
            A gente se vê na aula!<br><br>
            <strong>Equipe Dr. Paulo Guimarães Jr.</strong>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Mensagem enviada com sucesso: %s', info.messageId);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ error: 'Falha ao enviar e-mail. Verifique credenciais na Vercel.' });
  }
}
