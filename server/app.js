const { checkWebURL } = require('node-uri')
const express = require('express')
const app = express()

const MESSAGES = require('./messages')
const { generator } = require('./generator')
const { parseUrl, signUrl, diffInSeconds } = require('./tools')
const { color } = require('./colors')

const isTest = process.env.NODE_ENV == 'test'
const hashKey = process.env.PDF_HASH_KEY
const untitledFilename = process.env.UNTITLED_FILENAME
const filenameQueryParam = process.env.FILENAME_QUERY_PARAM ?? 'name'
const puppeteerOptions = JSON.parse(process.env.PUPPETEER_OPTIONS ?? '{}')
const puppeteerPageOptions = JSON.parse(process.env.PUPPETEER_PAGE_OPTIONS ?? '{}')

app.get('/health', function (req, res) {
    return res.status(200)
        .send({
            health: "ok",
        })
})

app.get('/', async function (req, res) {
    const url = parseUrl(req.query.url)
    const hash = req.query.hash ?? null
    const filename = req.query?.[filenameQueryParam] ?? untitledFilename ?? 'untitled'
    const start = new Date()

    if (!url) {
        return res.status(400)
            .send({
                error: MESSAGES.MISSING_URL,
            })
    }

    const computedSignature = signUrl(url, hashKey)
    if (computedSignature != hash) {
        return res
            .status(400)
            .send({ error: MESSAGES.INVALID_SIGNATURE })
    }

    try {
        checkWebURL(url)
    } catch (e) {
        return res.status(400)
            .send({ error: MESSAGES.INVALID_URL })
    }
    console.info('')
    console.info(color.blue('[i] ') + MESSAGES.GENERATING_FOR_URL.replace(':url', color.blue(url)));
    let testData = null
    if (isTest) {
        testData = (req.query.status == 200)
            ? { status: 200, body: 'Hello world.' }
            : { status: +req.query.status, body: req.query.body ?? null, error: req.query.error ?? null }
    }

    try {
        const pdfStream = await generator(url, puppeteerOptions, puppeteerPageOptions, testData)
        res.setHeader('Content-Disposition', 'attachment;filename="' + filename + '.pdf"')
        res.setHeader('Content-Type', 'application/pdf')
        pdfStream.pipe(res)
        const end = new Date()
        const duration = diffInSeconds(start, end)
        console.info(color.green('[√] ') + MESSAGES.DONE_IN_SECONDS.replace(':duration', color.red(duration)));
    } catch (error) {
        console.error('Error generating the PDF', { error })
        res.status(error.statusCode)
            .send({ error: MESSAGES[error.message] ?? error.message })
    }
    return res
})

module.exports = app
