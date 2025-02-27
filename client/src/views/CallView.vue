<!-- <template>
    <div class="center">
        <v-sheet color="blue-grey" border="md" elevation="6" rounded="xl">
            <v-card-text>
                <v-text-field
                    append-inner-icon="mdi-backspace"
                    v-model="callNumber.to"
                    @click:append-inner="clearNumber()"
                ></v-text-field>
                <div class="d-flex ga-4 flex-column div-gap-4">
                    <div>
                        <v-btn @click="dialNumber('1')">1</v-btn>
                        <v-btn @click="dialNumber('2')">2</v-btn>
                        <v-btn @click="dialNumber('3')">3</v-btn>
                    </div>
                    <div>
                        <v-btn @click="dialNumber('4')">4</v-btn>
                        <v-btn @click="dialNumber('5')">5</v-btn>
                        <v-btn @click="dialNumber('6')">6</v-btn>
                    </div>
                    <div>
                        <v-btn @click="dialNumber('7')">7</v-btn>
                        <v-btn @click="dialNumber('8')">8</v-btn>
                        <v-btn @click="dialNumber('9')">9</v-btn>
                    </div>
                    <div>
                        <v-btn @click="dialNumber('*')">*</v-btn>
                        <v-btn @click="dialNumber('0')">0</v-btn>
                        <v-btn @click="dialNumber('#')">#</v-btn>
                    </div>
                    <div>
                        <v-btn @click="dialNumber('+')">+</v-btn>
                        <v-btn @click="sendCallNumber()" class="flex-grow-1" color="success">
                            <v-icon>mdi-phone</v-icon>
                            <span>Call</span>
                        </v-btn>
                    </div>
                </div>
            </v-card-text>
        </v-sheet>

        <v-overlay class="align-center justify-center" persistent v-model="callerDialog">
            <v-sheet class="pa-2" rounded="xl">
                <v-card-text class="text-center pa-10">
                    <p class="text-h6">{{ caller }} {{ answered ? '': 'is calling you...' }}</p>
                    <p v-if="answered">Duration: <span id="timer"></span></p>
                </v-card-text>
                <v-card-actions class="justify-center">
                    <div v-if="answered">
                        <v-btn @click="endCall()" class="bg-error px-10">
                            <v-icon>mdi-phone-hangup</v-icon>
                            <span>End</span>
                        </v-btn>
                    </div>
                    <div v-else class="d-flex ga-3">
                        <v-btn @click="answerCall()" class="bg-success px-6">
                            <v-icon>mdi-phone-incoming</v-icon>
                            <span>Answer</span>
                        </v-btn>
                        <v-btn @click="declineCall()" class="bg-warning px-6">
                            <v-icon>mdi-phone-hangup</v-icon>
                            <span>Decline</span>
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-sheet>
        </v-overlay>
    </div>
</template>

<script setup>
import { useMainStore } from '@/stores/store';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { io } from "socket.io-client";

const store = useMainStore();

const callerDialog = ref(false);
const caller = ref('');
const answered = ref(false);
const duration = ref(0);

const socket = ref(null);

onMounted(() => {
    // Connect to the backend server
    socket.value = io(`${store.api}`); // Remove `/api` from the URL

    // Listen for incoming call events
    socket.value.on("incoming_call", (data) => {
        console.log("Incoming call:", data);
        caller.value = data.from;
        callerDialog.value = true; // Show the call overlay
    });

    // Handle call answers from other users
    socket.value.on("call_answered", (data) => {
        console.log("Call answered by:", data);
        answered.value = true;
    });

    // Handle declined calls
    socket.value.on("call_declined", (data) => {
        console.log("Call declined by:", data);
        callerDialog.value = false;
    });
});

let seconds = 0;
let minutes = 0;
const time = ref('');
let timer;

const startTimer = () => {
    timer = setInterval(() => {
        seconds++;

        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }

        document.getElementById("timer").innerText = `${minutes}m ${seconds}s`;
    }, 1000);
}

const stopTimer = () => {
    clearInterval(timer); // Stop the timer
    timer = null;
}

const callNumber = ref({
    to: ''
});

const clearNumber = () => {
    callNumber.value.to = callNumber.value.to.slice(0, -1);
}

const dialNumber = (number) => {
    callNumber.value.to += number
}

const sendCallNumber = async () => {
    try {
        const res = await axios.post(`${store.api}/api/calls`, callNumber.value);
    } catch (err) {
        alert(err.response.data.message);
        console.error('Error making call:', err);
    }
}

const answerCall = () => {
    if (socket.value) {
        startTimer();
        socket.value.emit("answer_call", { caller: caller.value });
        answered.value = true;
    }
};

const declineCall = () => {
    if (socket.value) {
        socket.value.emit("decline_call", { caller: caller.value });
        callerDialog.value = false;
        answered.value = false;
    }
};

const endCall = () => {
    stopTimer();
    if (socket.value) {
        socket.value.emit("end_call", { caller: caller.value });

        setTimeout(() => {
            answered.value = false;
            callerDialog.value = false;
        }, 2000);
    }
};


