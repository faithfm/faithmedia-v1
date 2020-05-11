import Player from './components/Player.vue';

export default {
    mode:'history',
    
    routes:[
        {
            path: '/',
            component: Player
        },
        {
            path: '/filter/:filter',
            component: Player
        },
        {
            path: '/path/:path*',
            component: Player
        },
    ]
}
