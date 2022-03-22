import { Router } from 'vue-router'
import { ActionPayload, Store } from 'vuex'
import { Component } from 'vue';

export interface FilterOption {
  key: string
}
export interface Filter {
  label: string,
  component: Component,
  options: FilterOption[],
  beforeSet: (action:ActionPayload, hs:any) => void,
  afterSet: (action:ActionPayload, hs:any) => void,
}
export interface Filters {
  [filterName: string]: Filter
}
export interface Chart {
  component: Component,
  props: object
  beforeSet: (action:ActionPayload, hs:any) => void,
  afterSet: (action:ActionPayload, hs:any) => void,
}
export interface Charts {
  [chartName: string]: Chart
}
export type HarnessPageState = {
  page: PageObj,
  filters: Filters,
  charts: Charts,
  request_cache: object | null,
  data_loading: boolean
} & {
  [key: string]: any
}

export interface PageObj {
  title: string,
  key: string,
  charts: () => Charts,
  filters: () => Filters,
  pageComponent: Component,
  pageProps?: object,
  retrieveData?: (state:object, pageObj:PageObj, hs:any) => Promise<any>,
  beforeLoadData?: (action:ActionPayload, hs:any) => void
  afterLoadData?: (action:ActionPayload, hs:any) => void
  beforeSet: Function,
  afterSet: Function
}

export interface PageConstructable {
  new(): PageObj,
}
export interface HarnessOptions {
  pages: PageConstructable[];
  store: Store<any>;
  router: Router;
}
