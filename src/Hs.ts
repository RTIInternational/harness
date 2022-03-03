// @ts-nocheck
// TYPE CHECKING IS IGNORED FOR THIS FILE WITH THE ABOVE LINE
// Since much of this file is imported by harness-ui, it needs to be tested along with ui.
// @ts-ignore
import { saveAs } from 'file-saver'
import { mapGetters, mapActions, Store } from 'vuex'
// @ts-ignore
import getDefaultOption from './getDefaultOption'
import { Charts, Filters } from './types/harness'

export default class Hs {
  pageKey:string
  store:Store<any>
  getters:string[]
  actions:string[]
  filters:Filters
  charts:Charts
  _mappedGetters
  _mappedActions
  [key: string]: any

  constructor (pageKey:string, store:Store<any>) {
    this.pageKey = pageKey
    this.store = store
    
    // set initial getters, actions and computed. map filters and charts
    this.getters = ['page', 'requestCache', 'dataLoading']
    this.actions = ['INITIALIZE_DEFAULTS', 'LOAD_DATA', 'CLEAR_ DATA']
    this.filters = this.store.getters[this.pageKey + '/' + 'page'].filters()
    this.charts = this.store.getters[this.pageKey + '/' + 'page'].charts()

    // get getters and actions for each filter
    for (const filterKey in this.store.getters[this.pageKey + '/page'].filters()) {
      this.getters.push(filterKey + 'Filter')
      this.actions.push('SET_' + filterKey.toUpperCase() + '_FILTER')
    }

    // get getters and actions for each chart
    for (const chartKey in this.store.getters[this.pageKey + '/page'].charts()) {
      this.getters.push(chartKey + 'ChartData')
      this.actions.push('SET_' + chartKey.toUpperCase() + '_CHART_DATA')
    }

    // map getters to Hs class
    this._mappedGetters = Object.assign(mapGetters(this.pageKey, this.getters), mapGetters('pages', ['pages']))
    Object.keys(this._mappedGetters).forEach(function (getter:string) {
      this[getter] = this._mappedGetters[getter]
    }.bind(this))

    // map actions to Hs class
    this._mappedActions = mapActions(this.pageKey, this.actions)
    Object.keys(this._mappedActions).forEach(function (action) {
      this[action] = this._mappedActions[action]
    }.bind(this))
  }

  _validateData (data:string|object[], idx = null) {
    if (typeof data === 'string') {
      data = this.getChartData(data)
    }
    if (!data) {
      throw String('Data array is empty')
    }
    if (!Array.isArray(data)) {
      throw String('Data is not an array')
    }
    if (idx) {
      data = this.getValues(data, idx)
    }
    return data
  }

  _validFilterKey (key:string) {
    if (!this.filters.hasOwnProperty(key)) {
      throw String(key + ' is not a valid filter')
    }
  }

  _validChartKey (key:string) {
    if (!this.charts.hasOwnProperty(key)) {
      throw String(key + ' is not a valid chart')
    }
  }

  _onlyValidNumbers (data:any, idx = null) {
    data = this._validateData(data, idx)
    return data.filter((d:number) => {
      const parsed = Number(d)
      return d === parsed && typeof parsed === 'number' && !isNaN(parsed) && isFinite(parsed)
    })
  }

  /**
   * Returns the filter object for a given key
   * @param  {String} key a filter key
   * #
   */
  getFilterObject (key:string) {
    this._validFilterKey(key)
    return this.filters[key]
  }

  /**
   * Returns the value for a given filter
   * @param  {String} key a filter key
   * @memberof module:Filters
   */
  getFilter (key:string) {
    this._validFilterKey(key)
    return this.store.getters[this.pageKey + '/' + key + 'Filter']
  }

  /**
   * Sets a given filter's value
   *
   * @param  {String} key a filter key
   * @param  {any} payload a payload to set
   */
  setFilter (key:string, payload:any) {
    this._validFilterKey(key)
    this.store.dispatch(
      this.pageKey + '/SET_' + key.toUpperCase() + '_FILTER',
      payload
    )
  }

