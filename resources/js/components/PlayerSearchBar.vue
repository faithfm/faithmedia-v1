<template>
  <v-toolbar flat rounded>
    <v-text-field
      clearable
      prepend-icon="mdi-magnify"
      append-outer-icon="mdi-sort"
      placeholder="Quick search"
      :value="searchString"
      @input="updateSearchString"
      @click:append-outer="$emit('reverseSort')"
    ></v-text-field>
  </v-toolbar>
</template>
 
<script>
export default {
  props: {
    searchString: String
  },
  created: function() {
    this.updateSearchString = _.debounce(this.updateSearchString, 400);
  },
  methods: {
    updateSearchString(newValue) {
      // NOTE: When emmiting events, native HTML components, often emit an object in the form something like $event.target.value (ie: HTML "input" element).
      //  (You'll find a lot of Vue documentation/examples referring to this.)  However events from custom-components usually return their values directly.
      //  This is the case with Vuetify's "v-text-field" component, and we're calling the direct event "newValue" here.  (This can be confusing unless you're expecting it!)
      //  Ref: https://forum.vuejs.org/t/why-is-my-value-inside-event-and-not-event-target-value/12737
      //  Ref: https://github.com/chrisvfritz/vue-enterprise-boilerplate/issues/141#issuecomment-477561093
      //  Ref: https://stackoverflow.com/questions/42918710/how-to-use-v-bind-in-a-custom-component
      this.$emit("update:searchString", newValue);
    }
  }
};
</script>

