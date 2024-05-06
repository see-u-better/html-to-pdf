const fs = require('fs')
const { init, tearDown, generator, getBrowserInstance } = require('../server/generator')
const { streamToBuffer } = require('../server/tools')
const { pdfBlobToString } = require('./tools')

describe('testing puppeteer', () => {
    it('should have a working lifecycle', async () => {
        const localBrowser = await init()
        expect(localBrowser).not.toBeNull()
        
        await tearDown()
        const procInfo = await localBrowser.process()
        expect(procInfo?.signalCode).toBeNull()
    })

    it('should work', async () => {
        const pdfBuffer = await generator('https://example.org/test', null, null, { status: 200, body: 'Hello world.' })
        expect(pdfBuffer).toBeInstanceOf(Buffer)

        const fixturePdf = fs.readFileSync('fixtures/test.pdf')
        const streamContent = await pdfBlobToString(pdfBuffer)
        const fixtureContent = await pdfBlobToString(fixturePdf)
        expect(streamContent).toEqual(fixtureContent)
    })

    it('should still have the browser alive', async () => {
        // Browser should be auto-instanciated by the generator in the test above
        const browser = getBrowserInstance()
        expect(browser).not.toBeNull()
        await tearDown()
    })
})
