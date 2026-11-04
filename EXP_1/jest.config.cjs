module.exports = {
  // Plain jest-environment-jsdom doesn't expose Fetch API globals
  // (Request/Response/fetch) that MSW needs; jest-fixed-jsdom patches jsdom
  // with Node's native implementations while keeping the DOM for RTL.
  testEnvironment: "jest-fixed-jsdom",
  // msw's `msw/node` subpath only resolves under the "node" export
  // condition; jsdom's default condition set omits it, so it's added
  // explicitly here (see https://mswjs.io/docs/faq#msw-with-jest).
  testEnvironmentOptions: {
    customExportConditions: ["node"],
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },
  moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "json", "node"],
  // Default Jest transform only matches .js/.jsx — extended to .mjs since
  // several of msw's dependencies ship ESM as .mjs files.
  transform: {
    "^.+\\.[mc]?[jt]sx?$": "babel-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  // msw v2's dependency tree (rettime, until-async, @mswjs/*, ...) ships
  // ESM-only builds inside node_modules, and new transitive ESM deps get
  // pulled in with each msw release. Rather than hand-list every package,
  // node_modules is not excluded from transformation at all here so babel
  // can convert whichever of them show up to CommonJS for Jest.
  transformIgnorePatterns: [],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/mocks/**",
  ],
  coverageDirectory: "coverage",
};
