<template>
	<v-skeleton-loader :loading="isLoading" type="list-item-two-line@50">
		<v-card :class="{playlist}">
			<v-list>
				<v-list-item-group>
					<v-list-item
						two-line
						v-for="(track, index) in playlist"
						:key="track.file"
						:class="[{selected: track.file === selectedTrackFile}, {playing: track.file === indexFile}, {bg: track.file !== indexFile}, {missingFile: ! Boolean(track.bytes)}]"
						class="my-1"
					>
						<v-list-item-content @click="selectTrack(track.file)" @dblclick="actionsDialogModel=track; selectTrack(track.file)">
							<v-list-item-title><span class="text--secondary">{{ index | numbers}}</span> {{ track.content }} <span class="text--secondary">- {{ track.guests }}</span></v-list-item-title>
							<v-list-item-subtitle
								v-show="!showReviews"
								class="text--primary text-right text-sm-left"
								style="text-oveflow:ellipsis; direction:rtl;"
							>
								<span class="text--secondary">{{ filePath(track.file) }}</span>/{{ fileName(track.file) }}
								<span style="float:right">
								<v-chip v-for="tag in track.tags ? track.tags.split(' ') : []" :key=tag x-small color="#dde" text-color="#444" style="margin-left:2px; padding-left:4px; padding-right:4px">
									{{tag}}
								</v-chip>
								</span>
							</v-list-item-subtitle>
							<v-chip-group v-show="showReviews" class="text--primary">
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
							<v-chip-group v-show="showReviews" class="text--primary">
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
							<v-btn icon @click.stop="actionsDialogModel=track; selectTrack(track.file)">
								<v-icon small color="black">mdi-dots-horizontal</v-icon>
							</v-btn>
						</v-list-item-action>
					</v-list-item>
				</v-list-item-group>
			</v-list>
			<div v-show="playlist.length < totalResultsAvailable">
				<v-card-actions class="d-flex justify-content-center">
					<v-btn color="#e538356b" @click="showMoreResults">Show more Results</v-btn>
					<v-btn color="#e538356b" @click="showAllResults">Show all {{totalResultsAvailable}} Results</v-btn>
				</v-card-actions>
			</div>
		</v-card>
		<ActionsDialog
			v-model = "actionsDialogModel"
			:formFieldNames = "['file', 'series', 'numbers', 'guests', 'content', 'tags']"
			:defaultFieldConfig = "{ required:true, maxLength:255 }"
			:fieldConfig = "{ file:{disabled:true}, numbers:{maxLength:30} }"
			@playTrack = "playTrack"
			@updateContentDb = "$emit('updateContentDb',$event);"
		></ActionsDialog>
		<SongReviewDialog
			:reviewDialog.sync = "reviewDialog"
			:reviewComment.sync = "reviewComment"
			:reviewFilename = "reviewFilename"
						:songReviews= "songReviews"
			@submitSongReview="submitSongReview"
		></SongReviewDialog>
	</v-skeleton-loader>
</template>

<script>
import ActionsDialog from "./ActionsDialog.vue";
import SongReviewDialog from "./SongReviewDialog.vue";
import { laravelUserCan } from "../LaravelUserPermissions";

export default {
  components: {
	ActionsDialog,
	SongReviewDialog
  },
	data() {
		return {
			actionsDialogModel: null,
			reviewFilename: "",
			reviewDialog: false,
			reviewComment: "",
			show: false
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
		// console: () => console,		// make console.XXX available in templates
		ratingSummary() {
			let rs = {};
			// return rs
			this.songReviews.forEach(review => {
				let summary = rs[review.file] || {};
				if (review.user_id == LaravelAppGlobals.user.id) {
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
		},
		showReviews(){
			if (this.$route.params.filter == 'music-pending'){
				if(laravelUserCan('review-songs'))
					return true;
				else
					return false;
			}
			else
				return false;
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
		filePath(pathname) {
			return pathname.split("/").slice(0,-1).join('/')
		},
		fileName(pathname) {
			return pathname.split("/").pop()
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
.missingFile {
	background-color: rgba(144, 144, 144, 0.425);
}
.playlist {
	overflow: auto;
}
.v-skeleton-loader {
	padding-bottom: 115px;
}
.myRatings {
	background-color: #b71c1c !important;
	color: white;
}
.myRatings ::v-deep .v-icon {
	color: white;
}
</style>
