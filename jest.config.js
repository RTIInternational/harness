module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue',
    'ts',
    'tsx'
  ],

  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest'
  },

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  snapshotSerializers: [
    'jest-serializer-vue'
  ],

  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],

  testURL: 'http://localhost/',
  testEnvironment: 'jsdom',

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // setupTestFrameworkScriptFile: '<rootDir>/tests/unit/setupTests.js',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,vue}'],

  globals: {
    'ts-jest': {
      babelConfig: true
    }
  }
}
