/* eslint-disable no-console */

import Vue from "vue";
import { PageConstructable, PageObj, Charts } from "./types/harness";

// eslint-disable-next-line
const pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);

export default function pages (pages: PageConstructable[]) {
  // if vue in development mode, validate each page file
  if (process.env.NODE_ENV === 'development') {
    for (const Page of pages) {
      validatePageFile(new Page())
    }
  }
  return pages
}

function validatePageFile (page:PageObj) {
  const baseErrMsg = 'Error in page ' + page.key + ': '
  validateAttributes(page, baseErrMsg)
  validateFilters(page, baseErrMsg)
  validateCharts(page.charts(), baseErrMsg)
  // TODO: Check that filters don't have symbols in them
}

function validateAttributes (page:PageObj, baseErrMsg:string) {
  const attributes = [
    'title',
    'key',
    'charts',
    'filters',
    'pageComponent'
  ]
  // check that attributes exist
  for (const attribute of attributes) {
    if (!page.hasOwnProperty(attribute)) {
      console.warn(String(baseErrMsg + 'class is missing attribute ' + attribute))
    }
  }
}

function validateFilters (page:PageObj, baseErrMsg:string) {
  let filters = page.filters()
  let filterKeys = []
  for (const filterKey in filters) {
    // check that filters do not contain special characters in keys
    if (pattern.test(filterKey)) {
      console.warn(baseErrMsg + 'filter key ' + filterKey + ' contains special characters.')
    }
    // check that filters have labels and options
    if (!filters[filterKey].label) {
      console.warn(baseErrMsg + 'filter ' + filterKey + ' is missing label')
    }
    if (!filters[filterKey].component) {
      console.warn(baseErrMsg + 'filter ' + filterKey + ' is missing component')
    }
    // check that all options have unique keys and no special characters
    let optionKeys:string[] = []
    for (const option of filters[filterKey].options) {
      // if(pattern.test(option.key)){
      //     console.warn(base + 'filter ' + filterKey + ' option ' + option.key + ' contains special characters')
      // }
      if (optionKeys.includes(option.key)) {
        console.warn(baseErrMsg + 'filter ' + filterKey + ' option ' + option.key + ' is not unique')
      }

      optionKeys.push(option.key)
    }
    if (filterKey in filterKeys) {
      console.warn(baseErrMsg + 'filter ' + filterKey + ' is not unique')
    }
    filterKeys.push(filterKey)
  }
}

function validateCharts (charts:Charts, baseErrMsg:string) {
  let chartKeys = []
  for (const chartKey in charts) {
    if (pattern.test(chartKey)) {
      console.warn(baseErrMsg + 'chart ' + chartKey + ' contains special characters')
    }
    if (chartKey in chartKeys) {
      console.warn(baseErrMsg + 'chart ' + chartKey + ' is not unique')
    }
    chartKeys.push(chartKey)
    if (!charts[chartKey].component) {
      console.warn(baseErrMsg + 'chart ' + chartKey + ' missing component')
    }
    if (!charts[chartKey].props) {
      console.warn(baseErrMsg + 'chart ' + chartKey + ' missing component props')
    }
  }
}
