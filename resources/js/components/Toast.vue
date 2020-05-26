<template>

  <v-snackbar
    :timeout="timeout"
    :color="color"
    :top="top"
    v-model="active"
    class="application"
    @click="dismiss">

    {{ text }}

    <v-icon v-if="icon.length>0" >
      {{ icon }}
    </v-icon>

  </v-snackbar>

</template>


<script>
export default {
  data() {
    return {
      active: false,
      text: '',
      icon: '',
      color: 'info',
      timeout: 0,
      dismissible: true,
      top: true,
    };
  },
  methods: {
    show(options = {}) {
      if (this.active) {
        this.close();
        this.$nextTick(() => this.show(options));
        return;
      }
      Object.keys(options).forEach(field => (this[field] = options[field]));
      this.active = true;
    },
    close() {
      this.active = false;
    },
    dismiss() {
      if (this.dismissible) {
        this.active = false;
      }
    },
  },
};
</script>