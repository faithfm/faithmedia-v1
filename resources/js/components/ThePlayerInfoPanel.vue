<template>
	<v-card class="infoPanel">
		<v-card-text class="caption text-uppercase d-flex justify-content-between word-break:keep-all">
			<span>{{ trackInfo.content }} - {{ trackInfo.guests }}</span>
			<span class="d-none d-sm-flex">{{trackInfo.seek | minutes}}/{{trackInfo.duration | minutes}}</span>
		</v-card-text>
	</v-card>
</template>
 
<script>
export default {
	props: {
		trackInfo: Object
	}
};
</script>

<style scoped>
.infoPanel {
	position: sticky !important;
	width: 100%;
	top: 0;
	z-index: 1;
}
</style>