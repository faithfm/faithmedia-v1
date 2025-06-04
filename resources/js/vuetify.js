import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/dist/vuetify.css'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

const opts = {
  theme: {
    themes: {
      light: {
        primary: colors.red.darken4, // Set primary color to red-darken-4
        secondary: colors.grey.darken1,
        accent: colors.blue.accent2,
        error: colors.red.accent3,
        info: colors.blue.base,
        success: colors.green.base,
        warning: colors.amber.base
      },
      dark: {
        primary: colors.red.darken4, // Also set for dark theme
      }
    }
  }
}

export default new Vuetify(opts)
