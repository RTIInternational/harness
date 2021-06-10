// eslint-disable-next-line
const pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);

export default function pages (pages) {
  // if vue in development mode, validate each page file
  if (process.env.NODE_ENV === 'development') {
    for (const Page of pages) {
      validatePageFile(new Page())
    }
  }
  return pages
}

function validatePageFile (page) {
  const base = 'Error in page ' + page.key + ': '
  validateAttributes(page, base)
  validateFilters(page, base)
  validateCharts(page.charts(), base)
  // TODO: Check that filters don't have symbols in them
}

function validateAttributes (page, base) {
  const attributes = [
    'title',
    'key',
    'charts',
    'filters',
    'pageComponent'
  ]
  // check that attributes exist
  for (const attribute of attributes) {
    if (!page[attribute]) {
      throw String(String(base + 'class is missing attribute ' + attribute))
    }
  }
}

function validateFilters (page, base) {
  let filters = page.filters()
  let filterKeys = []
  for (const filterKey in filters) {
    // check that filters do not contain special characters in keys
    if (pattern.test(filterKey)) {
      throw String(base + 'filter key ' + filterKey + ' contains special characters.')
    }
    // check that filters have labels and options
    if (!filters[filterKey].label) {
      throw String(base + 'filter ' + filterKey + ' is missing label')
    }
    if (!filters[filterKey].component) {
      throw String(base + 'filter ' + filterKey + ' is missing component')
    }
    // check that all options have unique keys and no special characters
    let optionKeys = []
    for (const option of filters[filterKey].options) {
      // if(pattern.test(option.key)){
      //     throw String(base + 'filter ' + filterKey + ' option ' + option.key + ' contains special characters')
      // }
      if (optionKeys.includes(option.key)) {
        throw String(base + 'filter ' + filterKey + ' option ' + option.key + ' is not unique')
      }

      optionKeys.push(option.key)
    }
    if (filterKey in filterKeys) {
      throw String(base + 'filter ' + filterKey + ' is not unique')
    }
    filterKeys.push(filterKey)
  }
}

function validateCharts (charts, base) {
  let chartKeys = []
  for (const chartKey in charts) {
    if (pattern.test(chartKey)) {
      throw String(base + 'chart ' + chartKey + ' contains special characters')
    }
    if (chartKey in chartKeys) {
      throw String(base + 'chart ' + chartKey + ' is not unique')
    }
    chartKeys.push(chartKey)
    if (!charts[chartKey].component) {
      throw String(base + 'chart ' + chartKey + ' missing component')
    }
    if (!charts[chartKey].props) {
      throw String(base + 'chart ' + chartKey + ' missing component props')
    }
  }
}
