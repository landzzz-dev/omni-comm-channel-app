<template>
    <div class="center">
        <v-sheet class="pa-4" rounded="xl" border="md" elevation="6" width="500px">
            <v-card-title class="text-center">
                <p>Welcome to</p>
                <p>OmniComm Channel App</p>
            </v-card-title>
            <v-card-text class="pt-4">
                <p>Username<span class="text-red">*</span></p>
                <v-text-field
                    clearable
                    prepend-inner-icon="mdi-account"
                    v-model="credential.username"
                ></v-text-field>
                <p>Password<span class="text-red">*</span></p>
                <v-text-field
                    clearable
                    prepend-inner-icon="mdi-key"
                    v-model="credential.password"
                     @keyup.enter="login()"
                ></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="login()" size="large" :disabled="loginButton" block class="bg-primary">
                    <v-icon>mdi-login</v-icon>
                    <span>Login</span>
                </v-btn>
            </v-card-actions>
        </v-sheet>
    </div>
</template>

<script setup>
import { useMainStore } from '@/stores/store';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const store = useMainStore();

const overlay = ref(true);

const credential = ref({
    username: '',
    password: '',
});

const loginButton = ref(true);

watch(credential.value, (val) => {
    if(val.username && val.password) {
        loginButton.value = false;
    } else {
        loginButton.value = true;
    }
})

const login = async () => {
    const data = await store.Login(credential.value);
    if(data?.error) {
        alert(data.error)
    } else {
        await router.push({ path: '/' })
        location.reload();
    }
}

</script>