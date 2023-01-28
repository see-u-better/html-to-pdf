const { Buffer, Blob } = require('buffer')
const statuses = require('statuses')
const puppeteer = require('puppeteer')
const { color } = require('./colors')
const { httpException, trimTrailingSlash } = require('./tools')
const { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions, PDFOptions } = puppeteer

/**
 * @param {String} url
 * @param {LaunchOptions|BrowserLaunchArgumentOptions|BrowserConnectOptions} puppeteerOptions 
 * @param {PDFOptions} puppeteerPageOptions 
 * @returns {Promise<Readable>|Promise<httpException>}
 *   Resolves to a stream
 *   Rejects with a 504 when the URL cannot be open, or the status code of the URL if 4xx or 5xx
 */
async function generator(url, puppeteerOptions = {}, puppeteerPageOptions = {}, testData = null) {
    const proxied = [200, 201]
    const options = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        ...puppeteerOptions,
    }
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
    const browser = await puppeteer.launch(options)
    const page = await browser.newPage()
    await page.setCacheEnabled(false);

    let error = null
    if (testData) {
        testData.status = statuses[`${testData.status}`] ? testData.status : 500
        page.setRequestInterception(true)
        page.setDefaultNavigationTimeout(10 * 1000)
        page.on('request', interceptedRequest => {
            if (testData.error) {
                interceptedRequest.abort(testData.error) 
            } else {
                interceptedRequest.respond({
                    status: testData.status,
                    contentType: testData.contentType ?? 'text/plain',
                    body: testData.body ?? statuses[`${testData.status}`] 
                });
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
        await browser.close()
        throw new httpException('INVALID_URL', 400)
    }

    // Proxying page response errors
    if (error) {
        const errorMessage = statuses[`${error}`]
        console.error('The page gave us an error response', { url, error, errorMessage })
        await browser.close()
        throw new httpException(errorMessage, error)
    }

    const pdfStream = page.createPDFStream(pageOptions)
    const stream = await pdfStream
    stream.on('close', async () => await browser.close())
    return stream
}

module.exports = {
    generator,
}
