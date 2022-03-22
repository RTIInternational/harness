import type { RouteRecordRaw } from 'vue-router'
import { Store } from 'vuex'
import { PageConstructable } from './types/harness'

export default function routes (store: Store<any>, pages: PageConstructable[]) {
  const routes = []
  for (const Page of pages) {
    const pageObject = new Page()
    const route:RouteRecordRaw = {
      path: '/' + pageObject.key,
      name: pageObject.key,
      component: pageObject.pageComponent,
      props: pageObject.pageProps ? pageObject.pageProps : false,
      beforeEnter: pageObject.retrieveData
        ? (to:any, from:any, next:any) => {
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
    console.log('Added route', route)
  }
  return routes
}
