import { RouteConfig } from "vue-router/types/router"
import { Store } from "vuex"
import { PageConstructable } from "./types/harness"

export default function routes (store: Store<any>, pages: PageConstructable[]) {
  let routes = []
  for (let Page of pages) {
    let pageObject = new Page()
    let route:RouteConfig = {
      path: '/' + pageObject.key,
      name: pageObject.key,
      component: pageObject.pageComponent,
      props: pageObject.pageProps ? pageObject.pageProps : false,
      beforeEnter: pageObject.retrieveData ? (to, from, next) => {
        if (from.name) {
          store.dispatch(from.name + '/CLEAR_DATA')
        }
        if (to.name) {
          store
            .dispatch(to.name + '/LOAD_DATA')
            .then(response => {})
            .catch(error => {
              // eslint-disable-next-line
              console.error(
                'The LOAD_DATA action failed to resolve when loading the ' +
                  pageObject.key +
                  ' page'
              )
              // eslint-disable-next-line
              console.error(error)
            })
        }
        next()
      }
        : undefined
    }
    routes.push(route)
  }
  return routes
}
