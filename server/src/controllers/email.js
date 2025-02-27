import { Router } from "express";
import nodemailer from 'nodemailer';
import multer from "multer";
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage }); 

// Use upload.single for single data, upload.array for multiple // Allow up to 10 files
router.post('/send-email', upload.array("attachments", 10), async (req, res) => {
    const { to, subject, text } = req.body;
    const files = req.files;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        },
    });

    const mailOptions = {
        from: `Landz Dev <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        attachments: [],
    };

    // Include attachments if files are uploaded
    if (files && files.length > 0) {
        files.forEach((file) => {
            mailOptions.attachments.push({
                filename: file.originalname,
                content: file.buffer.toString('base64')
            });
        });
    }

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: `Email sent successfully to ${to}` });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email: ' + error });
        console.log('Error sending email: ' + error);
    }
});



// Get email inbox reply
router.get('/reply-email', (req, res) => {
    const { to } = req.query;
    const imap = new Imap({
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false // Allow self-signed certificates
        }
    });

    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', () => {
        openInbox((err, box) => {
            if (err) throw err;

            imap.search(['ALL'], (err, results) => {
                if (err) throw err;
                if (results.length === 0) {
                    console.log('No new replies');
                    return res.status(200).json([]);
                }

                const emails = [];
                let processedCount = 0; // Counter to track parsed emails
                const totalEmails = results.length; // Total number of emails to process

                const f = imap.fetch(results, { bodies: '' });

                f.on('message', (msg, seqno) => {
                    msg.on('body', (stream, info) => {
                        simpleParser(stream, (err, mail) => {
                            if (err) throw err;

                            // Check if the email is a reply
                            if (mail.references && mail.references.length > 0) {
                                const attachments = mail.attachments.map((file) => ({
                                    filename: file.filename,
                                    content: file.content.toString('base64'),
                                    mimetype: file.contentType
                                }));

                                emails.push({
                                    subject: mail.subject,
                                    from: mail.from,
                                    to: mail.to.text,
                                    date: mail.date,
                                    references: mail.references,
                                    text: mail.text,
                                    html: mail.html,
                                    attachments: attachments
                                });
                            }

                            processedCount++; // Increment processed count

                            // Send response only after all emails are processed
                            if (processedCount === totalEmails) {
                                console.log('All replies fetched successfully.');
                                res.status(200).json(emails);
                                imap.end();
                            }
                        });
                    });
                });

                f.once('end', () => {
                    console.log(emails);
                    
                    console.log('Finished fetching emails.');
                });
            });
        });
    });

    imap.connect();
});


export default router;