import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/call',
            name: 'Call',
            component: () => import('@/views/CallView.vue')
        },
        {
            path: '/sms',
            name: 'SMS',
            component: () => import('@/views/SmsView.vue')
        },
        {
            path: '/email',
            name: 'Email',
            component: () => import('@/views/EmailView.vue')
        },
        {
            path: '/chat',
            name: 'Chat',
            component: () => import('@/views/ChatView.vue')
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/auth/LoginView.vue')
        },
    ]
});

router.beforeEach((to, from, next) => {
    const isLogged = JSON.parse(localStorage.getItem('user')) || false;

    if (!isLogged && to.path !== '/login') {
        next('/login'); // Redirect unauthenticated users to login
    } else if (isLogged && to.path === '/login') {
        next('/'); // Redirect authenticated users away from login
    } else {
        next(); // Allow navigation
    }
});

export default router;
