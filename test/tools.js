/* istanbul ignore file */
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')

/**
 * @param {Blob} pdfBlob 
 * @returns {Promise<String>}
 */
const pdfBlobToString = async function (pdfBlob) {
    try {

        let doc = await pdfjsLib.getDocument({ data: pdfBlob }).promise
        let page1 = await doc.getPage(1)
        let content = await page1.getTextContent()
        let strings = content.items.map(function (item) {
            return item.str
        })
        return strings
    } catch (e) {
        console.error({
            blob: pdfBlob,
            error: e,
        })
        return null
    }
}

module.exports = {
    pdfBlobToString,
}
