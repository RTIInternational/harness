
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import harness, { Hs } from '../../src/harness'
import pages from './mocks/pages/manifest'
import { createLocalVue } from '@vue/test-utils'

// creating vue instance with test pages/harness mocked
const page = new pages[0]()

function mockHs () {
  const localVue = createLocalVue()
  localVue.use(VueRouter)
  localVue.use(Vuex)
  const store = new Vuex.Store()
  const router = new VueRouter()
  localVue.use(harness, { store, router, pages })
  return new Hs(page.key, store)
}

describe('DV Helper Init', () => {
  it('Initializes Succesfully', () => {
    let hs = mockHs()
    expect(hs).toBeTruthy()
  })
  it('Has charts', () => {
    let hs = mockHs()
    expect(hs.charts).toEqual(page.charts())
  })
  it('Has filters', () => {
    let hs = mockHs()
    expect(hs.filters).toEqual(page.filters())
  })
  it('Maps chart getters', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      expect(hs[chartKey + 'ChartData']).toBeTruthy()
    })
  })
  it('Maps filter getters', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs[filterKey + 'Filter']).toBeTruthy()
    })
  })
})

describe('DV Filter functions', () => {
  it('Can Validate Filter Keys', () => {
    let hs = mockHs()
    expect(() => { hs._validFilterKey('filter1') }).not.toThrow()
    expect(() => { hs._validFilterKey('not a filter key') }).toThrow()
  })
  it('Can Get Filter Object', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs.getFilterObject(filterKey)).toEqual(hs.filters[filterKey])
    })
  })
  it('Can Get Filter', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs.getFilter(filterKey)).toEqual('default')
    })
  })
  it('Can Set Filter', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      hs.setFilter(filterKey, 'Testing set filter')
      expect(hs.getFilter(filterKey)).toEqual('Testing set filter')
    })
  })
  it('Can Get Filter Mutation String', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      let expected = page.key + '/SET_' + filterKey.toUpperCase() + '_FILTER'
      expect(hs.getFilterMutationString(filterKey)).toEqual(expected)
    })
  })
  it('Can Get Filter Action String', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      let expected = page.key + '/SET_' + filterKey.toUpperCase() + '_FILTER'
      expect(hs.getFilterMutationString(filterKey)).toEqual(expected)
    })
  })
  it('Can Get Filter Props', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs.getFilterProps(filterKey)).toEqual({ 'test': true })
    })
  })
  it('Can Get Filter Label', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs.getLabel(filterKey)).toEqual(page.filters()[filterKey].label)
    })
  })
  it('Can Get Options For Filter', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs.getOptionsForFilter(filterKey)).toEqual(page.filters()[filterKey].options)
    })
  })
  it('Can Set Options For Filter', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      let testOptions = [{ 'key': 'test', 'label': 'Test', 'default': true }]
      hs.setOptionsForFilter(filterKey, testOptions)
      expect(hs.getOptionsForFilter(filterKey)).not.toEqual(page.filters()[filterKey].options)
      expect(hs.getOptionsForFilter(filterKey)).toEqual(testOptions)
    })
  })
  it('Can Set Default Option', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      let testOptions = [
        { 'key': 'test1', 'label': 'Test 1' },
        { 'key': 'test2', 'label': 'Test 2', 'default': true }
      ]
      hs.setOptionsForFilter(filterKey, testOptions, true)
      expect(hs.getFilter(filterKey)).toEqual('test2')
    })
  })
  it('Can Get Label for Option Key', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      page.filters()[filterKey].options.forEach(option => {
        expect(hs.getLabelForOptionKey(filterKey, option.key)).toEqual(option.label)
      })
    })
  })
  it('Can Get Label for Option Key', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      page.filters()[filterKey].options.forEach(option => {
        hs.setFilter(filterKey, option.key)
        expect(hs.getLabelForSelectedOption(filterKey, option.key)).toEqual(option.label)
      })
    })
  })
  it('Can Disable Option', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      page.filters()[filterKey].options.forEach(option => {
        hs.disableOptions(filterKey, [option.key])
        let options = hs.getOptionsForFilter(filterKey)
        let disabledOption = options.filter(opt => opt.key === option.key)[0]
        expect(disabledOption.disabled).toEqual(true)
      })
    })
  })
  it('Can Enable Option', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      page.filters()[filterKey].options.forEach(option => {
        hs.enableOptions(filterKey, [option.key])
        let options = hs.getOptionsForFilter(filterKey)
        let disabledOption = options.filter(opt => opt.key === option.key)[0]
        expect(disabledOption.disabled).toEqual(false)
      })
    })
  })
  it('Can Hide Option', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      page.filters()[filterKey].options.forEach(option => {
        hs.hideOptions(filterKey, [option.key])
        let options = hs.getOptionsForFilter(filterKey)
        let hiddenOption = options.filter(opt => opt.key === option.key)[0]
        expect(hiddenOption.hidden).toEqual(true)
      })
    })
  })
  it('Can Show Option', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      page.filters()[filterKey].options.forEach(option => {
        hs.showOptions(filterKey, [option.key])
        let options = hs.getOptionsForFilter(filterKey)
        let shownOption = options.filter(opt => opt.key === option.key)[0]
        expect(shownOption.hidden).toEqual(false)
      })
    })
  })

  // TODO: Test for getFilterDefault
  // TODO: Test for getFilterDefaultLabel

  it('Can Check if a filter is dirty', () => {
    let hs = mockHs()
    Object.keys(page.filters()).forEach(filterKey => {
      expect(hs.isFilterDirty(filterKey)).toBeFalsy()
      hs.setFilter(filterKey, 'Dirty')
      expect(hs.isFilterDirty(filterKey)).toBeTruthy()
    })
  })

  it('Can Check if any filters are dirty', () => {
    let hs = mockHs()
    expect(hs.areFiltersDirty()).toBeFalsy()
    Object.keys(page.filters()).forEach(filterKey => {
      hs.setFilter(filterKey, 'Dirty')
      expect(hs.areFiltersDirty()).toBeTruthy()
    })
  })

  it('Can get dirty filters', () => {
    let hs = mockHs()
    expect(hs.areFiltersDirty()).toBeFalsy()
    hs.setFilter('filter1', 'filter1option2')
    expect(hs.getDirtyFilters()).toEqual(['filter1'])
  })
})

