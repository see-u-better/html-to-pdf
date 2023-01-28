const fs = require('fs')
const { generator } = require('../server/generator')
const { streamToBuffer } = require('../server/tools')
const { pdfBlobToString } = require('./tools')

describe('testing puppeteer', () => {
    it('should work', async () => {

        const pdfStream = await generator('https://example.org/test', null, null, { status: 200, body: 'Hello world.' })
        const blobItem = await streamToBuffer(pdfStream)
        const streamContent = await pdfBlobToString(blobItem)
        
        const fixturePdf = fs.readFileSync('fixtures/test.pdf')
        const fixtureContent = await pdfBlobToString(fixturePdf)
        expect(streamContent).toEqual(fixtureContent)
    })
})
