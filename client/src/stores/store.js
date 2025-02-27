import { defineStore } from "pinia";
import { computed, ref } from "vue";
import axios from "axios";

export const useMainStore = defineStore('store', () => {
    const verifiedPhoneNumber = ref(import.meta.env.VITE_PHONE_NO);
    const api = ref(import.meta.env.VITE_APP_URL);

    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const userAccout = ref({
        //* LANDZZZ.DEV
        // admin: {
        //     username: 'admin', phone_no: '+18777804236', receiver_user: 'landzdev', receiver: '+16504259162'
        // },
        // landzdev: {
        //     username: 'landzdev', phone_no: '+16504259162', receiver_user: 'admin', receiver: '+18777804236'
        // }

        //* ISAP2018.1368
        admin: {
            username: 'admin', phone_no: '+18777804236', receiver_user: 'landzdev', receiver: '+19207179654'
        },
        landzdev: {
            username: 'landzdev', phone_no: '+19207179654', receiver_user: 'admin', receiver: '+18777804236'
        }
    })

    const Login = async (credential) => {
        if(credential.username === credential.password) {
            if(userAccout.value[credential.username]) {
                user.value = userAccout.value[credential.username];
                localStorage.setItem('user', JSON.stringify(user.value));
                return true;
            } else {
                return { error: "User don't exist" }
            }
        } else {
            return { error: "Username and Password don't match" }
        }
    }

    const Logout = async () => {
        user.value = null;
        localStorage.removeItem('user');
    }
    
    const emailReplyList = ref([]);
    const emailRecipients = computed(() => {
        return emailReplyList.value.map((to) => {
            return to.from.value[0].address
        })
    })
    const getAllInboxReplyEmail = async () => {
        const res = await axios.get(`${api.value}/api/reply-email`);
        emailReplyList.value = res.data;
        return res;
    }

    const chatList = ref([]);
    const getAllChats = async () => {
        const res = await axios.get(`${api.value}/api/chats`);
        chatList.value = res.data;
        return res;
    }

    const smsList = ref([]);
    const getAllSMS = async () => {
        const res = await axios.get(`${api.value}/api/all-sms`);
        smsList.value = res.data
        return smsList.value;
    }
    
    return {
        api,
        verifiedPhoneNumber,
        user,
        Login,
        Logout,
        emailReplyList,
        getAllInboxReplyEmail,
        emailRecipients,
        chatList,
        getAllChats,
        smsList,
        getAllSMS,
    }
})