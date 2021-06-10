import Hs from './Hs'
import { mapGetters } from 'vuex'

function mixin (options) {
  let store = options.store
  let hsProps = Object.getOwnPropertyNames(Hs.prototype).filter(key => !key.includes('_') && key !== 'constructor')
  let methods = hsProps.reduce((acc, prop) => {
    acc[prop] = function () { return this.hs[prop](...arguments) }
    return acc
  }, {})
  return {
    methods: methods,
    computed: {
      getters () {
        return this.$options.computed
      },
      hs () {
        if (this.waypoint) {
          let hs = new Hs(this.waypoint, store)
          return hs
        } else {
          return false
        }
      }
    },
    beforeCreate: function () {
      // if route name is a valid harness page, use it as waypoint
      let waypoint = false
      // shim in this.$store for vuex mapGetters functions
      // vuex mapGetters depends on this.$store: https://github.com/vuejs/vuex/blob/dev/src/helpers.js#L81
      this.$store = options.store

      if (this.$route && this.$route.name && this.$store.state.pages.pages.includes(this.$route.name)) {
        waypoint = this.$route.name
      }
      // if router is not installed and only a single harness page exists, use it as waypoint
      if (this.$store.state.pages.pages.length === 1 & !this.$route) {
        waypoint = this.$store.state.pages.pages[0]
      }

      // if a waypoint override was specified, use that
      if (this.$attrs['harness-waypoint']) {
        waypoint = this.$attrs['harness-waypoint']
      }
      // if waypoint was found, instantiate DV object and map all functionality to component
      if (waypoint) {
        this.waypoint = waypoint
        let hs = new Hs(waypoint, store)
        this.$options.computed = {
          ...this.$options.computed,
          ...hs._mappedGetters,
          filters: () => hs.filters,
          charts: () => hs.charts
        }
        this.$options.methods = {
          ...this.$options.methods,
          ...methods,
          ...hs._mappedActions
        }
      }
      this.$options.computed = {
        ...this.$options.computed,
        ...mapGetters('pages', ['pages', 'pageObjects'])
      }
    }
  }
}
export default mixin
