const crypto = require('crypto')
const { exit } = require('process')

const server    = 'http://localhost:3300'
const key       = 'xxxxxxxxxxxxxx' // replace this by the The PDF_HASH_KEY set in your .env file
const url       = process.argv[2] ??'https://example.org'
const filename  = process.argv[3] ?? 'mon-file.pdf'


// Generates the signature
const signature = crypto
    .createHmac('sha256', key)
    .update(url)
    .digest("hex")

// Generates the link to download the PDF
const signedUrl = server
    + '?url=' + encodeURIComponent(url)
    + '&name=' + filename
    + '&hash=' + signature

console.log(`GET ${signedUrl}`)
