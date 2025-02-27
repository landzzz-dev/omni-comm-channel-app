import { Router } from "express";
import multer from "multer";
import dotenv from 'dotenv';
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from 'url';
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";

dotenv.config();

const router = Router();

// // Get the directory name
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Create an 'uploads' directory if it doesn't exist
// const uploadDir = path.join(__dirname, '../../uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir); // Save files to the 'uploads' directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname); // Use the original file name
//     }
// });

const storage = multer.memoryStorage();
const upload = multer({ storage }); 

router.post('/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully' });
});


router.post('/send-email', upload.single('file'), async (req, res) => {
    const { to, subject, text } = req.body;
    const file = req.file

    const mailerSend = new MailerSend({ apiKey: process.env.API_KEY });
    const sentFrom = new Sender(process.env.SMTP_USER, 'Rolando Villanueva');
    const recipients = [ new Recipient(to) ];
    // const filePath = `${uploadDir}/${filename}` 
    const attachment = new Attachment(
        file.buffer.toString('base64'), // Convert buffer to base64
        file.originalname,
        'attachment'
    );
    

    try {
        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setAttachments(attachment) // Wrap in an array
            .setSubject(subject)
            .setHtml(text)
            .setText(text); // Uncomment if you want to send plain text as well

        await mailerSend.email.send(emailParams);
        res.status(200).json({ message: `Email sent successfully to ${to}` });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email.' });
        console.log('Error sending email:', error);
    }
});

export default router;