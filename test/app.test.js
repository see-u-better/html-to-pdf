process.env.PDF_HASH_KEY = 'test-1234'
process.env.NODE_ENV = 'test'

const fs = require('fs')
const server = require('../server/app')
const messages = require('../server/messages')
const request = require("supertest")
const { signUrl } = require('../server/tools')
const { pdfBlobToString } = require('./tools')


describe("testing health endpoint", () => {
    it("should return 200:OK", async () => {
        const url = '/health'
        const response = await request(server).get(url)
        expect(response.statusCode, `${url} : ${response.status} : ${response.body}`).toBe(200)
        expect(response.body).toMatchObject({ "health": "ok" })
    })
})

describe("testing main endpoint", () => {
    it("should return 400: MISSING_URL", async () => {
        const url = '/'
        const response = await request(server).get(url)
        expect(response.statusCode, `${url} : ${response.status} : ${response.body}`).toBe(400)
        expect(response.body, `/: ${response.status} : ${response.body}`).toMatchObject({ "error": messages.MISSING_URL })
    })

    it("should fail with a 400: INVALID_SIGNATURE", async () => {
        const url1 = '/?url=https://example.org'
        const url2 = '/?url=https://example.org&hash=xyz'

        const response1 = await request(server).get(url1)
        expect(response1.statusCode, `${url1} : ${response1.status} : ${response1.body}`).toBe(400)
        expect(response1.body).toMatchObject({ "error": messages.INVALID_SIGNATURE })
        
        const response2 = await request(server).get(url2)
        expect(response2.statusCode, `${url2} : ${response2.status} : ${response2.body}`).toBe(400)
        expect(response2.body).toMatchObject({ "error": messages.INVALID_SIGNATURE })
    })

    it("should fail with a 400: INVALID_URL", async () => {
        const hashKey = process.env.PDF_HASH_KEY
        const url = 'http://exam?pl#e?.éf';
        const hash = signUrl(url, hashKey)
        const query = `?url=${encodeURIComponent(url)}&hash=${encodeURIComponent(hash)}`
        const response = await request(server).get(`/${query}`)
        expect(response.statusCode, `${url} : ${response.status} : ${JSON.stringify(response.body) }`).toBe(400)
        expect(response.body).toMatchObject({ "error": messages.INVALID_URL })
    })

    it("should work", async () => {
        const hashKey = process.env.PDF_HASH_KEY
        const url = 'https://example.org';
        const hash = signUrl(url, hashKey)
        const query = `?url=${encodeURIComponent(url)}&hash=${encodeURIComponent(hash)}&name=test-filename`
        const response = await request(server).get(`/${query}&status=200`)
        
        expect(response.statusCode, `${url} : ${response.status} : ${JSON.stringify(response.body)}`).toBe(200)
        expect(response.headers['content-disposition']).toBe('attachment;filename="test-filename.pdf"')
        expect(response.headers['content-type']).toBe('application/pdf')

        const fixturePdf = fs.readFileSync('fixtures/test.pdf')
        const fixtureContent = await pdfBlobToString(fixturePdf)
        const streamContent = await pdfBlobToString(response.body)
        expect(streamContent).toEqual(fixtureContent)
    })

    const hashKey = process.env.PDF_HASH_KEY
    const url = 'https://example.org';
    const hash = signUrl(url, hashKey)
    const query = `?url=${encodeURIComponent(url)}&hash=${encodeURIComponent(hash)}&name=test-filename`

    it("should fail when the URL can't be opened", async () => {
        const response = await request(server).get(`/${query}&error=addressunreachable`)
        expect(response.statusCode, `${url} : ${response.status} : ${JSON.stringify(response)}`).toBe(400)
        expect(response.body).toMatchObject({ "error": messages.INVALID_URL })
    })
    it("should proxy the URL error", async () => {
        const response = await request(server).get(`/${query}&status=404`)
        expect(response.statusCode, `${url} : ${response.status} : ${JSON.stringify(response)}`).toBe(404)
        expect(response.body).toMatchObject({ "error": "Not Found" })
    })
    it("should proxy the unknown URL errors", async () => {
        const response = await request(server).get(`/${query}&status=499`)
        expect(response.statusCode, `${url} : ${response.status} : ${JSON.stringify(response)}`).toBe(500)
        expect(response.body).toMatchObject({ "error": "Internal Server Error" })
    })
})
