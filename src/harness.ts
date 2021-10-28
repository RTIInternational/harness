import createPageModules from './store'
import routes from './router'
// @ts-ignore
import mixin from './mixin'
import pages from './pages'
import VueRouter, { RouteConfig } from "vue-router";
import { VueConstructor } from 'vue'
import { HarnessOptions } from './types/harness'

// A Vue plugin exposes an `install` method, which is called when Vue.use() is called
// https://vuejs.org/v2/guide/plugins.html#Writing-a-Plugin

const harness = {
  // eslint-disable-next-line
    install(Vue:VueConstructor, options:HarnessOptions) {
    // getting store modules and routes
    let validatedPages = pages(options.pages)
    let pageModules = createPageModules(validatedPages, options)

    // create module in state for each page and register subscriptions
    for (const pageModuleKey in pageModules.userDefined) {
      const module = pageModules.userDefined[pageModuleKey]
      options.store.registerModule(pageModuleKey, module, {})
    }
    options.store.registerModule("pages", pageModules.harnessInternal!, {})

    // create named route for each page
    if (options.router) {
      routes(options.store, validatedPages).forEach((route: RouteConfig) => options.router.addRoute(route))
    }

    // add helper functions mixin
    Vue.mixin(mixin(options))
  }
}

export default harness
// @ts-ignore
export { default as Hs } from './Hs'