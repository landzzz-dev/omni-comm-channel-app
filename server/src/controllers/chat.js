import { Router } from "express";
import admin from "firebase-admin";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import uploadFileToS3 from "../aws/s3_uploader.js";
import { getStorage } from "firebase-admin/storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { asg } from '../database/my_sql.js';
import dotenv from 'dotenv';
dotenv.config();

// Fix "__dirname" issue in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

// Initialize Firebase Admin SDK
import serviceAccount from "../../firebase-key.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "my-storage-6173e.firebasestorage.app"
});


const bucket = getStorage().bucket();

// Multer: Temporary upload folder
const upload = multer({ dest: "uploads/" });

export default (io) => {
    router.post("/upload", upload.single("file"), async (req, res) => {
        try {
            const fileUrl = await uploadFileToS3(req.file);
            res.json({ url: fileUrl });
        } catch (err) {
            res.status(500).json({ message: "Failed to upload file" });
        }
    });
    

    // // Upload file to Firebase Storage
    // router.post("/upload", upload.single("file"), async (req, res) => {
    //     if (!req.file) return res.status(400).send("No file uploaded");

    //     const filePath = req.file.path;
    //     const fileName = `${Date.now()}${path.extname(req.file.originalname)}`;
    //     const fileUpload = bucket.file(fileName);

    //     try {
    //         await fileUpload.save(fs.readFileSync(filePath), {
    //             metadata: { contentType: req.file.mimetype }
    //         });

    //         await fileUpload.makePublic();
    //         const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    //         fs.unlinkSync(filePath); // Delete temp file
    //         res.json({ url: fileUrl });
    //     } catch (error) {
    //         res.status(500).json({ message: error.message });
    //     }
    // });


    //* Get all chats
    router.get('/chats', async (req, res) => {
        setInterval(async () => {
            try {
                const [data] = await asg.query(
                    `SELECT chats.*, message, attachment FROM chats
                    LEFT JOIN messages
                    ON chats.username = messages.username
                    ORDER BY messages.created_at ASC
                    `
                );
                
                io.emit('allChats', data);
                // res.status(200).json(data);
            } catch (err) {
                console.error('Error fetching messages record:', err);
                res.status(500).json({ error: err.sqlMessage });
            }
        }, 1000)
    });


    //* Send chat
    router.post('/chats', async (req, res) => {
        const { message, username, attachment } = req.body;
        const now = new Date();

        try {
            const sql = `
                INSERT INTO messages (username, message, attachment, created_at, updated_at, deleted_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const values = [username, message, attachment, now, now, null];
            await asg.query(sql, values);

            res.status(200).json({ message: 'Message sent' });
        } catch (err) {
            console.error('Error inserting message:', err);
            res.status(500).json({ message: err.message });
        }
    });
    return router;
}