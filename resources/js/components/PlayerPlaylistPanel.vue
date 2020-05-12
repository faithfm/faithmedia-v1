<template>
	<v-skeleton-loader :loading="isLoading" type="list-item-two-line@50">
		<v-card :class="{playlist}">
			<v-list>
				<v-list-item-group>
					<v-list-item
						two-line
						v-for="(track, index) in playlist"
						:key="track.file"
						:class="[{selected: track.file === selectedTrackFile}, {playing: track.file === indexFile}, {bg: track.file !== indexFile}]"
						class="my-1"
					>
						<v-list-item-content @click="selectTrack(track.file)" @dblclick="playTrack(track.file)">
							<v-list-item-title>{{ index | numbers}} {{ track.content }} - {{ track.guests }}</v-list-item-title>
							<v-list-item-subtitle
								v-show="$route.params.filter != 'music-pending'"
								class="text--primary"
							>{{ track.file }} - {{ track.tags }}</v-list-item-subtitle>
							<v-chip-group v-show="$route.params.filter == 'music-pending'" class="text--primary">
								<v-chip
									small
									class="mb-n1"
									@click="submitSongReview(track.file, '+')"
									:class="{myRatings: getRating(track.file, 'myRating') == '+'}"
								>
									<v-avatar left>
										<v-icon x-small>mdi-thumb-up-outline</v-icon>
									</v-avatar>
									{{ getRating(track.file, '+') }}
								</v-chip>
								<v-chip
									small
									class="mb-n1"
									@click="submitSongReview(track.file, '-')"
									:class="{myRatings: getRating(track.file, 'myRating') == '-'}"
								>
									<v-avatar left>
										<v-icon x-small>mdi-thumb-down-outline</v-icon>
									</v-avatar>
									{{ getRating(track.file, '-') }}
								</v-chip>
								<v-chip
									small
									class="mb-n1"
									@click="submitSongReview(track.file, '?')"
									:class="{myRatings: getRating(track.file, 'myRating') == '?'}"
								>
									<v-avatar left>
										<v-icon x-small>mdi-help</v-icon>
									</v-avatar>
									{{ getRating(track.file, '?') }}
								</v-chip>
							</v-chip-group>
							<v-chip-group v-show="$route.params.filter == 'music-pending'" class="text--primary">
								<v-chip
									small
									class="mb-n1"
									@click="reviewFilename=track.file; reviewComment = getRating(reviewFilename, 'myComment') || ''; reviewDialog=true"
									:class="{myRatings: getRating(track.file, 'myComment')}"
								>
									<v-avatar left>
										<v-icon x-small>mdi-comment-outline</v-icon>
									</v-avatar>
									{{ getRating(track.file, 'comments') }}
								</v-chip>
							</v-chip-group>
						</v-list-item-content>
						<v-list-item-action>
							<v-btn icon @click.stop="downloadFilename=track.file; downloadDialog=true">
								<v-icon color="black">mdi-cloud-download-outline</v-icon>
							</v-btn>
						</v-list-item-action>
					</v-list-item>
				</v-list-item-group>
			</v-list>
			<DownloadDialog
				:downloadDialog.sync = "downloadDialog"
				:downloadFilename = "downloadFilename"
			></DownloadDialog>
			<v-dialog v-model="reviewDialog">
				<v-card min-height="200px">
					<v-btn icon fixed right @click="reviewDialog=false" class="mr-2">
						<v-icon>mdi-close-thick</v-icon>
					</v-btn>
					<v-card-title class="justify-center">Comments</v-card-title>
					<v-card class="mx-3" max-height="500px">
						<v-list>
							<v-list-item-group>
								<v-list-item
									v-for="(review, index) in songReviews"
									:key="index"
									v-if="review.file==reviewFilename"
								>
									<v-list-item-icon>
										<v-icon v-if="review.rating=='+'">mdi-thumb-up-outline</v-icon>
										<v-icon v-if="review.rating=='-'">mdi-thumb-down-outline</v-icon>
										<v-icon v-if="review.rating=='?'">mdi-help</v-icon>
									</v-list-item-icon>
									<v-list-item-content>
										<v-list-item-subtitle class="text-wrap">{{review.comments}}</v-list-item-subtitle>
									</v-list-item-content>
									<v-list-item-avatar color="red darken-4">
										<span class="text-area caption">{{getInitials(review.user ? review.user.name : '') }}</span>
									</v-list-item-avatar>
								</v-list-item>
							</v-list-item-group>
						</v-list>
					</v-card>
					<v-card-text>
						<div class="text-area">
							<v-divider></v-divider>
							<v-textarea
								outlined
								label="Comment"
								clearable
								clear-icon="mdi-delete"
								append-icon="mdi-checkbox-marked-circle"
								color="red darken-4"
								counter
								maxlength="500"
								:rules="[rules.counter]"
								dense
								placeholder
								v-model="reviewComment"
								@click:append="submitSongReview(reviewFilename, null, reviewComment || '')"
							></v-textarea>
						</div>
					</v-card-text>
				</v-card>
			</v-dialog>
			<div v-show="playlist.length < totalResultsAvailable">
				<v-card-actions class="d-flex justify-content-center">
					<v-btn color="#e538356b" @click="showMoreResults">Show more Results</v-btn>
					<v-btn color="#e538356b" @click="showAllResults">Show all {{totalResultsAvailable}} Results</v-btn>
				</v-card-actions>
			</div>
		</v-card>
	</v-skeleton-loader>