describe('DV Chart functions', () => {
  it('Can Validate Chart Keys', () => {
    let hs = mockHs()
    expect(() => { hs._validChartKey('testchart1') }).not.toThrow()
    expect(() => { hs._validChartKey('not a chart key') }).toThrow()
  })
  it('Can Get Chart Object', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      expect(hs.getChartObject(chartKey)).toEqual(hs.charts[chartKey])
    })
  })
  it('Can Get Chart Data', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      expect(hs.getChartData(chartKey)).toEqual(null)
    })
  })
  it('Can Set Chart Data', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      hs.setChartData(chartKey, 'Testing set chart data')
      expect(hs.getChartData(chartKey)).toEqual('Testing set chart data')
    })
  })
  it('Can Get Chart Mutation String', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      let expected = page.key + '/SET_' + chartKey.toUpperCase() + '_CHART_DATA'
      expect(hs.getChartDataMutationString(chartKey)).toEqual(expected)
    })
  })
  it('Can Get Chart Action String', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      let expected = page.key + '/SET_' + chartKey.toUpperCase() + '_CHART_DATA'
      expect(hs.getChartDataMutationString(chartKey)).toEqual(expected)
    })
  })
  it('Can Get Chart Props', () => {
    let hs = mockHs()
    Object.keys(page.charts()).forEach(chartKey => {
      expect(hs.getChartProps(chartKey)).toEqual(page.charts()[chartKey].props)
    })
  })
  it('Can Generate CSV', async () => {
    let hs = mockHs()
    let testChart3Data = [
      { 'testchart3': 'success' }
    ]
    hs.setChartData('testchart3', testChart3Data)
    expect(hs.getChartProps('testchart3').chartTitle).toEqual('Test Chart 3')
    // eslint-disable-next-line no-useless-escape
    expect(hs.generateCSV('testchart3')).toEqual('testchart3\n\"success\"')
  })
  // TODO: Test for downloadCsv
})