  /**
   * Returns the full mutation string for a given filter. Useful for checking in subscriptions
   * @memberof module:filters
   * @param  {String} key a filter key
   */
  getFilterMutationString (key:string) {
    this._validFilterKey(key)
    return this.pageKey + '/SET_' + key.toUpperCase() + '_FILTER'
  }

  /**
   * Returns the full action string for a given filter. Useful for checking in subscriptions
   *
   * @param  {String} key a filter key
   */
  getFilterActionString (key:string) {
    this._validFilterKey(key)
    return this.getFilterMutationString(key)
  }

  /**
   * returns the props for a given filter, if they exist
   *
   * @param  {String} key a filter key
   */
  getFilterProps (key:string) {
    this._validFilterKey(key)
    return this.filters[key].props
  }

  /**
   * Returns the label for a given filter
   *
   * @param  {String} key a filter key
   */
  getLabel (key:string) {
    this._validFilterKey(key)
    return this.filters[key] ? this.filters[key].label : null
  }

  /**
   * Returns the options array for a given filter
   *
   * @param  {String} key a filter key
   */
  getOptionsForFilter (key:string) {
    this._validFilterKey(key)
    return this.store.getters[this.pageKey + '/' + key + 'Options']
  }

  /**
   * Sets the options for a given filter to the array provided as payload
   *
   * @param  {String} key a filter key
   * @param  {Array} payload a payload to set
   * @param  {Boolean} setOptionToDefault=false optional variable, if true will set the filter default
   */
  setOptionsForFilter (key:string, payload:any, setDefaultOption = false) {
    this._validFilterKey(key)
    this.store.dispatch(
      this.pageKey + '/SET_' + key.toUpperCase() + '_OPTIONS',
      payload
    )

    if (setDefaultOption) {
      this.setFilter(key, this.getFilterDefault(key))
    }
  }

  /**
   * Returns the label for a given option by key
   *
   * @param  {String} filter a filter key
   * @param  {String} key an option key for an option included in the filter
   */
  getLabelForOptionKey (filter, key:string) {
    this._validFilterKey(filter)
    let options = this.getOptionsForFilter(filter) || []
    let option = options.filter(o => {
      return o.key === key
    })[0]
    return option ? option.label : null
  }

  /**
   * Returns the label for a filter's selected option
   *
   * @param  {String} key a filter key
   */
  getLabelForSelectedOption (key:string) {
    this._validFilterKey(key)
    return this.getLabelForOptionKey(key, this.getFilter(key)) || null
  }

  /**
   * Set disabled property to true or false on each filter
   *
   * @param  {String} filter a filter key
   * @param  {Array} optionKeysToSet an array of optionKeys
   * @param  {Boolean} disable whether or not to disable option visibility
   */
  setOptionVisibility (filter, optionKeysToSet, disable) {
    this._validFilterKey(filter)
    let options = this.getOptionsForFilter(filter)
    for (let i = 0; i < options.length; i++) {
      if (optionKeysToSet.includes(options[i].key)) {
        options[i].disabled = disable
      } else if (disable) {
        options[i].disabled = false
      }
    }
    this.setOptionsForFilter(filter, options)
  }

  /**
   * Set disabled property to false for given options
   *
   * @param  {String} filter a filter key
   * @param  {Array} optionKeys an array of optionKeys
   */
  disableOptions (filter:string, optionKeys) {
    this._validFilterKey(filter)
    this.setOptionVisibility(filter, optionKeys, true)
  }

  /**
   * Set disabled property to false for given options
   *
   * @param  {String} filter a filter key
   * @param  {Array} optionKeys an array of optionKeys
   */
  enableOptions (filter:string, optionKeys) {
    this._validFilterKey(filter)
    this.setOptionVisibility(filter, optionKeys, false)
  }

