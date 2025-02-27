<template>
    <v-app>
        <v-app-bar v-if="$route.path !== '/login' && store.user" color="blue-grey">
            <v-container class="d-flex align-center">
                <v-toolbar-title>OmniComm Channel App</v-toolbar-title>
                <v-spacer></v-spacer>
                <div>Welcome, {{ store.user?.username }} {{ store.user?.phone_no }}</div>
                <v-btn @click="logout()">
                    <v-icon>mdi-logout</v-icon>
                    <span>Logout</span>
                </v-btn>
            </v-container>
        </v-app-bar>

        <v-navigation-drawer v-if="$route.path !== '/login' && store.user" elevation="6" permanent rail expand-on-hover>
            <v-list nav>
                <v-list-item 
                    v-for="(item, index) in navDrawerItems" :key="index"
                    :to="item.path"
                >
                    <template v-slot:prepend>
                        <v-icon :color="item.color">{{ item.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <v-container class="pt-7">
                <router-view></router-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useMainStore } from './stores/store';

const store = useMainStore();

const navDrawerItems = ref([
    {title: 'Call', icon: 'mdi-phone', color: 'success', path: '/call'},
    {title: 'SMS', icon: 'mdi-message-processing', color: 'red', path: '/sms'},
    {title: 'Email', icon: 'mdi-email', color: 'primary', path: '/email'},
    {title: 'Chat', icon: 'mdi-chat', color: 'warning', path: '/chat'},
]);

const logout = async () => {
    await store.Logout();
    location.reload();
}

</script>

<style scoped></style>