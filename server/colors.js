const colors = {
    reset: '\x1b[0m',
    black: '\x1b[0;30m',
    red: '\x1b[0;31m',
    green: '\x1b[0;32m',
    // brown_orange: '\x1b[0;33m',
    blue: '\x1b[0;34m',
    // purple: '\x1b[0;35m',
    // cyan: '\x1b[0;36m',
    // light_gray: '\x1b[0;37m',
    // dark_gray: '\x1b[1;30m',
    // light_red: '\x1b[1;31m',
    // light_green: '\x1b[1;32m',
    yellow: '\x1b[1;33m',
    // light_blue: '\x1b[1;34m',
    // light_purple: '\x1b[1;35m',
    // light_cyan: '\x1b[1;36m',
    // white: '\x1b[1;37m',
}


colors.grey = colors.light_gray
colors.gray = colors.light_gray

const coloring = function (string, color) {
    return `${colors[color]}${string}${colors.reset}`
}

const color = {
    black: (str) => coloring(str, 'black'),
    green: (str) => coloring(str, 'green'),
    blue: (str) => coloring(str, 'blue'),
    red: (str) => coloring(str, 'red'),
    yellow: (str) => coloring(str, 'yellow'),
}

module.exports = {
    colors,
    color,
}
