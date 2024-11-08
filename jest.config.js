/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
