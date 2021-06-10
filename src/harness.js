import createPageModules from './store'
import routes from './router'
import mixin from './mixin'
import pages from './pages'

// A Vue plugin exposes an `install` method, which is called when Vue.use() is called
// https://vuejs.org/v2/guide/plugins.html#Writing-a-Plugin

const harness = {
  // eslint-disable-next-line
    install(Vue, options) {
    // getting store modules and routes
    let validatedPages = pages(options.pages)
    let pageModules = createPageModules(validatedPages, options)
    let pageRoutes = routes(options.store, validatedPages)

    // create module in state for each page and register subscriptions
    for (const pageModuleKey in pageModules) {
      options.store.registerModule(pageModuleKey, pageModules[pageModuleKey])
    }

    // create named route for each page
    if (options.router) {
      options.router.addRoutes(pageRoutes)
    }

    // add helper functions mixin
    Vue.mixin(mixin(options))
  }
}

export default harness
export { default as Hs } from './Hs'
