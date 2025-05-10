/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1'
    },
    testTimeout: 30000, // Set global timeout to 30 seconds
    verbose: true,
    detectOpenHandles: true,
    forceExit: true
}; 