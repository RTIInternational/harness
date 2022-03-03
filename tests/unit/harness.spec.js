
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import harness, { Hs } from '../../src/harness'
import pages from './mocks/pages/manifest'
import { createLocalVue, mount } from '@vue/test-utils'
import TestApp from './mocks/components/TestApp'

// creating vue instance with test pages/harness mocked
// eslint-disable-next-line
function createNewWrapper() {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)
  const store = new Vuex.Store()
  const router = new VueRouter()
  localVue.use(harness, { store, router, pages })
  let wrapper = mount(TestApp, { localVue, router, store, stubs: ['router-link', 'router-view'] })
  return wrapper
}
// set up pages reference
let pageReference = {}
pages.forEach((Page) => { pageReference[new Page().key] = new Page() })

// general
describe('harness', () => {
  let wrapper = createNewWrapper()

  it('Has vuex store', () => {
    expect(wrapper.vm.$store).toBeTruthy()
  })

  it('Has vue-router', () => {
    expect(wrapper.vm.$router).toBeTruthy()
  })
})

// Store
describe('harness store', () => {
  let wrapper = createNewWrapper()
  it('Loads a namespaced module for each page', () => {
    Object.keys(pageReference).forEach((page) => {
      expect(wrapper.vm.$store.state).toHaveProperty(page)
    })
  })

  it('Loads pages for reference', () => {
    expect(wrapper.vm.$store.state['pages'].pages).toEqual(Object.keys(pageReference))
    Object.keys(pageReference).forEach((pageKey) => {
      expect(wrapper.vm.$store.state[pageKey]).toHaveProperty('page')
    })
  })

  it('Loads all filters into state', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.values(pageReference[pageKey].filters()).forEach((filter) => {
        expect(wrapper.vm.$store.state[pageKey]).toHaveProperty(filter.key + '_filter')
      })
    })
  })

  it('Creates getters for each filter', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.values(pageReference[pageKey].filters()).forEach((filter) => {
        expect(wrapper.vm.$store.getters).toHaveProperty(pageKey + '/' + filter.key + 'Filter')
      })
    })
  })

  it('Creates mutation and action for each filter', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.values(pageReference[pageKey].filters()).forEach((filter) => {
        // directly commit mutation
        wrapper.vm.$store.commit(pageKey + '/' + 'SET_' + filter.key.toUpperCase() + '_FILTER', 'TESTING MUTATION')
        expect(wrapper.vm.$store.state[pageKey][filter.key + '_filter']).toBe('TESTING MUTATION')
        // dispatch action
        wrapper.vm.$store.dispatch(pageKey + '/' + 'SET_' + filter.key.toUpperCase() + '_FILTER', 'TESTING ACTION')
        expect(wrapper.vm.$store.state[pageKey][filter.key + '_filter']).toBe('TESTING ACTION')
        // test getter
        expect(wrapper.vm.$store.getters[pageKey + '/' + filter.key + 'Filter']).toBe('TESTING ACTION')
      })
    })
  })

  it('Loads all filter options into state', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.values(pageReference[pageKey].filters()).forEach((filter) => {
        expect(wrapper.vm.$store.state[pageKey]).toHaveProperty(filter.key + '_options')
      })
    })
  })

  it('Creates getters for filter options', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.values(pageReference[pageKey].filters()).forEach((filter) => {
        expect(wrapper.vm.$store.getters).toHaveProperty(pageKey + '/' + filter.key + 'Options')
      })
    })
  })

  it('Creates mutation and action for filter options', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.values(pageReference[pageKey].filters()).forEach((filter) => {
        // directly commit mutation
        wrapper.vm.$store.commit(pageKey + '/' + 'SET_' + filter.key.toUpperCase() + '_OPTIONS', ['TEST OPTION'])
        expect(wrapper.vm.$store.state[pageKey][filter.key + '_options']).toEqual(['TEST OPTION'])
        // dispatch action
        wrapper.vm.$store.dispatch(pageKey + '/' + 'SET_' + filter.key.toUpperCase() + '_OPTIONS', ['TEST OPTION'])
        expect(wrapper.vm.$store.state[pageKey][filter.key + '_options']).toEqual(['TEST OPTION'])
        // test getter
        expect(wrapper.vm.$store.getters[pageKey + '/' + filter.key + 'Options']).toEqual(['TEST OPTION'])
      })
    })
  })

  it('Loads all charts into state', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.keys(pageReference[pageKey].charts()).forEach((chartKey) => {
        expect(wrapper.vm.$store.state[pageKey]).toHaveProperty(chartKey + '_chart_data')
      })
    })
  })

  it('Creates getters for each chart', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.keys(pageReference[pageKey].charts()).forEach((chartKey) => {
        expect(wrapper.vm.$store.getters).toHaveProperty(pageKey + '/' + chartKey + 'ChartData')
      })
    })
  })

  it('Creates mutation and action for each chart', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      Object.keys(pageReference[pageKey].charts()).forEach((chartKey) => {
        // directly commit mutation
        wrapper.vm.$store.commit(pageKey + '/' + 'SET_' + chartKey.toUpperCase() + '_CHART_DATA', 'TESTING MUTATION')
        expect(wrapper.vm.$store.state[pageKey][chartKey + '_chart_data']).toBe('TESTING MUTATION')
        // dispatch action
        wrapper.vm.$store.dispatch(pageKey + '/' + 'SET_' + chartKey.toUpperCase() + '_CHART_DATA', 'TESTING ACTION')
        expect(wrapper.vm.$store.state[pageKey][chartKey + '_chart_data']).toBe('TESTING ACTION')
        // test getter
        expect(wrapper.vm.$store.getters[pageKey + '/' + chartKey + 'ChartData']).toBe('TESTING ACTION')
      })
    })
  })

  it('Can load data from function', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      wrapper.vm.$store.dispatch(pageKey + '/LOAD_DATA').then(() => {
        Object.keys(pageReference[pageKey].charts()).forEach((chartKey) => {
          expect(wrapper.vm.$store.getters[pageKey + '/' + chartKey + 'ChartData']).toContain(chartKey)
        })
      })
    })
  })

  it('Can clear chart data', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      wrapper.vm.$store.dispatch(pageKey + '/CLEAR_DATA')
      Object.keys(pageReference[pageKey].charts()).forEach((chartKey) => {
        expect(wrapper.vm.$store.getters[pageKey + '/' + chartKey + 'ChartData']).toBeNull()
      })
    })
  })

  it('Can initialize filter defaults', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      wrapper.vm.$store.dispatch(pageKey + '/INITIALIZE_DEFAULTS').then(() => {
        Object.values(pageReference[pageKey].filters()).forEach((filter) => {
          expect(wrapper.vm.$store.getters[pageKey + '/' + filter.key + 'Filter']).toBe('default')
        })
      })
    })
  })

  it('Has dataLoading with default false', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      expect(wrapper.vm.$store.getters[pageKey + '/' + 'dataLoading']).toBe(false)
    })
  })
  it('Can toggle data loading', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      expect(wrapper.vm.$store.getters[pageKey + '/' + 'dataLoading']).toBe(false)
      wrapper.vm.$store.dispatch(pageKey + '/TOGGLE_DATA_LOADING')
      expect(wrapper.vm.$store.getters[pageKey + '/' + 'dataLoading']).toBe(true)
      wrapper.vm.$store.dispatch(pageKey + '/TOGGLE_DATA_LOADING')
      expect(wrapper.vm.$store.getters[pageKey + '/' + 'dataLoading']).toBe(false)
    })
  })
})

// Router
describe('harness router', () => {
  let wrapper = createNewWrapper()
  it('Has a valid route per page', () => {
    Object.keys(pageReference).forEach((pageKey) => {
      let resolution = wrapper.vm.$router.resolve({ name: pageKey })
      expect(resolution.resolved.matched).toBeTruthy()
      expect(resolution.resolved.matched.length).toBeGreaterThan(0)
    })
  })

  it('Clears data and loads data on page navigate', () => {
    wrapper.vm.$store.dispatch = jest.fn(() => Promise.resolve({}))
    Object.keys(pageReference).forEach((pageKey) => {
      // navigate to page
      wrapper.vm.$router.push({ name: pageKey })
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(pageKey + '/LOAD_DATA')
      })
    })
  })
})

describe('harness mixin', () => {
  let wrapper = createNewWrapper()
  let hsProps = Object.getOwnPropertyNames(Hs.prototype).filter(key => !key.includes('_') || key === 'constructor')
  it('Maps all DV functions', () => {
    hsProps.forEach(prop => {
      expect(wrapper.vm[prop]).toBeTruthy()
    })
  })
})
