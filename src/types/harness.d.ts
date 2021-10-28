import VueRouter from "vue-router";
import { ActionPayload, Store } from 'vuex';
import Vue from 'vue'

export interface HarnessOptions {
  pages: PageConstructable[];
  store: Store<any>;
  router: VueRouter;
}

export interface PageConstructable {
  new(): PageObj,
}
export interface FilterOption {
  key: string
}
export interface Filter {
  label: string,
  component: Vue,
  options: FilterOption[],
  beforeSet: (action:ActionPayload, hs:any) => void,
  afterSet: (action:ActionPayload, hs:any) => void,
}
export interface Filters {
  [filterName: string]: Filter
}
export interface Chart {
  component: Vue,
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
  pageComponent: typeof Vue,
  pageProps?: object,
  retrieveData?: (state:HarnessPageState, pageObj:PageObj, hs:any) => Promise<any>,
  beforeLoadData?: (action:ActionPayload, hs:any) => void
  afterLoadData?: (action:ActionPayload, hs:any) => void
  beforeSet: Function,
  afterSet: Function
}
