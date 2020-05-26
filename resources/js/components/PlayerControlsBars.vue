<template>
	<div class="footer">
		<v-toolbar float height="90" class="d-flex align-center justify-center">
			<v-btn icon @click="toggleLoop">
				<v-icon color="red accent-1" v-if="this.loop">mdi-repeat-once</v-icon>
				<v-icon color="grey darken-1" v-else>mdi-repeat-once</v-icon>
			</v-btn>
			<v-btn outlined fab small color="red darken-4" @click="skipTrack('prev')">
				<v-icon>mdi-skip-previous</v-icon>
			</v-btn>
			<!-- <v-btn v-if="this.playing" outlined fab small color="light-blue" @click="stopTrack" >
					<v-icon>mdi-stop</v-icon>
			</v-btn>-->
			<v-btn v-if="!this.playing" outlined fab color="red darken-4" @click="playTrack()">
				<v-icon large>mdi-play</v-icon>
			</v-btn>
			<v-btn v-if="this.playing" outlined fab color="red darken-4" @click="pauseTrack">
				<v-icon>mdi-pause</v-icon>
			</v-btn>
			<v-btn outlined fab small color="red darken-4" @click="skipTrack('next')">
				<v-icon>mdi-skip-next</v-icon>
			</v-btn>
			<v-btn icon @click="toggleShuffle">
				<v-icon color="red accent-1" v-if="this.shuffle">mdi-shuffle</v-icon>
				<v-icon color="grey darken-1" v-else>mdi-shuffle</v-icon>
			</v-btn>
		</v-toolbar>
		<v-toolbar flat height="10" class="px-10 pb-10">
			<v-toolbar-items class="text-nonwrap ma-3">{{trackInfo.seek | minutes}}</v-toolbar-items>
			<v-progress-linear rounded color="red darken-4" height="8" v-model="trackProgress"></v-progress-linear>
			<v-toolbar-items class="text-nonwrap ma-3">{{trackInfo.duration | minutes}}</v-toolbar-items>
		</v-toolbar>
	</div>
</template>

<script>
export default {
	props: {
		loop: Boolean,
		shuffle: Boolean,
		progress: Number,
		playing: Boolean,
		trackInfo: Object
	},
	data() {
		return {
			volume: 1.0,
			muted: false
		};
	},
	computed: {
		trackProgress: {
			get: function() {
				return this.progress * 100;
			},
			set: function(percents) {
				let updateProgress = this.progress;
				updateProgress = percents / 100;
				this.$emit("updateseek", percents);
			}
		}
	},
	created: function() {
		Howler.volume(this.volume);
	},
	methods: {
		playTrack() {
			this.$emit("playtrack");
		},
		pauseTrack() {
			this.$emit("pausetrack");
		},
		stopTrack() {
			this.$emit("stoptrack");
		},
		skipTrack(direction) {
			this.$emit("skiptrack", direction);
		},
		updateVolume(volume) {
			Howler.volume(volume);
		},
		toggleMute() {
			Howler.mute(!this.muted);
			this.muted = !this.muted;
		},
		toggleLoop() {
			this.$emit("toggleloop", !this.loop);
		},
		toggleShuffle() {
			this.$emit("toggleshuffle", !this.shuffle);
		}
	}
};
</script>

<style scoped>
.footer {
	position: fixed;
	width: 100%;
	bottom: 0;
	height: 130px;
	left: 0;
}
</style>