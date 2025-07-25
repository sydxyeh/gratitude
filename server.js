require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'set' : 'not set');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/send', (req, res) => {
  const { recipientEmail, senderName, noteText, noteId } = req.body;
  const noteLink = `https://yourdomain.com/gratitude-app/note/${noteId}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: recipientEmail,
    subject: `You've received a note of gratitude from ${senderName}`,
    html: `
      <p>${senderName} wrote you a note of gratitude:</p>
      <blockquote>${noteText}</blockquote>
      <p>View your note online: <a href="${noteLink}">${noteLink}</a></p>
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      res.status(500).send('Failed to send email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Note sent!');
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});