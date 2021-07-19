<template>
	<v-row>
		<v-app-bar
			:clipped-left="$vuetify.breakpoint.lgAndUp"
			app
			flat
		>
			<v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

			<v-img
			src="/faithfm-colour-R4.png"
			alt="Faith FM logo"
			max-width="125"
			class="d-flex align-self-center"
		></v-img>

			<v-spacer class="d-none d-sm-flex"></v-spacer>
			<v-toolbar-title class="d-flex align-self-center">
				<span class="hidden-sm-and-down">{{ app.config.name }}</span>
			</v-toolbar-title>

			<v-spacer></v-spacer>

			<template v-if="app.guest">
				<v-btn href="/login" class="d-flex align-self-center">Login</v-btn>
			</template>

			<template v-else>
				<span class="text-body-1 d-none d-sm-flex align-self-center">
					{{ app.user.name }}
				</span>
				<v-btn
					dark
					class="ma-2 d-none d-sm-flex align-self-center"
					@click="reload()"
				>
					Reload
				</v-btn>
				<v-btn dark class="d-flex align-self-center" @click="logout()">
					Logout
				</v-btn>
			</template>
		</v-app-bar>
		<v-navigation-drawer app :value="drawer" clipped>
			<v-list>
				<v-list-item-group>
					<v-list-item v-for="(item, index) in itemMenu" :key="index">
						<router-link
							:to="{
								path: '/filter/' + item.slug,
								params: { filter: item.filter },
							}"
							@click="applyRouteFilter"
							>{{ item.name }}</router-link
						>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>
	</v-row>
</template>

<script>
export default {
	data() {
		return {
			dialog: false,
			params: Array,
			app: LaravelAppGlobals,
			drawer: false,
		};
	},
	props: {
		itemMenu: Array,
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
		},
	},
};
</script>
