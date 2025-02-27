<template>
    <div>
        <v-sheet>
            <p class="text-center">{{ store.user?.receiver_user }}</p>
            <v-card-text id="chat" style="height: 600px; overflow-y: auto;">
                <p 
					class="mb-6" 
					:class="item.username == store.user.username ? 'text-right' : ''" 
					v-for="(item, index) in chatList" :key="index"
				>
					<div v-if="item.message">
                        <span v-if="item.username != store.user.username"
                            class="px-4 pa-2 bg-primary"
                            style="
                                border: 1px solid grey;
                                border-radius: 20px;
                            "
                        >
                            {{ item.message }}
                        </span>
						<span v-else
							class="px-4 pa-2"
							style="
								border: 1px solid grey;
								border-radius: 20px;
							"
						>
							{{ item.message }}
						</span>
                        <p style="font-size: 12px; margin-top: 10px; color: grey;">{{ item.created_at }}</p>
					</div>
                    <div v-if="item.attachment">
                        <template v-if="IsImage(item.attachment)">
                            <img 
                                @click="DownloadFile(item.attachment)" 
                                style="cursor: pointer; width: 250px; border-radius: 20px;" 
                                :src="item.attachment" 
                                alt="Attachment"
                            />
                        </template>
                        <template v-else>
                            <a  
                                v-if="item.username == store.user.username"
                                @click="DownloadFile(item.attachment)"
                                rel="noopener noreferrer"
                                class="px-4 pa-2"
                                style="
                                    border: 1px solid grey;
                                    border-radius: 20px;
                                    overflow-wrap: break-word !important;
                                    display: inline-block;
                                    word-break: break-all;
                                    color: blue;
                                    text-decoration: underline;
                                    cursor: pointer;"
                                >
                                <span>{{ FileName(item.attachment) }}</span>
                                <v-icon>mdi-download</v-icon>
                            </a>
                            <a  
                                v-else
                                @click="DownloadFile(item.attachment)"
                                rel="noopener noreferrer"
                                class="px-4 pa-2 bg-primary"
                                style="
                                    border: 1px solid grey;
                                    border-radius: 20px;
                                    overflow-wrap: break-word !important;
                                    display: inline-block;
                                    word-break: break-all;
                                    color: blue;
                                    text-decoration: underline;
                                    cursor: pointer;"
                                >
                                <span>{{ FileName(item.attachment) }}</span>
                                <v-icon>mdi-download</v-icon>
                            </a>
                        </template>
                        <p style="font-size: 12px; color: grey;">{{ item.created_at }}</p>
                        <!-- <a 
                            v-if="item.username == 'landzdev'"
                            @click="DownloadFile(item.attachment)"
                            download
                            rel="noopener noreferrer"
                            class="px-4 pa-2 bg-primary"
                            style="
                                border: 1px solid grey;
                                border-radius: 20px;
                                overflow-wrap: break-word !important;
                                display: inline-block;
                                word-break: break-all;
                                color: blue;
                                text-decoration: underline;
                                cursor: pointer;
                            "
                        >
                            <span class="mr-1">{{ item.attachment }}</span>
                            <v-icon>mdi-download</v-icon>
                        </a>
                        <a 
                            v-else
                            @click="DownloadFile(item.attachment)" 
                            download
                            rel="noopener noreferrer"
                            class="px-4 pa-2"
                            style="
                                border: 1px solid grey;
                                border-radius: 20px;
                                overflow-wrap: break-word !important;
                                display: inline-block;
                                word-break: break-all;
                                color: blue;
                                text-decoration: underline;
                                cursor: pointer;
                            "
                            >
                        </a> -->
                            <!-- <p class="mr-1">{{ FileName(item.attachment) }}</p> -->
                            <!-- <v-icon>mdi-download</v-icon> -->
                    </div>
                </p>
            </v-card-text>  
            <div class="px-2">
                <input @change="previewFile" style="display: none;" id="fileInput" type="file"> 
                {{ chat.file.filename }} {{ chat.file.size }}
            </div>
            <div class="smAndUp align-start justify-end ga-4">
                <v-btn @click="openFileInput()" :block="$vuetify.display.xs" class="px-4" variant="tonal" :loading="sendFileButton">
                    <v-icon>mdi-attachment</v-icon>
                    <span>Send file</span>
                </v-btn>
                <v-textarea
                    clearable
                    hide-details
                    class="align-center"
                    placeholder="Your message here..."
                    v-model="chat.message"
                ></v-textarea>
                <!-- <v-btnicon variant="tonal">
                    <v-icon @click="openFileInput()" >mdi-attachment</v-icon>
                </v-btnicon> -->
                <v-btn @click="sendChat()" :block="$vuetify.display.xs" :disabled="sendButton" class="px-6 bg-primary">
                    <v-icon>mdi-send</v-icon>
                    <span>Send</span>
                </v-btn>
            </div>
        </v-sheet>
    </div>
