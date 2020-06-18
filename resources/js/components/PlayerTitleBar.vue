<template>
	<v-toolbar flat :prominent="!$vuetify.breakpoint.xs">

		<v-menu>
			<template v-slot:activator="{ on: menu }">
				<v-btn text small right v-on="menu">
					<v-icon>mdi-menu</v-icon>
				</v-btn>
			</template>
			<v-list>
				<v-list-item-group>
					<v-list-item v-for="(item, index) in itemMenu" :key="index">
						<!-- <v-list-item-title  :to="{path: item.slug, params:{filter: item.filter}} ">{{ item.name }}</v-list-item-title> -->
						<router-link
							:to="{path: '/filter/' + item.slug, params:{filter: item.filter}}"
							@click="applyRouteFilter"
						>{{ item.name }}</router-link>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-menu>

		<v-img
			src="https://faithfm.com.au/wp-content/themes/faith-fm/assets/images/logo/faithfm.png"
			max-width="50px"
			class="d-flex"
		></v-img>

		<v-spacer class="d-none d-sm-flex"></v-spacer>
		<v-toolbar-title class="d-none d-sm-flex textTitleBar title">{{app.name}}</v-toolbar-title>

		<v-spacer></v-spacer>
		<span class="d-none d-sm-flex textTitleBar">{{app.user.name}}&nbsp;</span>
		<span class="d-flex d-sm-none textTitleBar fontUser">{{app.user.name}}&nbsp;</span>
		<!-- <v-icon>mdi-minus</v-icon>
		<v-icon>mdi-checkbox-blank-outline</v-icon>-->
		<v-icon @click="reload">mdi-reload</v-icon>
		<v-icon @click="logout">mdi-close</v-icon>
	</v-toolbar>
</template>

<script>
export default {
	data() {
		return {
			dialog: false,
            params: Array,
            app: LaravelAppGlobals,
		};
	},
	props: {
		itemMenu: Array
	},
	methods: {
		logout() {
			document.getElementById("logout-form").submit();
		},
		reload() {
			this.$emit("reload");
		},
		applyRouteFilter() {
			this.$emit("applyroutefilter");
		}
	}
};
</script>

<style scoped>
.textTitleBar {
	white-space: pre-wrap;
	text-align: center;
}
.fontUser {
	font-size: xx-small;
	margin: 6px 0;
	white-space: pre-wrap;
	text-align: center;
}
</style>