</template>
 
<script>
import DownloadDialog from "./DownloadDialog.vue";

export default {
  components: {
    DownloadDialog,
  },
	data() {
		return {
			downloadDialog: false,
			downloadFilename: "",
			reviewFilename: "",
			reviewDialog: false,
			reviewComment: "",
			show: false,
			rules: {
				counter: value => (value || "").length <= 500 || "Max 500 characters"
			}, 
		};
	},
	props: {
		playlist: Array,
		selectedTrackFile: String,
		indexFile: String,
		isLoading: Boolean,
		totalResultsAvailable: Number,
		songReviews: Array
	},
	computed: {
		ratingSummary() {
			let rs = {};
			// return rs
			this.songReviews.forEach(review => {
				let summary = rs[review.file] || {};
				if (review.user_id == this.$user.id) {
					summary["myRating"] = review.rating;
					summary["myComment"] = review.comments;
				}
				if (review.comments)
					summary["comments"] = summary["comments"]
						? summary["comments"] + 1
						: 1;
				summary[review.rating] = summary[review.rating]
					? summary[review.rating] + 1
					: 1;
				rs[review.file] = summary;
			});
			return rs;
		}
	},
	methods: {
		selectTrack(file) {
			this.$emit("selecttrack", file);
		},
		playTrack(index) {
			this.$emit("playtrack", index);
		},
		showMoreResults() {
			this.$emit("showmoreresults");
		},
		showAllResults() {
			this.$emit("showallresults");
		},
		submitSongReview(file, rating = null, comments = null) {
			if (rating == this.getRating(file, "myRating")) rating = "";
			this.$emit("submitSongReview", file, rating, comments);
		},
		getRating(file, ratingType) {
			return this.ratingSummary[file]
				? this.ratingSummary[file][ratingType] || 0
				: 0;
		},
		getInitials(fullName) {
			return (fullName || "")
				.split(" ")
				.map(n => n[0])
				.join("");
		},
	}
};
</script>

<style scoped>
.selected {
	color: #000;
	background-color: rgba(229, 56, 53) !important;
}
.playing {
	background-color: rgb(226, 157, 156);
}
.bg {
	background-color: rgba(218, 218, 218, 0.425);
}
.playlist {
	overflow: auto;
}
.v-skeleton-loader {
	padding-bottom: 115px;
}
::v-deep .v-slide-group__content {
	justify-content: center;
}
.myRatings {
	background-color: #b71c1c !important;
	color: white;
}
.myRatings ::v-deep .v-icon {
	color: white;
}
.text-area {
	color: white;
	font-weight: bold;
}
</style>