</template>

<script setup>
import { useMainStore } from '@/stores/store';
import axios from 'axios';
import io from 'socket.io-client';
import { ref, onMounted, watch } from 'vue';
import { DownloadFile, FileName, IsImage } from '@/plugins/file_download'

const store = useMainStore();
const sendButton = ref(true);
const chatList = ref([]);

const chat = ref({
    message: '',
    attachment: '',
    username: '',
    file: {}
});

const socket = io(`${store.api}`, {
    reconnection: true, // Automatically reconnect
    reconnectionAttempts: 10, // Try reconnecting up to 10 times
    reconnectionDelay: 2000 // Wait 2 seconds before retrying
});

const scrollToBottom = () => {
    document.getElementById('chat').scrollTo({ top: 9999 });
}

onMounted(async () => {
	// if(store.chatList == 0) {
		store.getAllChats();
	// };

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected, trying to reconnect...");
    });
    
    socket.on('allChats', (data) => {
        chatList.value = data;
        // console.log(data)
        // console.log('Getting all sms data');
    });

    scrollToBottom();
    await new Promise((resolve) => setTimeout(resolve, 500));
    scrollToBottom();
});

watch(chat.value, (val) => {
    if(!val.message) {
        sendButton.value = true;
    } else {
        sendButton.value = false;
    }
});

const sendFileButton = ref(false);

const openFileInput = () => {
    document.getElementById('fileInput').click();
};

const previewFile = async (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
        const selectedFile = target.files[0];
        chat.value.file = {
            file: target.files[0],
            filename: target.files[0].name,
            size: `(${Math.ceil(target.files[0].size / 1024).toLocaleString()} KB)`
        }

        await sendFile(selectedFile); 
    }
};

const sendFile = async (file) => {
    sendFileButton.value = true;
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await axios.post(`${store.api}/api/upload`, formData);
        sendChat(res.data.url);
    } catch (error) {
        alert(error.response.data.message)
        console.error("File sent failed:", error);
    }
};


const sendChat = async (fileUrl) => {
    chat.value.attachment = fileUrl || '';
    chat.value.username = store.user.username;

    try {
        const res = await axios.post(`${store.api}/api/chats`, chat.value)
        alert(res.data.message);
        chat.value.message = '';
        chat.value.attachment = '';
        chat.value.username = '';
        chat.value.file = {};
        // await store.getAllChats();
        scrollToBottom();
    } catch (err) {
        alert(err.response.data.message)
        console.log('Error sending chat: ', err);
    } finally {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        sendFileButton.value = false;
    }
}

</script>

<style lang="css" scoped>
@media screen and (min-width: 600px) {
    .smAndUp {
        display: flex;
    }
}

@media screen and (max-width: 600px) {
    .smAndUp .v-textarea {
        padding-top: 12px;
        padding-bottom: 12px;
    }
}

</style>