</script>

<style scoped>
.div-gap-4 div  {
    display: flex;
    gap: 16px;
    color: black;
}
</style> -->


<template>
    <div class="center">
        <v-sheet color="blue-grey" border="md" elevation="6" rounded="xl">
            <v-card-text>
                <v-text-field
                    density="comfortable"
                    append-inner-icon="mdi-backspace"
                    v-model="callNumber.to"
                    @click:append-inner="clearNumber()"
                ></v-text-field>
                <div class="d-flex ga-3 flex-column div-gap-4">
                    <div class="large">
                        <v-btn size="large" @click="dialNumber('1')">1</v-btn>
                        <v-btn size="large" @click="dialNumber('2')">2</v-btn>
                        <v-btn size="large" @click="dialNumber('3')">3</v-btn>
                    </div>
                    <div>
                        <v-btn size="large" @click="dialNumber('4')">4</v-btn>
                        <v-btn size="large" @click="dialNumber('5')">5</v-btn>
                        <v-btn size="large" @click="dialNumber('6')">6</v-btn>
                    </div>
                    <div>
                        <v-btn size="large" @click="dialNumber('7')">7</v-btn>
                        <v-btn size="large" @click="dialNumber('8')">8</v-btn>
                        <v-btn size="large" @click="dialNumber('9')">9</v-btn>
                    </div>
                    <div>
                        <v-btn size="large" @click="dialNumber('*')">*</v-btn>
                        <v-btn size="large" @click="dialNumber('0')">0</v-btn>
                        <v-btn size="large" @click="dialNumber('#')">#</v-btn>
                    </div>
                    <div>
                        <v-btn size="large" @click="dialNumber('+')">+</v-btn>
                        <v-btn size="large" @click="sendCallNumber()" :disabled="callButton" class="flex-grow-1" color="success">
                            <v-icon>mdi-phone</v-icon>
                            <span>Call</span>
                        </v-btn>
                    </div>
                </div>
            </v-card-text>
        </v-sheet>

        <!-- Incoming Call Dialog -->
        <v-overlay style="backdrop-filter: blur(5px);" class="align-center justify-center" persistent v-model="callerDialog">
            <v-sheet class="pa-2" rounded="xl">
                <div v-if="callType == 'inbound'">
                    <v-card-text class="text-center pa-10">
                        <p>Incoming Call</p>
                        <p class="text-h6"><b>{{ caller }}</b></p>
                        <p v-if="answered">Duration: <span id="timer">0m 0s</span></p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <div v-if="answered" class="d-flex w-100">
                            <v-btn @click="endCall()" color="error" variant="tonal" class="flex-grow-1 px-10">
                                <v-icon>mdi-phone-hangup</v-icon>
                                <span>End</span>
                            </v-btn>
                        </div>
                        <div v-else class="d-flex ga-3 w-100">
                            <v-btn @click="answerCall()" class="bg-success flex-grow-1 px-6">
                                <v-icon>mdi-phone-incoming</v-icon>
                                <span>Answer</span>
                            </v-btn>
                            <v-btn @click="declineCall()" class="bg-warning flex-grow-1 px-6">
                                <v-icon>mdi-phone-hangup</v-icon>
                                <span>Decline</span>
                            </v-btn>
                        </div>
                    </v-card-actions>
                </div>
                <div v-else>
                    <v-card-text class="text-center pa-10">
                        <p>Outgoing Call</p>
                        <p class="text-h6"><b>{{ callNumber.to }}</b></p>
                        <p v-if="answered">Duration: <span id="timer">0m 0s</span></p>
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <div class="d-flex w-100">
                            <v-btn @click="endOutboundCall()" color="error" variant="tonal" class="flex-grow-1 px-10">
                                <v-icon>mdi-phone-hangup</v-icon>
                                <span>End</span>
                            </v-btn>
                        </div>
                    </v-card-actions>
                </div>
            </v-sheet>
        </v-overlay>
    </div>
</template>

<script setup>
import { useMainStore } from '@/stores/store';
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import io from 'socket.io-client'

const store = useMainStore();
const callerDialog = ref(false);
const caller = ref('');
const answered = ref(false);
const callNumber = ref({ to: '' });
const callButton = ref(true);
const callType = ref('');
const callStatus = ref("Waiting...");
const callSid = ref(null);
const socket = io(`${store.api}`);

//* Timer Variables
let seconds = 0;
let minutes = 0;
let timer = null;

//* Start Timer Function
const startTimer = () => {
    timer = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        document.getElementById("timer").innerText = `${minutes}m ${seconds}s`;
    }, 1000);
};

// 📌 Stop Timer Function
const stopTimer = () => {
    clearInterval(timer);
    timer = null;
    seconds = 0;
    minutes = 0;
};

const clearNumber = () => {
    callNumber.value.to = callNumber.value.to.slice(0, -1);
};

const dialNumber = (number) => {
    callNumber.value.to += number;
};


