// global filter: "minutes".
//      Given: "62 | minutes" --> Output: "01:02"

import Vue from "vue"

Vue.filter('minutes', (value) => {
    if (!value || typeof value !== "number") return "00:00"
    let min = parseInt(value / 60),
        sec = parseInt(value % 60)
    min = min < 10 ? "0" + min : min
    sec = sec < 10 ? "0" + sec : sec
    value = min + ":" + sec
    return value
  })
