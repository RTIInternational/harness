import getDefaultOption from './getDefaultOption'
import Hs from './Hs'

export default function createPageModules (pages, options) {
  let pageModules = {}
  let pageList = []
  let pageObjects = {}
  for (let Page of pages) {
    let pageObject = new Page()
    pageObjects[pageObject.key] = pageObject
    let pageModule = {
      namespaced: true,
      state: getState(pageObject),
      mutations: getMutations(pageObject),
      actions: getActions(pageObject, options),
      getters: getGetters(pageObject)
    }
    pageModules[pageObject.key] = pageModule
    pageList.push(pageObject.key)
  }
  pageModules['pages'] = {
    namespaced: true,
    state: {
      pages: pageList,
      pageObjects: pageObjects
    },
    getters: {
      pages (state) {
        return state.pages
      },
      pageObjects (state) {
        return state.pageObjects
      }
    }
  }

  registerSubscriptions(pageObjects, options)
  return pageModules
}

function getState (pageObject) {
  // create initial state with raw data
  let state = {
    page: pageObject,
    filters: pageObject.filters(),
    charts: pageObject.charts(),
    request_cache: null,
    data_loading: false
  }

  // add filter and lookup for each possible filter
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    state[filterKey + '_filter'] = getDefaultOption(filters[filterKey], filters[filterKey].options)
    state[filterKey + '_options'] = filters[filterKey].options || []
  }

  // add chart data container for each chart type
  let charts = pageObject.charts()
  for (let chartkey in charts) {
    state[chartkey + '_chart_data'] = null
  }
  return state
}

function getMutations (pageObject) {
  // set initial mutations with raw data mutation
  let mutations = {
    SET_REQUEST_CACHE (state, payload) {
      state['request_cache'] = payload
    },
    TOGGLE_DATA_LOADING (state) {
      state['data_loading'] = !state['data_loading']
    }
  }
  // add mutation for setting each filter
  // add mutation for each filter's options
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    let filterMutation = function (state, payload) {
      state[filterKey + '_filter'] = payload
    }
    let optionMutation = function (state, payload) {
      state[filterKey + '_options'] = payload
    }

    mutations['SET_' + filterKey.toUpperCase() + '_FILTER'] = filterMutation
    mutations['SET_' + filterKey.toUpperCase() + '_OPTIONS'] = optionMutation
  }

  // add mutation for each chart's data container
  let charts = pageObject.charts()
  for (let chartKey in charts) {
    let mutation = function (state, payload) {
      state[chartKey + '_chart_data'] = payload
    }
    mutations['SET_' + chartKey.toUpperCase() + '_CHART_DATA'] = mutation
  }
  return mutations
}

