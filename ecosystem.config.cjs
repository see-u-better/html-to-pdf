require('dotenv').config()

module.exports = {
    apps: [{
        name: "HtmlToPdf",
        script: "./server/index.js",
        cron_restart: '0 0 * * *',
        env: {
            HOST: process.env.HOST ?? "0.0.0.0",
            PORT: process.env.PORT ?? 3300,
            PDF_HASH_KEY: process.env.PDF_HASH_KEY,
            PUPPETEER_OPTIONS: process.env.PUPPETEER_OPTIONS,
            PUPPETEER_PAGE_OPTIONS: process.env.PUPPETEER_PAGE_OPTIONS,
            FILENAME_QUERY_PARAM: process.env.FILENAME_QUERY_PARAM,
            UNTITLED_FILENAME: process.env.UNTITLED_FILENAME,
            MESSAGES_MISSING_URL: process.env.MESSAGES_MISSING_URL,
            MESSAGES_INVALID_URL: process.env.MESSAGES_INVALID_URL,
            MESSAGES_INVALID_SIGNATURE: process.env.MESSAGES_INVALID_SIGNATURE,
            MESSAGES_ERROR_ON_RETRIEVAL: process.env.MESSAGES_ERROR_ON_RETRIEVAL,
        }
    }]
}