describe('DV Lifecycle functions', () => {
  it('Can Load Data', async () => {
    let hs = mockHs()
    hs.store.dispatch = jest.fn(() => Promise.resolve({}))
    hs.loadData()
    expect(hs.store.dispatch).toHaveBeenCalledWith(hs.pageKey + '/LOAD_DATA')
  })
  it('Can Clear Data', async () => {
    let hs = mockHs()
    hs.store.dispatch = jest.fn(() => Promise.resolve({}))
    hs.clearData()
    expect(hs.store.dispatch).toHaveBeenCalledWith(hs.pageKey + '/CLEAR_DATA')
  })
  it('Can Initialize Defaults', async () => {
    let hs = mockHs()
    hs.store.dispatch = jest.fn(() => Promise.resolve({}))
    hs.initializeDefaults()
    expect(hs.store.dispatch).toHaveBeenCalledWith(hs.pageKey + '/INITIALIZE_DEFAULTS', undefined)
  })
  // TODO: Add tests for defaults-related functionality
  it('Can Initialize Defaults For All Filters', async () => {
    let hs = mockHs()
    hs.setFilter('filter1', 'filter1option2')
    hs.setFilter('filter2', 'filter2option2')
    hs.initializeDefaults()
    expect(hs.isFilterDirty('filter1')).toBeFalsy()
    expect(hs.isFilterDirty('filter2')).toBeFalsy()
  })
  it('Can Initialize Defaults For Selected Filters', async () => {
    let hs = mockHs()
    hs.setFilter('filter1', 'filter1option2')
    hs.setFilter('filter2', 'filter2option2')
    hs.initializeDefaults(['filter1'])
    expect(hs.isFilterDirty('filter1')).toBeFalsy()
    expect(hs.isFilterDirty('filter2')).toBeTruthy()
  })

  it('Can Get and Set Request Cache', async () => {
    let hs = mockHs()
    hs.setRequestCache('Testing')
    expect(hs.getRequestCache()).toEqual('Testing')
  })
})