  /**
   * Returns the default option for a given filter
   *
   * @param  {String} key a filter key
   */
  getFilterDefault (key:string) {
    this._validFilterKey(key)
    let filter = this.filters[key]
    let options = this.getOptionsForFilter(key)
    return getDefaultOption(filter, options)
  }

  /**
   * Returns the label for the default option for a given filter
   *
   * @param  {String} key a filter key
   */
  getFilterDefaultLabel (key:string) {
    this._validFilterKey(key)
    return this.getLabelForOptionKey(this.filters[key], this.getFilterDefault(key))
  }

  /**
   * Returns a boolean indicating whether or not the value of this filter is equal to the value of the default. If true, the filter is no longer set to default.
   *
   * @param  {String} key a filter key
   */
  isFilterDirty (key:string) {
    this._validFilterKey(key)
    return JSON.stringify(this.getFilterDefault(key)) !== JSON.stringify(this.getFilter(key))
  }

  /**
   * Returns a boolean indicating whether or not any filters on the page have been set to a value other than their default
   *
   */
  areFiltersDirty () {
    return Object.keys(this.filters).reduce(function (final, filter) {
      if (final === false) {
        return this.isFilterDirty(filter)
      }
      return final
    }.bind(this), false)
  }

  /**
   * Returns an array of filter keys for dirty filters
   *
   */
  getDirtyFilters () {
    return Object.keys(this.filters).filter(function (filter) { return this.isFilterDirty(filter) }.bind(this))
  }

  /**
   * Returns the chart object for a given key
   *
   * @param  {String} key a chart key
   */
  getChartObject (key:string) {
    this._validChartKey(key)
    return this.charts[key]
  }

  /**
   * Returns data for a given chart
   *
   * @param  {String} key a chart key
   */
  getChartData (key:string) {
    this._validChartKey(key)
    return this.store.getters[this.pageKey + '/' + key + 'ChartData']
  }

  /**
   * Sets data for a given chart
   *
   * @param  {String} key a chart key
   */
  setChartData (key:string, payload:any) {
    this._validChartKey(key)
    this.store.dispatch(
      this.pageKey + '/SET_' + key.toUpperCase() + '_CHART_DATA',
      payload
    )
  }

  /**
   * Returns the full mutation string for a given chart. Useful for checking in subscriptions
   *
   * @param  {String} key a chart key
   */
  getChartDataMutationString (key:string) {
    this._validChartKey(key)
    return this.pageKey + '/SET_' + key.toUpperCase() + '_CHART_DATA'
  }

  /**
   * Returns the full action string for a given chart. Useful for checking in subscriptions
   *
   * @param  {String} key a chart key
   */
  getChartDataActionString (key:string) {
    this._validChartKey(key)
    return this.getChartDataMutationString(key)
  }

  /**
   * Returns the props for a given chart if they exist
   *
   * @param  {String} key a chart key
   */
  getChartProps (key:string) {
    this._validChartKey(key)
    return this.charts[key].props
  }

  /**
   * Validates that data is formatted correctly for the downloadCSV function (an array of objects)
   *
   * @param  {any} data the data to be validated. If null, it will not validate (for lifecyle)
   * @param  {} key the key for this data's chart
   */
  validateChartData (data:any[], key:string) {
    this._validChartKey(key)
    if (data) {
      if (!Array.isArray(data)) {
        let msg = 'The processed data for ' + key + ' is not an array.'
        if (!this.getChartProps(key).tableAdapter) {
          msg += ' Please add a tableAdapter function to your chart that processes it for tabular representation.'
        }
        throw String(msg)
      }
      if (data.length < 1) {
        throw String('The processed data for ' + key + ' has no content.')
      }
      data.forEach(row => {
        if (typeof row !== 'object') {
          let msg = 'The processed data for ' + key + ' contains non-object elements.'
          if (!this.getChartProps(key).tableAdapter) {
            msg += ' Please add a tableAdapter function to your chart that processes it for tabular representation.'
          }
          throw String(msg)
        }
      })
    }
    return data
  }

