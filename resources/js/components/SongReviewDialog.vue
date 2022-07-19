<template>
    <v-dialog :value="reviewDialog" @input="closeDialog">
        <v-card min-height="200px">
            <v-btn icon fixed right @click="closeDialog" class="mr-2">
                <v-icon>mdi-close-thick</v-icon>
            </v-btn>
            <v-card-title class="justify-center">Comments</v-card-title>
            <v-card class="mx-3" max-height="500px">
                <v-list>
                    <v-list-item-group>
                        <v-list-item v-for="(review, index) in songReviews" :key="index"
                            v-if="review.file == reviewFilename">
                            <v-list-item-icon>
                                <v-icon v-if="review.rating == '+'">mdi-thumb-up-outline</v-icon>
                                <v-icon v-if="review.rating == '-'">mdi-thumb-down-outline</v-icon>
                                <v-icon v-if="review.rating == '?'">mdi-help</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-subtitle class="text-wrap">{{ review.comments }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-avatar color="red darken-4">
                                <span class="text-area caption">{{ getInitials(review.user ? review.user.name : '')
                                }}</span>
                            </v-list-item-avatar>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-card>
            <v-card-text>
                <div class="text-area">
                    <v-divider></v-divider>
                    <v-textarea outlined label="Comment" clearable clear-icon="mdi-delete"
                        append-icon="mdi-checkbox-marked-circle" color="red darken-4" counter maxlength="500"
                        :rules="[rules.counter]" dense placeholder :value="reviewComment"
                        @input="$emit('update:reviewComment', $event)"
                        @click:append="$emit('submitSongReview', reviewFilename, null, reviewComment || '')">
                    </v-textarea>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            rules: {
                counter: value => (value || "").length <= 500 || "Max 500 characters"
            }
        };
    },
    props: {
        reviewDialog: Boolean,		// two-way data-binding
        reviewComment: String,		// two-way data-binding
        reviewFilename: String,
        songReviews: Array,
    },
    methods: {
        getInitials(fullName) {
            return (fullName || "")
                .split(" ")
                .map(n => n[0])
                .join("");
        },
        closeDialog() {
            this.$emit("update:reviewDialog", false);
        }
    }
};
</script>

<style scoped>
.text-area {
    color: white;
    font-weight: bold;
}
</style>
