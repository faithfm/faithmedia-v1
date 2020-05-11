<template>
	<v-dialog 
		:value="downloadDialog" 
		@input="closeDialog"
		max-width="500" overlay-opacity="0.1"
	>
		<v-card>
			<v-card-title class="headline justify-content-center">Download</v-card-title>
			<v-card-actions class="justify-center">
				<v-chip-group column>
					<v-chip
						class="my-1"
						color="red darken-2"
						outlined
						:href="oggDownloadUrl"
						download
						@click="closeDialog"
					>OGG master</v-chip>
					<v-chip
						class="my-1"
						color="red darken-2"
						outlined
						:href="mp3DownloadUrl"
						download
						@click="closeDialog"
					>MP3 low-quality</v-chip>
					<v-chip
						class="my-1"
						color="red darken-2"
						outlined
						:href="origDownloadUrl"
						download
						@click="closeDialog"
					>MP3 original</v-chip>
				</v-chip-group>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
 
<script>
import { oggUrl, mp3Url, origUrl } from "../DbContentUrls";

export default {
	data() {
		return {
		};
	},
	props: {
		downloadDialog: Boolean,
		downloadFilename: String,
	},
	computed: {
		oggDownloadUrl() {
			return oggUrl(this.downloadFilename, this.$config);
		},
		mp3DownloadUrl() {
			return mp3Url(this.downloadFilename, this.$config);
		},
		origDownloadUrl() {
			return origUrl(this.downloadFilename, this.$config);
		},
	},
	methods: {
    closeDialog() {
      this.$emit("update:downloadDialog", false);
    }
	}
};
</script>

<style scoped>

</style>