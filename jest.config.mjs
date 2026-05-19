import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  clearMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js", "<rootDir>/tests/**/*.test.tsx"]
};

export default createJestConfig(customJestConfig);
