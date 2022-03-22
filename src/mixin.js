import Hs from './Hs'
import { mapGetters } from 'vuex'

function mixin (options) {
  const store = options.store
  const hsProps = Object.getOwnPropertyNames(Hs.prototype).filter(key => !key.includes('_') && key !== 'constructor')
  const methods = hsProps.reduce((acc, prop) => {
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
          const hs = new Hs(this.waypoint, store)
          return hs
        } else {
          throw Error('No waypoint. No Harness variable to use')
        }
      }
    },
    beforeCreate: function () {
      // if route name is a valid harness page, use it as waypoint
      let waypoint = false
      // shim in this.$store for vuex mapGetters functions
      // vuex mapGetters depends on this.$store: https://github.com/vuejs/vuex/blob/dev/src/helpers.js#L81
      this.$store = options.store
      console.log('this.$route', this.$route)
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
        const hs = new Hs(waypoint, store)
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
      } else {
        throw Error('No waypoint exists for component. Make sure the component is not rendering before the route defined for it has been pushed.')
      }
      this.$options.computed = {
        ...this.$options.computed,
        ...mapGetters('pages', ['pages', 'pageObjects'])
      }
    }
  }
}
export default mixin
