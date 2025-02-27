<template>
    <div>
        <v-container class="pa-16">
            <v-card-text>
                <div class="d-flex justify-space-between">
                    <div>
                        <v-btn @click="inboxEmail = true; composeEmail = false" color="primary">
                            <v-icon>mdi-inbox-arrow-down</v-icon>
                            <span>Inbox</span>
                        </v-btn>
                        <v-btn @click="refresh()" :loading="refreshLoadingButton" color="success" class="ml-3">
                            <v-icon>mdi-refresh</v-icon>
                            <span>Refresh</span>
                        </v-btn>
                    </div>
                    <v-btn @click="composeEmail = true; inboxEmail = false" color="primary">
                        <v-icon>mdi-note-edit</v-icon>
                        <span>Compose</span>
                    </v-btn>
                </div>
            </v-card-text>
            <div v-if="store.emailReplyList.length == 0 && inboxEmail && !composeEmail" class="text-center"> 
                <p v-if="loading">Loading, please wait...</p>
                <p v-else>No email replies</p>
            </div>
            <v-sheet 
                v-if="inboxEmail && !composeEmail"
                v-for="(item, index) in store.emailReplyList" :key="index" 
                elevation="6" 
                rounded="xl" 
                class="pa-4 mb-4"
            >
                <div v-if="store.emailReplyList.length > 0">
                    <p><b style="font-size: large">{{ item.subject }}</b></p>
                    <p class="mt-1"><strong>From: </strong>{{ item.from.text }}</p>
                    <br>
                    <p style="font-size: small" v-html="item.html"></p>
                    <br>
                    <p v-if="item.attachments.length > 0">
                        <b>Attachments: </b>
                        <li 
                            style="font-size: small; margin-top: 8px" 
                            v-for="attachment in item.attachments" :key="attachment.filename"
                        >
                            <a :href="generateDownloadLink(attachment.content)" 
                                :download="attachment.filename">
                                {{ attachment.filename }}
                            </a>
                        </li>
                    </p>
                </div>
            </v-sheet>
            <v-sheet v-else elevation="6" rounded="xl" class="pa-2">
                <v-card-text>
                    <p>Recipient<span class="text-red">*</span></p>
                    <v-text-field
                        clearable
                        v-model="emailObject.to"
                    ></v-text-field>
                    <p>Subject<span class="text-red">*</span></p>
                    <v-text-field
                        clearable
                        v-model="emailObject.subject"
                    ></v-text-field>
                    <p>Message<span class="text-red">*</span></p>
                    <v-textarea
                        clearable
                        placeholder="your message here..."
                        v-model="emailObject.text"
                    ></v-textarea>
                    <p>Attach a file<span class="text-red">*</span></p>
                    <v-file-input
                        chips
                        counter
                        multiple
                        show-size
                        v-model="emailObject.attachments"
                    ></v-file-input>
                    <!-- <input 
                        multiple
                        type="file" 
                        id="fileInput" 
                        name="file-upload"
                        class="file-input"
                        @change="previewFile"
                    > -->
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn @click="sendEmail()" :disabled="sendButton" :loading="sendButtonLoading" class="bg-primary px-6">
                        <v-icon>mdi-send</v-icon>
                        <span>Send</span>
                    </v-btn>
                </v-card-actions>
            </v-sheet>
        </v-container>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useMainStore } from '@/stores/store';

const store = useMainStore();
const loading = ref(false);
const refreshLoadingButton = ref(false);
const inboxEmail = ref(true);
const composeEmail = ref(false);

const emailObject = ref({
    to: '',
    subject: '',
    text: '',
    attachments: []
});

const sendButton = ref(true)
watch(emailObject.value, (val) => {
    if(!!val.to && !!val.text) {
        sendButton.value = false;
    } else {
        sendButton.value = true;
    }
})

const sendButtonLoading = ref(false)
const sendEmail = async () => {
    sendButtonLoading.value = true;
    const formData = new FormData();
    formData.append("to", emailObject.value.to);
    formData.append("subject", emailObject.value.subject);
    formData.append("text", emailObject.value.text);

    emailObject.value.attachments.forEach((attachment) => {
        formData.append("attachments", attachment);
    });

    try {
        const res = await axios.post(`${store.api}/api/send-email`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if(res.status == 200) {
            alert(res.data.message);
            emailObject.value.attachments = [];
            emailObject.value.text = '';
            emailObject.value.subject = '';
        }

    } catch (err) {
        alert(err.response.data.message);
        console.error("Error sending email:", err);
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        sendButtonLoading.value = false;
    }
};

const refresh = async () => {
    refreshLoadingButton.value = true;
    store.emailReplyList = []; 
    const res = await store.getAllInboxReplyEmail();
    if(res == 200) {
        loading.value = false;
        refreshLoadingButton.value = false;
    } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        refreshLoadingButton.value = false;
    }
}

//! ********** Get inbox replies **********
onMounted(async () => {
    loading.value = true;
    if(store.emailReplyList.length == 0) {
        await store.getAllInboxReplyEmail();
        loading.value = false;
    }
})

// Function to create downloadable links
const generateDownloadLink = (content, filename) => {
    // Check if content is a Base64 string
    if (typeof content !== 'string') {
        console.error('Invalid content type:', content);
        return ''; // Return an empty string or handle the error as needed
    }

    // Clean the Base64 string
    const cleanedBase64 = content.replace(/[^A-Za-z0-9+/=]/g, '');
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const blob = new Blob([byteNumbers], { type: 'application/octet-stream' });
    return URL.createObjectURL(blob);
}


</script>

<style lang="css" scoped>
.file-input {
    width: 100%;
    padding: 6px;
    border: 1px solid grey;
    border-radius: 4px;
}
</style>