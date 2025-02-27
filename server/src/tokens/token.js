import Router from 'express'
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

router.get('/token', (req, res) => {
    const { identity } = req.query;

    if (!identity) {
        return res.status(400).json({ error: "Identity is required" });
    }

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_APP_SID, // Check this in Twilio Console
        incomingAllow: true, // Allow receiving calls
    });

    const token = new AccessToken(
        process.env.TWILIO_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        { identity }
    );

    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt() });
});


export default router;
