// @ts-ignore
import { ActionPayload, Commit, Dispatch, Module } from 'vuex'
// @ts-ignore
import getDefaultOption from './getDefaultOption'
import Hs from './Hs'
import { PageConstructable, HarnessOptions, PageObj, Filters, Charts, HarnessPageState } from './types/harness'

interface PageObjects {
  [key: string]: PageObj
}
type HarnessPageStateMutations = {
  SET_REQUEST_CACHE: (state:HarnessPageState, payload:object) => void,
  TOGGLE_DATA_LOADING: (state:HarnessPageState) => void
} & {
  [key: string]: any
}
interface CommitObj {
  commit: Commit
}
interface DispatchObj {
  dispatch: Dispatch
}
type Dict = { [key: string]: any }
type ObjectOrNull = Dict | null
interface LoadDataArgs {
  commit: Commit,
  dispatch: Dispatch,
  state:HarnessPageState
}
interface ClearDataArgs {
  commit: Commit,
  dispatch: Dispatch,
}
type HarnessPageStateActions = {
  SET_REQUEST_CACHE: (commitObj:CommitObj, payload:object) => void
  TOGGLE_DATA_LOADING: (commitObj:CommitObj, payload:object) => void
  INITIALIZE_DEFAULTS: (this: HarnessPageModule, { dispatch }:DispatchObj, payload:ObjectOrNull) => void
  LOAD_DATA: ({ commit, dispatch, state }:LoadDataArgs) => void
  CLEAR_DATA: ({commit, dispatch}: ClearDataArgs) => void
} & {
  [key: string]: any
}
type HarnessPageStateGetters = {
  page: (state:HarnessPageState) => PageObj,
  filters: (state:HarnessPageState) => Filters,
  charts: (state:HarnessPageState) => Charts,
  requestCache: (state:HarnessPageState) => object | null,
  dataLoading: (state:HarnessPageState) => boolean
} & {
  [key: string]: any
}
interface HarnessPagesModuleState {
  pages: string[],
  pageObjects: PageObjects
}
interface PageModules {
  userDefined: {
    [key: string]: Module<HarnessPageState,any>
  },
  harnessInternal: Module<HarnessPagesModuleState,any> | null
}
type HarnessPageModule = Module<HarnessPageState,any>
enum SubscriptionHook {
  Before = 'before',
  After = 'after',
}

export default function createPageModules (pages:PageConstructable[], options:HarnessOptions):PageModules {
  let pageModules:PageModules = {
    userDefined: {},
    harnessInternal: null
  }
  let pageList:string[] = []
  let pageObjects:PageObjects = {}
  for (let Page of pages) {
    let pageObject = new Page()
    pageObjects[pageObject.key] = pageObject
    let pageModule:HarnessPageModule = {
      namespaced: true,
      state: getState(pageObject),
      mutations: getMutations(pageObject),
      actions: getActions(pageObject, options),
      getters: getGetters(pageObject)
    }
    pageModules.userDefined[pageObject.key] = pageModule
    pageList.push(pageObject.key)
  }
  pageModules.harnessInternal = {
    namespaced: true,
    state: {
      pages: pageList,
      pageObjects: pageObjects
    },
    getters: {
      pages (state:HarnessPagesModuleState) {
        return state.pages
      },
      pageObjects (state:HarnessPagesModuleState) {
        return state.pageObjects
      }
    }
  }

  registerSubscriptions(pageObjects, options)
  return pageModules
}

function getState (pageObject:PageObj) {
  // create initial state with raw data
  let state:HarnessPageState = {
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

function getMutations (pageObject:PageObj) {
  // set initial mutations with raw data mutation
  let mutations:HarnessPageStateMutations = {
    SET_REQUEST_CACHE (state:HarnessPageState, payload:object) {
      state.request_cache = payload
    },
    TOGGLE_DATA_LOADING (state:HarnessPageState) {
      state.data_loading = !state.data_loading
    }
  }
  // add mutation for setting each filter
  // add mutation for each filter's options
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    let filterMutation = function (state:HarnessPageState, payload:object) {
      state[filterKey + '_filter'] = payload
    }
    let optionMutation = function (state:HarnessPageState, payload:object) {
      state[filterKey + '_options'] = payload
    }

    mutations['SET_' + filterKey.toUpperCase() + '_FILTER'] = filterMutation
    mutations['SET_' + filterKey.toUpperCase() + '_OPTIONS'] = optionMutation
  }

  // add mutation for each chart's data container
  let charts = pageObject.charts()
  for (let chartKey in charts) {
    let mutation = function (state:HarnessPageState, payload:object) {
      state[chartKey + '_chart_data'] = payload
    }
    mutations['SET_' + chartKey.toUpperCase() + '_CHART_DATA'] = mutation
  }
  return mutations
}

function getActions (pageObject:PageObj, options:HarnessOptions) {
  // set initial action for setting raw data
  let actions:HarnessPageStateActions = {
    SET_REQUEST_CACHE ({ commit }, payload:object) {
      commit('SET_REQUEST_CACHE', payload)
    },
    TOGGLE_DATA_LOADING ({ commit }, payload:object) {
      commit('TOGGLE_DATA_LOADING', payload)
    },
    // create initialize defaults option that iterates over filters and sets default values
    INITIALIZE_DEFAULTS: function (this: HarnessPageModule, { dispatch }:DispatchObj, payload:ObjectOrNull = null) {
      let filters = pageObject.filters()
  
      // only intialize defaults for a subset of filters if included
      if (payload) {
        filters = Object.keys(filters)
          .filter(key => payload.includes(key))
          .reduce((obj:Dict, key) => {
            obj[key] = filters[key]
            return obj
          }, {})
      }
      for (const filterKey in filters) {
        const options = this.getters![pageObject.key + '/' + filterKey + 'Options']
        dispatch('SET_' + filterKey.toUpperCase() + '_FILTER', getDefaultOption(filters[filterKey], options))
      }
    },
    // create load data action that runs page's data retrieval function and distributes data to each chart data container
    LOAD_DATA: async function ({ commit, dispatch, state }) {
      if (!pageObject.retrieveData) {
        throw String('retrieveData function is missing in page file. retrieveData must exist to use LOAD_DATA action')
      }
      const hs = new Hs(pageObject.key, options.store)
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
    },
    // create clear data action that removes all chart data from store module - this will get run when pages change
    CLEAR_DATA: function ({ commit, dispatch }) {
      for (const chartKey in pageObject.charts()) {
        dispatch('SET_' + chartKey.toUpperCase() + '_CHART_DATA', null)
      }
    }
  }
  // create actions for setting each filter
  // create actions for setting each filter's options
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    let filterAction = function ({ commit }:CommitObj, payload:object) {
      commit('SET_' + filterKey.toUpperCase() + '_FILTER', payload)
    }
    let optionAction = function ({ commit }:CommitObj, payload:object) {
      commit('SET_' + filterKey.toUpperCase() + '_OPTIONS', payload)
    }
    actions['SET_' + filterKey.toUpperCase() + '_FILTER'] = filterAction
    actions['SET_' + filterKey.toUpperCase() + '_OPTIONS'] = optionAction
  }

  // create action for setting each chart's data container
  let charts = pageObject.charts()
  for (let chartKey in charts) {
    let action = function ({ commit }:CommitObj, payload:object) {
      commit('SET_' + chartKey.toUpperCase() + '_CHART_DATA', payload)
    }
    actions['SET_' + chartKey.toUpperCase() + '_CHART_DATA'] = action
  }

  return actions
}