function getActions (pageObject, options) {
  // set initial action for setting raw data
  let actions = {
    SET_REQUEST_CACHE ({ commit }, payload) {
      commit('SET_REQUEST_CACHE', payload)
    },
    TOGGLE_DATA_LOADING ({ commit }, payload) {
      commit('TOGGLE_DATA_LOADING', payload)
    }
  }
  // create actions for setting each filter
  // create actions for setting each filter's options
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    let filterAction = function ({ commit }, payload) {
      commit('SET_' + filterKey.toUpperCase() + '_FILTER', payload)
    }
    let optionAction = function ({ commit }, payload) {
      commit('SET_' + filterKey.toUpperCase() + '_OPTIONS', payload)
    }
    actions['SET_' + filterKey.toUpperCase() + '_FILTER'] = filterAction
    actions['SET_' + filterKey.toUpperCase() + '_OPTIONS'] = optionAction
  }

  // create action for setting each chart's data container
  let charts = pageObject.charts()
  for (let chartKey in charts) {
    let action = function ({ commit }, payload) {
      commit('SET_' + chartKey.toUpperCase() + '_CHART_DATA', payload)
    }
    actions['SET_' + chartKey.toUpperCase() + '_CHART_DATA'] = action
  }

  // create initialize defaults option that iterates over filters and sets default values
  let intializeDefaults = function ({ dispatch }, payload = null) {
    let filters = pageObject.filters()

    // only intialize defaults for a subset of filters if included
    if (payload) {
      filters = Object.keys(filters)
        .filter(key => payload.includes(key))
        .reduce((obj, key) => {
          obj[key] = filters[key]
          return obj
        }, {})
    }
    for (const filterKey in filters) {
      const options = this.getters[pageObject.key + '/' + filterKey + 'Options']
      dispatch('SET_' + filterKey.toUpperCase() + '_FILTER', getDefaultOption(filters[filterKey], options))
    }
  }
  actions['INITIALIZE_DEFAULTS'] = intializeDefaults

  // create load data action that runs page's data retrieval function and distributes data to each chart data container
  let load = async function ({ commit, dispatch, state }) {
    if (!pageObject.retrieveData) {
      throw String('retrieveData function is missing in page file. retrieveData must exist to use LOAD_DATA action')
    }
    let hs = new Hs(pageObject.key, options.store)
    const data = await pageObject
      .retrieveData(state, pageObject, hs)
      .then(function (response) {
        return response
      })
      .catch(function (error) {
        throw Error(error)
      })
    for (const chartKey in pageObject.charts()) {
      if (data[chartKey] === null) {
        throw String('Retrieved data is missing data for chart ' + chartKey)
      }
      dispatch('SET_' + chartKey.toUpperCase() + '_CHART_DATA', data[chartKey])
    }
  }

  actions['LOAD_DATA'] = load

  // create clear data action that removes all chart data from store module - this will get run when pages change
  let clear = function ({ commit, dispatch }) {
    for (const chartKey in pageObject.charts()) {
      dispatch('SET_' + chartKey.toUpperCase() + '_CHART_DATA', null)
    }
  }
  actions['CLEAR_DATA'] = clear

  return actions
}

function getGetters (pageObject) {
  // add initial getter for raw data
  let getters = {
    requestCache (state) {
      return state['request_cache']
    },
    page (state) {
      return state.page
    },
    filters (state) {
      return state.filters
    },
    charts (state) {
      return state.charts
    },
    dataLoading (state) {
      return state['data_loading']
    }
  }
  // add getter for each filter
  // add getter for each filter's options
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    let filterGetter = function (state) {
      return state[filterKey + '_filter']
    }
    let optionGetter = function (state) {
      return state[filterKey + '_options']
    }
    getters[filterKey + 'Filter'] = filterGetter
    getters[filterKey + 'Options'] = optionGetter
  }

  // add getter for each chart data container
  let charts = pageObject.charts()
  for (let chartKey in charts) {
    let getter = function (state) {
      return state[chartKey + '_chart_data']
    }
    getters[chartKey + 'ChartData'] = getter
  }
  return getters
}

function registerSubscriptions (pageObjects, options) {
  options.store.subscribeAction({
    before: (action, state) => {
      runSubscriptions('before', action, options, pageObjects)
    },
    after: (action, state) => {
      runSubscriptions('after', action, options, pageObjects)
    }
  })
}

function runSubscriptions (hook, action, options, pageObjects) {
  let pageKey = action.type.split('/')[0]
  if (Object.keys(pageObjects).includes(pageKey)) {
    let hs = new Hs(pageKey, options.store)
    if (action.type.includes('LOAD_DATA')) {
      hs.toggleDataLoading()
      if (pageObjects[pageKey][hook + 'LoadData']) {
        pageObjects[pageKey][hook + 'LoadData'](action, hs)
      }
    } else {
      if (hs.filters) {
        Object.keys(hs.filters).forEach(filterKey => {
          if (action.type === hs.getFilterActionString(filterKey) && hs.filters[filterKey][hook + 'Set']) {
            hs.filters[filterKey][hook + 'Set'](action, hs)
          }
        })
      }
      if (hs.charts) {
        Object.keys(hs.charts).forEach(chartKey => {
          if (action.type === hs.getChartDataActionString(chartKey) && hs.charts[chartKey][hook + 'Set']) {
            hs.charts[chartKey][hook + 'Set'](action, hs)
          }
        })
      }
    }
  }
}
