/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect', 
    '@testing-library/react/dont-cleanup-after-each'
  ]
};