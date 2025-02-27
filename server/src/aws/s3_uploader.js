import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/`,  // Add this line
    forcePathStyle: false, // Ensure virtual-hosted-style URLs
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Generate an 8-character unique ID
const generateUniqueId = () => crypto.randomBytes(4).toString("hex");

const uploadFileToS3 = async (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uniqueFileName = `${generateUniqueId()}-${file.originalname}`; // 8-character filename


    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uniqueFileName}`,  // File path inside S3
        Body: fileStream,
        ContentType: file.mimetype,
    };

    try {
        await s3.send(new PutObjectCommand(params));
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/landz-storage/uploads/${uniqueFileName}`;
    } catch (err) {
        console.error("Error uploading file:", err);
        throw err;
    }
};


export default uploadFileToS3;