function getGetters (pageObject:PageObj) {
  // add initial getter for raw data
  let getters:HarnessPageStateGetters = {
    requestCache (state:HarnessPageState) {
      return state.request_cache
    },
    page (state:HarnessPageState) {
      return state.page
    },
    filters (state:HarnessPageState) {
      return state.filters
    },
    charts (state:HarnessPageState) {
      return state.charts
    },
    dataLoading (state:HarnessPageState) {
      return state.data_loading
    }
  }
  // add getter for each filter
  // add getter for each filter's options
  let filters = pageObject.filters()
  for (let filterKey in filters) {
    let filterGetter = function (state:HarnessPageState) {
      return state[filterKey + '_filter']
    }
    let optionGetter = function (state:HarnessPageState) {
      return state[filterKey + '_options']
    }
    getters[filterKey + 'Filter'] = filterGetter
    getters[filterKey + 'Options'] = optionGetter
  }

  // add getter for each chart data container
  let charts = pageObject.charts()
  for (let chartKey in charts) {
    let getter = function (state:HarnessPageState) {
      return state[chartKey + '_chart_data']
    }
    getters[chartKey + 'ChartData'] = getter
  }
  return getters
}

function registerSubscriptions (pageObjects:PageObjects, options:HarnessOptions) {
  options.store.subscribeAction({
    before: (action, state) => {
      runSubscriptions(SubscriptionHook.Before, action, options, pageObjects)
    },
    after: (action, state) => {
      runSubscriptions(SubscriptionHook.After, action, options, pageObjects)
    }
  })
}

function runSubscriptions (hook:SubscriptionHook, action:ActionPayload, options:HarnessOptions, pageObjects:PageObjects) {
  let pageKey = action.type.split('/')[0]
  if (Object.keys(pageObjects).includes(pageKey)) {
    const hs = new Hs(pageKey, options.store)
    if (action.type.includes('LOAD_DATA')) {
      hs.toggleDataLoading()
      if (hook == SubscriptionHook.Before && pageObjects[pageKey].beforeLoadData) {
        pageObjects[pageKey].beforeLoadData!(action, hs)
      }
      else if (hook == SubscriptionHook.After && pageObjects[pageKey].afterLoadData) {
        pageObjects[pageKey].afterLoadData!(action, hs)
      }
    } else {
      if (hs.filters) {
        Object.keys(hs.filters).forEach(filterKey => {
          if (
            hook == SubscriptionHook.Before && 
            action.type === hs.getFilterActionString(filterKey) &&
            hs.filters[filterKey].beforeSet
          ) {
            hs.filters[filterKey].beforeSet(action, hs)
          }
          if (
            hook == SubscriptionHook.After && 
            action.type === hs.getFilterActionString(filterKey) &&
            hs.filters[filterKey].afterSet
          ) {
            hs.filters[filterKey].afterSet(action, hs)
          }
        })
      }
      if (hs.charts) {
        Object.keys(hs.charts).forEach(chartKey => {
          if (
            hook == SubscriptionHook.Before && 
            action.type === hs.getChartDataActionString(chartKey) &&
            hs.charts[chartKey].beforeSet
          ) {
            hs.charts[chartKey].beforeSet(action, hs)
          }
          if (
            hook == SubscriptionHook.After && 
            action.type === hs.getChartDataActionString(chartKey) &&
            hs.charts[chartKey].afterSet
          ) {
            hs.charts[chartKey].afterSet(action, hs)
          }
        })
      }
    }
  }
}
