import TheMediaPage from './components/TheMediaPage.vue';

export default {
    mode:'history',

    routes:[
        {
            path: '/',
            component: TheMediaPage
        },
        {
            path: '/filter/:filter',
            component: TheMediaPage
        },
        {
            path: '/path/:path*',
            component: TheMediaPage
        },
    ]
}
