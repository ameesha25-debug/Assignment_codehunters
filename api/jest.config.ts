import type { Config } from 'jest';

const config: Config = {
preset: 'ts-jest',
testEnvironment: 'node',
transform: { '^.+\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
};

export default config;