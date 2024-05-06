require('dotenv').config()

const { color } = require('./colors')
const server = require('./app')
const { init, tearDown } = require('./generator')

const PORT = process.env.PORT || 3300
const HASH_KEY = process.env.PDF_HASH_KEY ?? null

if (!HASH_KEY) {
    console.error(color.red('[!] HASH KEY MISSING'))
    console.error(color.yellow('The hash key is missing. Did you set PDF_HASH_KEY in .env ?'))
    console.error('')
    throw new Error("The hash key is missing. Did you set PDF_HASH_KEY in .env ?")
}

const message = `
${color.black(`[•] The app has started on`)} ${color.blue(`localhost:${PORT}`)}
${color.black(`[•] It's using this hash key:`)} ${color.yellow(HASH_KEY)}`

process.on('SIGINT', function (type, code) {
    tearDown()
        .catch(e => console.log(`${color.black(`[•] Error during teardown`)} ${color.red(e.message)}`))
        .then(() => process.exit(0))
})

server.listen(PORT, () => {
    console.info(message)
})
