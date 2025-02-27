<template>
    <div>
        <v-sheet>
            <div class="text-center"> <strong style="font-size: 1.2em;">{{ store.user.receiver_user }} {{ store.user.receiver }}</strong></div>
            <v-card-text id="sms" style="height: 600px; overflow-y: auto;">
                <div 
                    class="mb-6" 
                    :class="item.direction != 'inbound' ? 'text-right' : ''" 
                    v-for="(item, index) in smsList" :key="index"
                >
                    <span v-if="item.direction == 'inbound'"
                        class="px-4 pa-2 bg-primary"
                        style="
                            border: 1px solid grey;
                            border-radius: 20px;
                        "
                    >
                        {{ item.body }}
                    </span>
                    <span v-else
                        class="px-4 pa-2"
                        style="
                            border: 1px solid grey;
                            border-radius: 20px;
                        "
                    >
                        {{ item.body }}
                    </span>
                    <p style="font-size: 12px; margin-top: 10px; color: grey;">{{ item.date_sent }}</p>
                </div>
            </v-card-text>  
            <div class="px-2">
                <input @change="previewFile" style="display: none;" id="fileInput" type="file"> 
                <p class="d-flex align-center">
                    <span>{{ sms.file.filename }} {{ sms.file.size }}</span>
                    <v-icon v-if="sms.file.filename" @click="sms.file = {}" color="error" class="ml-2">mdi-close</v-icon>
                </p>
            </div>
            <v-card-actions class="d-flex align-start justify-end ga-3">
                <!-- <v-icon @click="openFileInput()">mdi-attachment</v-icon> -->
                <v-text-field
                    clearable
                    class="align-center"
                    placeholder="Your message here..."
                    v-model="sms.message"
                ></v-text-field>
                <!-- <v-btnicon variant="tonal">
                    <v-icon @click="openFileInput()" >mdi-attachment</v-icon>
                </v-btnicon> -->
                <v-btn @click="sendSMS()" :loading="sendButtonLoading" :disabled="sendButton" class="px-6 bg-primary">
                    <v-icon>mdi-send</v-icon>
                    <span>Send</span>
                </v-btn>
            </v-card-actions>
        </v-sheet>
    </div>
</template>

<script setup>
import { useMainStore } from '@/stores/store';
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';
import io from 'socket.io-client';

const store = useMainStore();
const socket = io(`${store.api}`, {
    reconnection: true, // Automatically reconnect
    reconnectionAttempts: 10, // Try reconnecting up to 10 times
    reconnectionDelay: 2000 // Wait 2 seconds before retrying
});

const smsList = ref([])

const sms = ref({
    to: '',
    message: '',
    from: '',
    file: {}
});

const scrollToBottom = () => {
    document.getElementById('sms').scrollTo({ top: 9999 });
}

onMounted(async () => {
    // if(store.smsList.length == 0) {
        store.getAllSMS();
    // };

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected, trying to reconnect...");
    });
    
    socket.on('allSms', (data) => {
        smsList.value = data;
        // store.smsList = data;
        // console.log('Getting all sms data');
    });

    scrollToBottom();
    await new Promise((resolve) => setTimeout(resolve, 500));
    scrollToBottom();
})

const sendButton = ref(true);
watch(sms.value, (val) => {
    if(val.message) {
        sendButton.value = false;
    } else {
        sendButton.value = true;
    }
})

const openFileInput = () => {
    document.getElementById('fileInput').click();
};

const previewFile = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
        sms.value.file = {
            file: target.files[0],
            filename: target.files[0].name,
            size: `(${Math.ceil(target.files[0].size / 1024).toLocaleString()} KB)`
        }
    }
};

const sendButtonLoading = ref(false);

const sendSMS = async () => {
    sendButtonLoading.value = true;
    sms.value.to = store.user.receiver;
    sms.value.from = store.user.phone_no;

    try {
        const res = await axios.post(`${store.api}/api/send-sms`, sms.value);
        alert(res.data.message);
        store.getAllSMS();
        sms.value.message = '';
        scrollToBottom();
    } catch (err) {
        alert(err.response.data.message);
        console.error('Error sending sms:', err);
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        sendButtonLoading.value = false;
    }
}

</script>

<style lang="scss" scoped>

</style>