const crypto = require('crypto')

const server    = 'http://localhost:3300'
const key       = process.argv[2] ?? 'xxxxxxxxxxxxxx' // replace this by the The PDF_HASH_KEY set in your .env file
const url       = process.argv[3] ?? 'https://example.org'
const filename  = process.argv[4] ?? 'my-file'
const paramName = process.argv[5] ?? 'name'


// Generates the signature
const signature = crypto
    .createHmac('sha256', key)
    .update(url)
    .digest("hex")

// Generates the link to download the PDF
const signedUrl = server
    + '?url=' + encodeURIComponent(url)
    + '&' + paramName + '=' + filename
    + '&hash=' + signature

console.log(`GET ${signedUrl}`)
