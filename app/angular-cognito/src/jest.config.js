/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ['C:\\Users\\maxa\\Documents\\GitHub\\year-long-project-team-18\\app\\angular-cognito\\src'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true,
  coverageThreshold:{
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};