  /**
   * Generates a csv of a given table, optionally formatted through a chart's tableAdapter prop
   *
   * @param  {String} key a chart key
   * @param  {String} returnFormat format to generate the CSV in
   */
  generateCSV (key:string, returnFormat = 'string') {
    this._validChartKey(key)
    try {
      const props = this.getChartProps(key)
      let data = this.getChartData(key)
      if (props.tableAdapter) {
        data = props.tableAdapter(this.charts[key], this.filters, data, this)
      }
      data = this.validateChartData(data, key)
      const keys = Object.keys(data[0])
      let header = keys

      let rows = []
      data.forEach(datum => {
        let row = []
        keys.forEach(key => {
          row.push('"' + String(datum[key]) + '"')
        })
        rows.push(row)
      })
      let csv = header.join(',')
      rows.forEach(row => {
        csv += '\n'
        csv += row.join(',')
      })
      if (returnFormat === 'string') {
        return csv
      } else if (returnFormat === 'blob') {
        return new Blob([csv], { type: 'data:text/csv;charset=utf-8' })
      }
    } catch (error) {
      throw String('There was an error generating a CSV for this given data: ' + String(error))
    }
  }

  /**
   * Downloads a csv of a given table, optionally formatted through a chart's tableAdapter prop.
   * If a chartTitle prop exists, the csv will be generated using that as the file name
   *
   * @param  {String} key a chart key
   */
  downloadCSV (key:string) {
    this._validChartKey(key)
    try {
      let blob = this.generateCSV(key, 'blob')
      saveAs(blob, (this.getChartProps(key).chartTitle || key) + '.csv')
    } catch (error) {
      throw String('There was an error downloading a CSV for this given data: ' + String(error))
    }
  }

  /**
   * @async
   *
   * Dispatches a page's LOAD_DATA action
   */
  loadData () {
    this.store.dispatch(this.pageKey + '/LOAD_DATA')
  }

  /**
   * Dispatches a page's CLEAR_DATA action
   */
  clearData () {
    this.store.dispatch(this.pageKey + '/CLEAR_DATA')
  }

  /**
   * toggles the data_loading state variable
   */
  toggleDataLoading () {
    this.store.dispatch(this.pageKey + '/TOGGLE_DATA_LOADING')
  }

  /**
   * Dispatches a page's INITIALIZE_DEFAULTS action
   *
   * @param  {Array} payload an array of filter keys to initialize to their default value
   */
  initializeDefaults (payload:any) {
    this.store.dispatch(
      this.pageKey + '/INITIALIZE_DEFAULTS',
      payload
    )
  }

  /**
   * Returns the contents of a page's request_cache state attribute
   */
  getRequestCache () {
    return this.store.getters[this.pageKey + '/requestCache']
  }

  /**
   * Sets the given payload to a page's request_cache state attribute
   *
   * @param  {Any} payload
   */
  setRequestCache (payload:any) {
    this.store.dispatch(
      this.pageKey + '/SET_REQUEST_CACHE',
      payload
    )
  }

  /**
   * Returns all values in a given data key/attribute, unsorted
   * @param  {Array/String} data an array of data arrays, or a string representing a chart data key
   * @param  {} idx the key to use for either the object attribute or array column you are trying to get values for
   */
  getValues (data:any, idx:string|number) {
    // TODO: is data really object[]|string? reduce() doesn't exist on String
    data = this._validateData(data)
    return data.reduce((acc, datum) => { acc.push(datum[idx]); return acc }, [])
  }