describe('DV Data Helpers', () => {
  let dataArray = [{ 'test': 'one' }, { 'test': 'one' }, { 'test': 'two' }, { 'test': 'three' }, { 'test': 'four' }]
  let dataArrayNum = [{ 'test': 1 }, { 'test': 1 }, { 'test': 2 }, { 'test': 3 }, { 'test': 4 }]
  let dataArrayFlat = [1, 2, 1, 3, 4, 2, 3, 4]
  let dataArrayInvalid = [0, 1, 1.01, true, false, NaN, Infinity, '1', '1.01', new Date()]
  it('Can Validate Data', () => {
    let hs = mockHs()

    // test with bad input
    let objectBad = {}
    let numberBad = 0
    let booleanBad = true
    expect(() => { hs._validateData(objectBad) }).toThrow()
    expect(() => { hs._validateData(numberBad) }).toThrow()
    expect(() => { hs._validateData(booleanBad) }).toThrow()

    // test with array input
    expect(hs._validateData(dataArray)).toEqual(dataArray)

    // test with string input
    hs.setChartData('testchart1', dataArray)
    expect(hs._validateData('testchart1')).toEqual(dataArray)

    // test returns flat
    hs.setChartData('testchart1', dataArray)
    expect(hs._validateData('testchart1', 'test')).toEqual(['one', 'one', 'two', 'three', 'four'])
  })

  it('Can Validate Numbers', () => {
    let hs = mockHs()
    expect(hs._onlyValidNumbers(dataArrayInvalid)).toEqual([0, 1, 1.01])
  })

  it('Can Get Values From Data', () => {
    let hs = mockHs()
    // test with data
    expect(hs.getValues(dataArray, 'test')).toEqual(['one', 'one', 'two', 'three', 'four'])
    // test with string
    hs.setChartData('testchart1', dataArray)
    expect(hs.getValues('testchart1', 'test')).toEqual(['one', 'one', 'two', 'three', 'four'])
  })

  it('Can Get Distinct Values From Data', () => {
    let hs = mockHs()
    // test strings
    expect(hs.getDistinctValues(dataArray, 'test')).toEqual(['four', 'one', 'three', 'two'])

    // test flat
    expect(hs.getDistinctValues(dataArrayFlat)).toEqual([1, 2, 3, 4])
    // test nums
    expect(hs.getDistinctValues(dataArrayNum, 'test')).toEqual([1, 2, 3, 4])
    // test map
    const map = ['one', 'two', 'three', 'four']
    expect(hs.getDistinctValues(dataArray, 'test', map)).toEqual(map)
    // test subset map
    let bigMap = [...map, 'five', 'six']
    expect(hs.getDistinctValues(dataArray, 'test', bigMap)).toEqual(map)
  })

  it('Can Apply Filter To Column', () => {
    let hs = mockHs()

    // test with multiple eligible rows
    hs.setFilter('filter1', 'one')
    expect(hs.applyFilterToColumn('filter1', 'test', dataArray)).toEqual([{ 'test': 'one' }, { 'test': 'one' }])

    // test with single eligible row
    hs.setFilter('filter1', 'two')
    expect(hs.applyFilterToColumn('filter1', 'test', dataArray)).toEqual([{ 'test': 'two' }])

    // test with all key
    hs.setFilter('filter1', 'all')
    expect(hs.applyFilterToColumn('filter1', 'test', dataArray, 'all')).toEqual(dataArray)
  })

  it('Can Get Min', () => {
    let hs = mockHs()
    // test with arrays
    // test with flat data array
    expect(hs.getMin(dataArrayFlat)).toEqual(1)
    // test with column
    expect(hs.getMin(dataArrayNum, 'test')).toEqual(1)

    // test with strings
    hs.setChartData('testchart1', dataArrayFlat)
    expect(hs.getMin('testchart1')).toEqual(1)
    hs.setChartData('testchart1', dataArrayNum)
    expect(hs.getMin('testchart1', 'test')).toEqual(1)
  })

  it('Can Get Max', () => {
    let hs = mockHs()
    // test with arrays
    // test with flat data array
    expect(hs.getMax(dataArrayFlat)).toEqual(4)
    // test with column
    expect(hs.getMax(dataArrayNum, 'test')).toEqual(4)

    // test with strings
    hs.setChartData('testchart1', dataArrayFlat)
    expect(hs.getMax('testchart1')).toEqual(4)
    hs.setChartData('testchart1', dataArrayNum)
    expect(hs.getMax('testchart1', 'test')).toEqual(4)
  })

  it('Can Get Median', () => {
    let hs = mockHs()
    let median3 = [1, 2, 3, 4, 5]
    let median3Unsorted = [2, 4, 3, 1, 5]
    let median3dot5 = [1, 2, 3, 4, 5, 6]
    let median3dot5Unsorted = [2, 4, 6, 1, 3, 5]
    let median6 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

    // test with sorted
    expect(hs.getMedian(median3)).toEqual(3)
    hs.setChartData('testchart1', median3)
    expect(hs.getMedian('testchart1')).toEqual(3)

    expect(hs.getMedian(median3dot5)).toEqual(3.5)
    hs.setChartData('testchart1', median3dot5)
    expect(hs.getMedian('testchart1')).toEqual(3.5)

    expect(hs.getMedian(median6)).toEqual(6)
    hs.setChartData('testchart1', median6)
    expect(hs.getMedian('testchart1')).toEqual(6)

    // test with unsorted
    expect(hs.getMedian(median3Unsorted)).toEqual(3)
    expect(hs.getMedian(median3dot5Unsorted)).toEqual(3.5)
  })

  it('Can Get Sum', () => {
    let hs = mockHs()
    expect(hs.getSum(dataArrayFlat)).toEqual(20)
    hs.setChartData('testchart1', dataArrayNum)
    expect(hs.getSum('testchart1', 'test')).toEqual(11)
  })

  it('Can Get Mean', () => {
    let hs = mockHs()
    let mean4 = [2, 6, 4]
    expect(hs.getMean(mean4)).toEqual(4)
    hs.setChartData('testchart1', mean4)
    expect(hs.getMean(mean4)).toEqual(4)
  })

  it('Can Get Geometric Mean', () => {
    let hs = mockHs()
    let geoMean41 = [2, 6, 4]
    expect(hs.getGeometricMean(geoMean41)).toEqual(41.42135623730952)
    hs.setChartData('testchart1', geoMean41)
    expect(hs.getGeometricMean(geoMean41)).toEqual(41.42135623730952)
  })

  it('Can Get Quartiles', () => {
    let hs = mockHs()
    let mockOdd = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    let mockOddObjects = [
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 2 },
      { 'field1': 12, 'field2': 3 },
      { 'field1': 12, 'field2': 4 },
      { 'field1': 12, 'field2': 5 },
      { 'field1': 12, 'field2': 6 },
      { 'field1': 12, 'field2': 7 },
      { 'field1': 12, 'field2': 8 },
      { 'field1': 12, 'field2': 9 },
      { 'field1': 12, 'field2': 10 },
      { 'field1': 12, 'field2': 11 }
    ]
    let mockEven = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    let mockEvenObjects = [
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 2 },
      { 'field1': 12, 'field2': 3 },
      { 'field1': 12, 'field2': 4 },
      { 'field1': 12, 'field2': 5 },
      { 'field1': 12, 'field2': 6 },
      { 'field1': 12, 'field2': 7 },
      { 'field1': 12, 'field2': 8 },
      { 'field1': 12, 'field2': 9 },
      { 'field1': 12, 'field2': 10 }
    ]
    expect(hs.getQuartiles(mockOdd)).toEqual({
      'minimum': 1,
      'lowerQuartile': 3,
      'median': 6,
      'upperQuartile': 9,
      'maximum': 11,
      'IQR': 6
    })
    expect(hs.getQuartiles(mockOddObjects, 'field2')).toEqual({
      'minimum': 1,
      'lowerQuartile': 3,
      'median': 6,
      'upperQuartile': 9,
      'maximum': 11,
      'IQR': 6
    })
    expect(hs.getQuartiles(mockEven)).toEqual({
      'minimum': 1,
      'lowerQuartile': 3,
      'median': 5.5,
      'upperQuartile': 8,
      'maximum': 10,
      'IQR': 5
    })
    expect(hs.getQuartiles(mockEvenObjects, 'field2')).toEqual({
      'minimum': 1,
      'lowerQuartile': 3,
      'median': 5.5,
      'upperQuartile': 8,
      'maximum': 10,
      'IQR': 5
    })
  })

  it('Can Get Outliers', () => {
    let hs = mockHs()
    let mockSingleRowLowerThanGreaterThan = [1, 2, 39, 41, 43, 45, 49, 52, 55, 57, 59, 96, 98]
    let mockSingleRowLowerThanGreaterThanObjects = [
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 2 },
      { 'field1': 12, 'field2': 39 },
      { 'field1': 12, 'field2': 41 },
      { 'field1': 12, 'field2': 43 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 52 },
      { 'field1': 12, 'field2': 55 },
      { 'field1': 12, 'field2': 57 },
      { 'field1': 12, 'field2': 59 },
      { 'field1': 12, 'field2': 96 },
      { 'field1': 12, 'field2': 98 }
    ]
    let mockSingleRowEqualTo = [1, 7, 39, 41, 43, 45, 49, 52, 55, 57, 59]
    let mockSingleRowEqualToObjects = [
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 7 },
      { 'field1': 12, 'field2': 39 },
      { 'field1': 12, 'field2': 41 },
      { 'field1': 12, 'field2': 43 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 52 },
      { 'field1': 12, 'field2': 55 },
      { 'field1': 12, 'field2': 57 },
      { 'field1': 12, 'field2': 59 }
    ]
    expect(hs.getOutliers(mockSingleRowLowerThanGreaterThan)).toEqual([1, 2, 96, 98])
    expect(hs.getOutliers(mockSingleRowLowerThanGreaterThanObjects, 'field2')).toEqual([
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 2 },
      { 'field1': 12, 'field2': 96 },
      { 'field1': 12, 'field2': 98 }
    ])
    expect(hs.getOutliers(mockSingleRowEqualTo)).toEqual([1, 7])
    expect(hs.getOutliers(mockSingleRowEqualToObjects, 'field2')).toEqual([
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 7 }
    ])
  })

  it('Can Remove Outliers', () => {
    let hs = mockHs()
    let mockSingleRowLowerThanGreaterThan = [1, 2, 39, 41, 43, 45, 49, 52, 55, 57, 59, 96, 98]
    let mockSingleRowLowerThanGreaterThanObjects = [
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 2 },
      { 'field1': 12, 'field2': 39 },
      { 'field1': 12, 'field2': 41 },
      { 'field1': 12, 'field2': 43 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 52 },
      { 'field1': 12, 'field2': 55 },
      { 'field1': 12, 'field2': 57 },
      { 'field1': 12, 'field2': 59 },
      { 'field1': 12, 'field2': 96 },
      { 'field1': 12, 'field2': 98 }
    ]
    let mockSingleRowEqualTo = [1, 7, 39, 41, 43, 45, 49, 52, 55, 57, 59]
    let mockSingleRowEqualToObjects = [
      { 'field1': 12, 'field2': 1 },
      { 'field1': 12, 'field2': 7 },
      { 'field1': 12, 'field2': 39 },
      { 'field1': 12, 'field2': 41 },
      { 'field1': 12, 'field2': 43 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 52 },
      { 'field1': 12, 'field2': 55 },
      { 'field1': 12, 'field2': 57 },
      { 'field1': 12, 'field2': 59 }
    ]
    expect(hs.removeOutliers(mockSingleRowLowerThanGreaterThan)).toEqual([39, 41, 43, 45, 49, 52, 55, 57, 59])
    expect(hs.removeOutliers(mockSingleRowLowerThanGreaterThanObjects, 'field2')).toEqual([
      { 'field1': 12, 'field2': 39 },
      { 'field1': 12, 'field2': 41 },
      { 'field1': 12, 'field2': 43 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 52 },
      { 'field1': 12, 'field2': 55 },
      { 'field1': 12, 'field2': 57 },
      { 'field1': 12, 'field2': 59 }
    ])
    expect(hs.removeOutliers(mockSingleRowEqualTo)).toEqual([39, 41, 43, 45, 49, 52, 55, 57, 59])
    expect(hs.removeOutliers(mockSingleRowEqualToObjects, 'field2')).toEqual([
      { 'field1': 12, 'field2': 39 },
      { 'field1': 12, 'field2': 41 },
      { 'field1': 12, 'field2': 43 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 45 },
      { 'field1': 12, 'field2': 52 },
      { 'field1': 12, 'field2': 55 },
      { 'field1': 12, 'field2': 57 },
      { 'field1': 12, 'field2': 59 }
    ])
  })
})
