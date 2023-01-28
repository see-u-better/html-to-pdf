const jestConsole = console;
const originalConsole = require('console')

beforeEach(() => {
    global.console = {
        ...originalConsole,
        info: () => {},
        warn: () => {},
        error: () => {},
    };
});

afterEach(() => {
    global.console = jestConsole;
});
