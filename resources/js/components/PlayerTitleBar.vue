<template>
	<v-system-bar window>
		<v-menu>
			<template v-slot:activator="{ on: menu }">
				<v-btn text small right v-on="menu">
					<v-icon>mdi-headset</v-icon>MENU
				</v-btn>
			</template>
			<v-list>
				<v-list-item-group>
					<v-list-item v-for="(item, index) in itemMenu" :key="index">
						<!-- <v-list-item-title  :to="{path: item.slug, params:{filter: item.filter}} ">{{ item.name }}</v-list-item-title> -->
            <router-link :to="{path: '/filter/' + item.slug, params:{filter: item.filter}}" @click="applyRouteFilter">{{ item.name }}</router-link>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-menu>
		<v-spacer></v-spacer>MUSIC PLAYER
		<v-spacer></v-spacer>{{$user.name}}&nbsp;
		<!-- <v-icon>mdi-minus</v-icon>
		<v-icon>mdi-checkbox-blank-outline</v-icon>-->
		<v-icon @click="reload">mdi-reload</v-icon>
		<v-icon @click="logout">mdi-close</v-icon>
	</v-system-bar>
</template>
 
<script>

export default {
	data() {
		return {
      dialog: false,
      params: Array
  }},
  props:{
    itemMenu:Array
  },
	methods: {
		logout() {
			document.getElementById("logout-form").submit();
    },
    reload() {
      this.$emit("reload");
    },
    applyRouteFilter() {
			this.$emit("applyroutefilter")
		}
	}
};
</script>