<template>
    <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="md:flex-shrink-0">
            <!-- <img :src="`/error-images/${status}.png`" alt="Error Image" class="h-64 w-64 mx-auto" /> -->
            <img :src="`/error-images/${status}.png`" alt="Error Image"
                class="h-64 w-64 mx-auto" />
        </div>
        <div class="mt-4 md:mt-0 md:ml-12 max-w-md w-full space-y-8">
            <div class="text-center md:text-left">
                <h2 class="text-2xl font-extrabold text-gray-900" @click="exceptionMessageVisible = true">
                    {{ title }}
                </h2>
                <p class="mt-2 text-lg text-gray-600 whitespace-pre-line" @click="exceptionMessageVisible = true">
                    {{ description }}
                </p>
                <p class="mt-2 text-med italic text-gray-600" v-if="exceptionMessageVisible">
                    {{ exceptionMessage }}
                </p>
            </div>
            <div class="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
                <button @click="goBack"
                    class="basis-1/3 justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Go back
                </button>
                <button @click="login"
                    v-if="loginButtonVisible"
                    class="basis-1/3 justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Login
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// Define props
const props = defineProps({
    status: Number,
    exceptionMessage: String,
});

const exceptionMessageVisible = ref(false);

const statusMessages = {
    401: {
        title: '401: Not Logged In',
        description: "Whoa there, wanderer! Are you part of this flock? I can't seem to match you with any ear tag in our pasture. \n\n If you’re a new lamb around here, let's get you registered and tagged, so you can join the herd. \n\n If you've just misplaced your tag, no problem – just log in so I can recognize you, and you'll be grazing with the rest of us in no time! 🐑",
    },
    403: {
        title: '403: Forbidden',
        description: "Baa-d news, friend! Looks like you're trying to graze in a restricted field. Let me just check your ear tag... \n Hmm, no access for you just yet. This meadow is for the flock with the right clearance. \n If you think this is a mistake, better bleat to the shepherd for assistance - he knows how to herd you through the right gate!",
    },
    404: {
        title: '404: Page Not Found',
        description: "Oh, ewe seem to have wandered off the path! This part of the pasture doesn't have what you're looking for. \n\n Maybe the page was herded to another location, or perhaps it never existed. No need to feel sheepish though, it happens to the best of us. \n\n Let's trot back and consult the shepherd, or try navigating back to the barn. Stay wooly, my friend!",
    },
    500: {
        title: '500: Server Error',
        description: "Baaa-d news! It looks like our sheep are all in a jumble and the shepherd's a bit flustered. We're facing some unexpected problems behind the barn door. \n\n Feel free to graze around the edges, come back later, or have a chat with the sheperd.  🐑",
    },
    503: {
        title: '503: Service Unavailable',
        description: "Hold your hooves! Our pasture is currently undergoing a bit of herd management – seems like the shepherd is corralling us for a headcount or some much-needed pasture maintenance.  \n\n But don’t fret, there will be plenty of grazing to be had once the fields are open again! 🐑",
    },
};

const title = computed(() => statusMessages[props.status]?.title || '');
const description = computed(() => statusMessages[props.status]?.description || '');
const loginButtonVisible = computed(() => props.status === 401);

const goBack = () => {
    window.history.back();
};

const login = () => {
    window.location.href = '/login';
};

</script>
