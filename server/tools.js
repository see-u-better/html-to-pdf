const crypto = require('crypto')

/**
 * @param {String|null} url URL to parse
 * @returns {String|null} URI decoded URL, with its protocol fixed
 */
const parseUrl = function (url = null) {
    if (!url) {
        return url
    }
    url = decodeURIComponent(url)
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = 'http://' + url
    }
    return url
}

/**
 * @param {String} url URL to sign
 * @param {String} hashKey Signing key
 * @returns {String} Signature
 */
const signUrl = function (url, hashKey) {
    return crypto.createHmac('sha256', hashKey)
        .update(url)
        .digest("hex")
}

/**
 * @param {String} message The error message
 * @param {Number} code The HTTP error code
 * @returns {Error} Error with an HTTP error code
 */
const httpException = function (message, code) {
    const error = new Error(message)
    error.statusCode = code
    return error
}

/**
 * @param {Readable} stream 
 * @returns {Promise<String>} A Promise resolving to the stream as an UTF-8 string
 */
const streamToString = function (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    })
}

/**
 * @param {Readable} stream 
 * @returns {Promise<Buffer>} A Promise resolving to the stream as a Buffer
 */
const streamToBuffer = async function (stream) {
    const chunks = [];
    for await (const data of stream) {
        chunks.push(data);
    }
    return Buffer.concat(chunks);
}
/**
 * @param {Date} start 
 * @param {Date} end 
 */
const diffInSeconds = function (start,  end) {
    const ms = (end.getTime() - start.getTime())
    if (ms < 1000) {
        return `${ms}ms`
    }
    const seconds = Math.floor(ms / 1000)
    const dec = `${(ms % 1000)}`.padStart(3, '0')
    return `${seconds}.${dec}s`
}

/**
 * @param {String} url 
 * @returns {String}
 */
const trimTrailingSlash = function(url) {
    return url.endsWith('/') ? url.substring(0, url.lastIndexOf('/')) : url
}

module.exports = {
    parseUrl,
    signUrl,
    httpException,
    streamToString,
    streamToBuffer,
    diffInSeconds,
    trimTrailingSlash,
}
