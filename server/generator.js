const { Buffer, Blob } = require('buffer')
const statuses = require('statuses')
const puppeteer = require('puppeteer')
const { color } = require('./colors')
const { httpException, trimTrailingSlash } = require('./tools')
const { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions, PDFOptions } = puppeteer


let browser = null
let browsingContext = null

async function init(puppeteerOptions = {}) {
    console.info(color.black(`[•] `) + color.green('Init Puppeteer'))
    const options = {
        headless: true,
        args: ['--incognito', '--no-sandbox', '--disable-setuid-sandbox', '--disable-features=site-per-process', '--disable-dev-shm-usage', '--disable-web-security'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? null,
        ...puppeteerOptions,
    }
    browser = await puppeteer.launch(options)
    browsingContext = await browser.createBrowserContext()
    console.info(color.black(`[•] The headless chrome has been `) + color.green('started'))
    console.info(color.black(`[•] With the options : `) + JSON.stringify(options))
    return browser
}

async function tearDown() {
    console.info('')
    try {
        if (browser) {
            console.info(color.black(`[•] Closing `) + color.red('open pages'))
            const pages = await browser.pages();
            for (let i = 0; i < pages.length; i++) {
                await pages[i].close();
            }

            console.info(color.black(`[•] Closing `) + color.red('browser'))
            await browser.close()
            const childProcess = await browser.process()
            if (childProcess) {
                childProcess.kill(9)
            }
        }
    } catch (e) {
        console.log(color.black(`[!] Teardown failed`), e)
    }
    console.info(color.black(`[•] The headless chrome has been `) + color.red('shutdown'))
    browser = null
}

function getBrowserInstance() {
    return browser
}

/**
 * @param {String} url
 * @param {LaunchOptions|BrowserLaunchArgumentOptions|BrowserConnectOptions} puppeteerOptions 
 * @param {PDFOptions} puppeteerPageOptions 
 * @returns {Promise<Buffer>|Promise<httpException>}
 *   Resolves to a stream
 *   Rejects with a 504 when the URL cannot be open, or the status code of the URL if 4xx or 5xx
 */
async function generator(url, puppeteerOptions = {}, puppeteerPageOptions = {}, testData = null) {
    const proxied = [200, 201]
    // const options = {
    //     headless: true,
    //     args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    //     ...puppeteerOptions,
    // }
    const pageOptions = {
        landscape: true,
        printBackground: true,
        format: 'A4',
        margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        },
        ...puppeteerPageOptions,
    }
    if (!browser) {
        await init(puppeteerOptions)
    }
    // const browser = await puppeteer.launch(options)

    const page = await browsingContext.newPage()
    await page.setCacheEnabled(false);

    let error = null
    if (testData) {
        await page.setRequestInterception(true)
        page.setDefaultNavigationTimeout(10 * 1000)
        page.on('request', interceptedRequest => {
            if (interceptedRequest.isInterceptResolutionHandled()) {
                return
            }
            if (testData.error) {
                interceptedRequest.abort(testData.error)
            } else {
                let statusText = "Server Error"
                try {
                    statusText = statuses(`${testData.status}`)
                } catch (e) {}
                interceptedRequest.respond({
                    status: statuses.codes.indexOf(parseInt(testData.status)) > -1
                        ? parseInt(testData.status)
                        : 500,
                    contentType: 'application/json',
                    body: '{ "error": "" }',
                })
            }
        })
    }

    page.on('response', response => {

        console.info(color.green('GET'), response.status(), response.url(), color.black(`[${response.statusText()}]`))
        const normalizedResponseUrl = trimTrailingSlash(response.url())
        const normalizedUrl = trimTrailingSlash(url)
        if (normalizedResponseUrl == normalizedUrl && !error && proxied.indexOf(response.status()) < 0) {
            error = response.status()
        }
    })

    try {
        await page.goto(url, { waitUntil: 'networkidle0' })
    } catch (e) {
        console.error('The page is unreachable', { url, error: e })
        await page.close()
        throw new httpException('INVALID_URL', 400)
    }

    // Proxying page response errors
    if (error) {
        const errorMessage = statuses[`${error}`]
        console.error('The page gave us an error response', { url, error, errorMessage })
        await page.close()
        throw new httpException(errorMessage, error)
    }

    const pdf = await page.pdf({
        printBackground: true,
    })
    await page.close()
    return pdf
}

module.exports = {
    init,
    tearDown,
    generator,
    getBrowserInstance,
}