  /**
   * Returns an array of distinct values from an array of arrays or objects by index. If values are strings or numbers they will be sorted, and if an optional array of values is provided as a map it will be used to sort.
   *
   * @param  {Array/String} data an array of data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the key to use for either the object attribute or array column you are trying to get distinct values for
   * @param  {Array} map=null an array of values to use as an ordering map in sort
   */
  getDistinctValues (data, idx = null, map = null) {
    data = this._validateData(data)
    // extract distinct values
    if (idx) {
      data = this.getValues(data, idx)
    }
    return data.reduce((acc, datum) => {
      if (!acc.includes(datum)) {
        acc.push(datum)
      }
      return acc
    }, [])
      .sort((a, b) => {
        if (map) { // sort by map
          return map.indexOf(a) - map.indexOf(b)
        } else if (typeof a === 'string' && typeof b === 'string') { // sort strings
          return a.localeCompare(b, 'en', { sensitivity: 'base' })
        }
      })
  }
  /**
   * Applies the value(s) of a harness filter to a column in a given set of data and returns the filtered result
   * @param  {String} filter a key representing a harness filter
   * @param  {String/Number} column the column/attribute in the data to apply the filter to
   * @param  {Array/String} data an array of data arrays, or a string representing a chart data key
   * @param  {String} allKey=null a string representing a potential value for "all". If this is variable is present in the filter, the filter is not applied
   */
  applyFilterToColumn (filter:string, column, data, allKey = null) {
    // if data is string, get chart data
    data = this._validateData(data)
    if (!this.getFilter(filter)) {
      throw String('Filter value is empty')
    }

    return data.filter(datum => {
      // handle 'multiple' filters where value is an array
      if (Array.isArray(this.getFilter(filter))) {
        let match = this.getFilter(filter).includes(datum[column])
        if (allKey) {
          return this.getFilter(filter).includes(allKey) || match
        }
        return match
      }
      // handle normal filters with a single value
      let match = this.getFilter(filter) === datum[column]
      if (allKey) {
        return this.getFilter(filter) === allKey || match
      }
      return match
    })
  }
  /**
   * Gets the minimum value from an array of data. If an index is supplied, gets the minimum for that index/attribute in the data. Only includes valid numbers in calculations.
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getMin (data, idx = null) {
    data = this._onlyValidNumbers(data, idx)
    return Math.min(...data)
  }

  /**
   * Gets the maximum value from an array of data. If an index is supplied, gets the maximum for that index/attribute in the data.  Only includes valid numbers in calculations.
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getMax (data, idx = null) {
    data = this._onlyValidNumbers(data, idx)
    return Math.max(...data)
  }

  /**
   * Gets the median of an array of data
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key.  Only includes valid numbers in calculations.
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getMedian (data, idx = null) {
    data = this._onlyValidNumbers(data, idx).sort((a, b) => a - b)
    const midpoint = Math.floor(data.length / 2)
    return data.length % 2 !== 0 ? data[midpoint] : (data[midpoint - 1] + data[midpoint]) / 2
  }

  /**
   * Gets the sum for an array of data.  Only includes valid numbers in calculations.
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getSum (data, idx = null) {
    data = this._onlyValidNumbers(data, idx)
    return data.reduce((acc, datum) => acc + datum)
  }

  /**
   * Gets the mean for an array of data.  Only includes valid numbers in calculations.
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getMean (data, idx = null) {
    data = this._onlyValidNumbers(data, idx)
    return this.getSum(data) / data.length
  }

  /**
   * Gets the geometric mean for an array of data.  Only includes valid numbers in calculations.
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getGeometricMean (data, idx = null) {
    data = this._onlyValidNumbers(data, idx)
    let changePcts = []
    data.forEach((datum, datumIdx) => {
      if ((datumIdx + 1) < data.length) {
        let datum1val = parseInt(datum) || 0
        let datum2val = parseInt(data[datumIdx + 1]) || 0
        if (datum1val && datum2val) { // ignore zeroes
          if (datum1val === datum2val) {
            changePcts.push(1)
          } else {
            let change = datum2val - datum1val
            let pctChange = 1 + ((change * 100 / datum1val) / 100) // convert change percent to decimal relative to 1. ie 3% becomes 1.03, -3% becomes 0.97
            changePcts.push(pctChange)
          }
        }
      }
    })
    let geoMean = changePcts.reduce((acc, pct) => acc * pct, 1) // multiply all change percents, starting with a baseline of 1
    geoMean = Math.pow(geoMean, 1 / changePcts.length) - 1 // get nth root of product n=length
    geoMean = geoMean * 100 // unpack back to a percent
    return geoMean
  }

  /**
   * Gets quartiles for an array of data. Returns in format {minimum, lowerQuartile, median, upperQuartile, maximum, IQR}.  Only includes valid numbers in calculations.
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getQuartiles (data, idx = null) {
    data = this._onlyValidNumbers(data, idx).sort((a, b) => a - b)
    let intervals = [0.25, 0.5, 0.75]
    let quartileIntervals = intervals.reduce((final, interval) => {
      let position = data.length * interval
      let floor = Math.floor(position)

      if (floor === position) {
        final.push((data[floor - 1] + data[floor]) / 2)
      } else {
        final.push(data[floor])
      }
      return final
    }, [])
    return {
      'minimum': this.getMin(data),
      'lowerQuartile': quartileIntervals[0],
      'median': quartileIntervals[1],
      'upperQuartile': quartileIntervals[2],
      'maximum': this.getMax(data),
      'IQR': quartileIntervals[2] - quartileIntervals[0]
    }
  }

  /**
   * Returns truncated dataset with outliers for a given array of data. Outliers are identified as any values that equal or lower than the lower quartile - (1.5 x IQR) or
   * equal to or higher than the upper quartile + (1.5 x IQR).
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  getOutliers (data, idx = null) {
    if (idx) {
      data = this._validateData(data).sort((a, b) => a[idx] - b[idx])
      data = data.filter(datum => {
        const parsed = Number(datum[idx])
        return datum[idx] === parsed && typeof parsed === 'number' && !isNaN(parsed) && isFinite(parsed)
      })
    } else {
      data = this._onlyValidNumbers(data, idx).sort((a, b) => a - b)
    }
    let quartiles = this.getQuartiles(data, idx)
    let lowerBound = quartiles['lowerQuartile'] - (1.5 * quartiles['IQR'])
    let upperBound = quartiles['upperQuartile'] + (1.5 * quartiles['IQR'])
    if (idx) {
      return data.filter(datum => datum[idx] <= lowerBound || datum[idx] >= upperBound)
    } else {
      return data.filter(datum => datum <= lowerBound || datum >= upperBound)
    }
  }

  /**
   * Returns truncated dataset minus outliers for a given array of data. Outliers are identified as any values that equal or lower than the lower quartile - (1.5 x IQR) or
   * equal to or higher than the upper quartile + (1.5 x IQR).
   * @param  {Array/String} data an array of data/data arrays, or a string representing a chart data key
   * @param  {String/Number} idx=null the optional index/attribute in the data to apply the filter to
   */
  removeOutliers (data, idx = null) {
    if (idx) {
      data = this._validateData(data).sort((a, b) => a[idx] - b[idx])
      data = data.filter(datum => {
        const parsed = Number(datum[idx])
        return datum[idx] === parsed && typeof parsed === 'number' && !isNaN(parsed) && isFinite(parsed)
      })
    } else {
      data = this._onlyValidNumbers(data, idx).sort((a, b) => a - b)
    }
    let quartiles = this.getQuartiles(data, idx)
    let lowerBound = quartiles['lowerQuartile'] - (1.5 * quartiles['IQR'])
    let upperBound = quartiles['upperQuartile'] + (1.5 * quartiles['IQR'])
    if (idx) {
      return data.filter(datum => datum[idx] > lowerBound && datum[idx] < upperBound)
    } else {
      return data.filter(datum => datum > lowerBound && datum < upperBound)
    }
  }
}
