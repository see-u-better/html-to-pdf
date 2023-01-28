module.exports = {
    clearMocks: true,
    coverageProvider: "v8",
    coveragePathIgnorePatterns: ["/node_modules/", "tools.js"],
    setupFilesAfterEnv: ["jest-expect-message", "./test/config.js"],
}