onMounted(async () => {
    await setupTwilio();

    socket.on("callStatus", (data) => {
        console.log("Call Status:", data);
        callStatus.value = `Call ${data.callSid} is now ${data.status}`;

        if (data.status === "in-progress") {
            console.log("Call answered!");
            answered.value = true;
        } else if (["completed", "busy", "canceled", "no-answer", "failed"].includes(data.status)) {
            answered.value = false;
            endCall();
            callerDialog.value = false;
        }
    });

    socket.on("callUpdateStatus", (data) => {
        console.log("Call Status:", data);
        callStatus.value = `Call ${data.callSid} is now ${data.status}`;

        if (data.status === "in-progress") {
            console.log("Call answered!");
            answered.value = true;
        } else if (["completed", "busy", "no-answer", "failed"].includes(data.status)) {
            console.log("Call has been 'completed', 'busy', 'no-answer', 'failed'");
            answered.value = false;
            endCall();
            callerDialog.value = false;
        }
    });

    socket.on("callCancel", (data) => {
        console.log("Call Cancel Status:", data.status);
        callStatus.value = `Call ${data.callSid} is now ${data.status}`;

        if (data.status === "canceled") {
            console.log("Call has been canceled.");
        }
    });
});


watch(callNumber.value, (val) => {
    if(val.to) {
        callButton.value = false;
    } else {
        callButton.value = true;
    }
});


let callStatusChecker;

const trackCallStatus = async (callSid) => {
    try {
        const response = await axios.get(`${store.api}/api/call-status/${callSid}`);
        const status = response.data.status;
        
        console.log("Call status:", status);

        if (status === "in-progress") {
            console.log("Call answered!");
            activeCall.value = true;
        } else if (["completed", "busy", "no-answer", "failed"].includes(status)) {
            console.log("Call ended or not answered.");
            activeCall.value = false;
            callerDialog.value = false;
            clearInterval(callStatusChecker);
        }
    } catch (error) {
        console.error("Error tracking call status:", error.response?.data || error.message);
    }
};

//* Outgoing Call Function
const sendCallNumber = async () => {
    if(store.verifiedPhoneNumber != callNumber.value.to.trim()) {
        alert(callNumber.value.to + ' is not verified mumber.');
        return false;
    }
    
    callType.value = 'outbound';
    callerDialog.value = true;
    startTimer();
    activeCall.value = true;

    try {
        const response = await axios.post(`${store.api}/api/calls`, callNumber.value);
        if (response.data.success) {
            callSid.value = response.data.callSid;
            console.log("Call initiated:", response.data.callSid);
            callStatusChecker = setInterval(() => trackCallStatus(response.data.callSid), 1000);
        } else {
            alert("Call failed:", response.data.message);
            console.error("Call failed:", response.data.message);
        }
    } catch (error) {
        alert("Error making call:", error.response?.data || error.message);
        console.error("Error making call:", error.response?.data || error.message);
    }

    // try {
    //     const res = await axios.post(`${store.api}/api/calls`, callNumber.value);
    //     if(res.data.success) {
    //         answered.value = true
    //     }
    // } catch (err) {
    //     alert(err.response.data.message);
    //     console.error('Error making call:', err);
    // }
};

const activeCall = ref(null);

//* Answer Call Function
const answerCall = () => {
    if (activeCall.value) {
        activeCall.value.accept();
        startTimer();
        answered.value = true;
        console.log("Call accepted");
    }
};

//* Decline Call Function
const declineCall = () => {
    if (activeCall.value) {
        activeCall.value.reject();
        callerDialog.value = false;
        answered.value = false;
        console.log("Call rejected");
    }
};

//* End Call Function
const endCall = () => {
    stopTimer();
    if (activeCall.value) {
        activeCall.value.disconnect();
        console.log("Call ended");
        setTimeout(() => {
            callerDialog.value = false;
            answered.value = false;
        }, 2000)
    }
};

//* End Call Function
const endOutboundCall = () => {
    stopTimer();
    cancelCall();
    console.log("Call ended");
    setTimeout(() => {
        callerDialog.value = false;
        answered.value = false;
    }, 2000);
};

async function setupTwilio() {
    try {
        const response = await fetch(`${store.api}/api/token?identity=browser_user`);
        const { token } = await response.json();

        const device = new Twilio.Device(token, {
            debug: true, 
            allowIncomingWhileBusy: true
        });

        device.on("ready", () => console.log("Twilio Device Ready"));

        device.on("incoming", (connection) => {
            callType.value = 'inbound';
            console.log("Incoming call from:", connection.parameters.From);
            caller.value = connection.parameters.From; 
            activeCall.value = connection;
            callerDialog.value = true;
        });

        device.on("error", (error) => console.error("Twilio Error:", error));
    } catch (error) {
        console.error("Failed to set up Twilio:", error);
    }
}

const cancelCall = async () => {
    if (!callSid.value) return;

    try {
        await axios.put(`${store.api}/api/call-cancel/${callSid.value}`);
        callStatus.value = "Call canceled";
    } catch (error) {
        console.error("Error canceling call:", error);
    }
};

</script>

<style scoped>
.div-gap-4 div  {
    display: flex;
    gap: 16px;
    color: black;
}
</style>
