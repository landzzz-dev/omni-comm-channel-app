import twilio from 'twilio';
import { Router } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const phoneNumber = process.env.TWILIO_NO;
const client = twilio(accountSid, authToken);


//! *********** HANDLE INCOMING CALLS ***********
const VoiceResponse = twilio.twiml.VoiceResponse;

export default (io) => {
    router.post('/voice', (req, res) => {
        const response = new VoiceResponse();
        const dial = response.dial({
            callerId: req.body.From || "+18777804236"
        });

        // Ensure it routes to the correct browser user
        dial.client("browser_user");
        
        res.set("Content-Type", "text/xml");
        res.send(response.toString());
    });


    //! *********** MAKE OUTBOUND CALLS ***********
    router.post('/calls', async (req, res) => {
        const { to } = req.body;

        // try {
        //     const call = await client.calls.create({
        //         from: phoneNumber,
        //         to,
        //         twiml: `<Response><Say>Connecting your call...</Say><Dial>${to}</Dial></Response>`,
        //     });

        //     res.json({ success: true, callSid: call.sid });
        // } catch (error) {
        //     res.status(500).json({ message: error.message });
        // }

        try {
            const twiml = new VoiceResponse();
            twiml.say("Connecting your call...");
            twiml.dial(to);

            const call = await client.calls.create({
                from: phoneNumber,  // Your Twilio number (must be verified)
                to,
                twiml: twiml.toString(),
            });

            res.json({ success: true, callSid: call.sid });
        } catch (error) {
            console.error("Twilio Call Error:", error);
            res.status(500).json({ message: error.message });
        }
    });


    //* Status of Ongoing Call
    router.get('/call-status', async (req, res) => {
        const { callSid } = req.params;

        try {
            const call = await client.calls(callSid).fetch();

            io.emit("callStatus", { callSid: callSid, status: call.status });

            res.json({ success: true, status: call.status });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    //* Status of Outbound Call
    router.get('/call-status/:callSid', async (req, res) => {
        const { callSid } = req.params;

        try {
            const call = await client.calls(callSid).fetch();

            io.emit("callUpdateStatus", { callSid: callSid, status: call.status });

            res.json({ success: true, status: call.status });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    //* Cancel an Ongoing Call
    router.put("/call-cancel/:callSid", async (req, res) => {
        const { callSid } = req.params;

        try {
            await client.calls(callSid).update({ status: "canceled" });

            // Emit real-time update to the frontend
            io.emit("callCancel", { callSid: callSid, status: "canceled" });

            res.json({ success: true, message: "Call canceled successfully." });
        } catch (error) {
            res.status(500).json({ message: "Error canceling call: " + error.message });
        }
    });

    return router;
}