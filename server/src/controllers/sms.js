import twilio from "twilio";
import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = twilio(accountSid, authToken);

const router = Router();

export default (io) => {
    //* Get the conversation sms
    router.get('/all-sms', async (req, res) => {
        setInterval(async () => {
            try {
                // const [landzdev, admin] = await Promise.all([
                //     axios.get(`https://www.twilio.com/console/messaging/api/v1/virtual-phone/messages?to=%2B16504259162`, {
                //         auth: {
                //             username: accountSid,
                //             password: authToken
                //         }
                //     }),
                //     axios.get(`https://www.twilio.com/console/sms/logs/api/AC3ae77bfa731dfef8491987b7056abf10/message-logs?accountSid=AC3ae77bfa731dfef8491987b7056abf10&dateSentAfter=2025-01-27T21%3A20%3A59.229Z&from=%2B16504259162&to=%2B18777804236&pageSize=10`, {
                //         auth: {
                //             username: accountSid,
                //             password: authToken
                //         }
                //     }),
                // ]);
                
                // const data = [landzdev, admin];
                // res.json(data);

                const [landzdev, admin] = await Promise.all([
                    axios.get(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                        {
                            auth: {
                                username: accountSid,
                                password: authToken
                            },
                            params: {
                                To: '+19207179654', // Replace with your virtual number
                                PageSize: 10
                            }
                        }
                    ),
                    axios.get(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                        {
                            auth: {
                                username: accountSid,
                                password: authToken
                            },
                            params: {
                                DateSentAfter: '2025-01-27',
                                From: '+19207179654',
                                To: '+18777804236',
                                PageSize: 10
                            }
                        }
                    )
                ]);

                const data1 = landzdev.data.messages.filter((sms) => sms.status == 'received');
                const data2 = admin.data.messages.filter((sms) => sms.status == 'delivered');

                const finalData = [...data1, ...data2];
                const superFinalData = finalData.sort((a, b) => {
                    return new Date(a.date_sent) - new Date(b.date_sent);
                });

                io.emit("allSms", superFinalData)
                
                // res.send(superFinalData);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }, 1000);
    });


    //* Send SMS to my phone
    router.post("/send-sms", async (req, res) => {
        const { from, message, to } = req.body;
        try {
            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_NO,
                to: to,
            });

            console.log("Message sent", response.sid);
            res.status(200).json({ message: "SMS sent successfully" });
        } catch (error) {
            console.error("Error sending SMS:", error);
            res.status(500).json({ message: "Failed to send SMS: " + error.message });
        }
    });


    //* Receive SMS from my phone
    router.post("/sms/reply", (req, res) => {
        const { Body, From } = req.body; // Get sender number and message
        console.log(`Received SMS from ${From}: ${Body}`);

        // Auto-reply to sender
        const twiml = new twilio.twiml.MessagingResponse();
        twiml.message(Body);

        res.type("text/xml").send(twiml.toString()); // Return TwiML response
    });

    return router;
}


