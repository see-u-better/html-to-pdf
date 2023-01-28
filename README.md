# HTML to PDF
Application that fetches an URL and converts it to PDF

## Installation
- Copy the .env example file: `cp .env.example .env`
- Change the **PDF_HASH_KEY** in `.env`
- Run the server with `npm start`

### Heroku
- `heroku create --region eu APPNAME`
- `heroku buildpacks:add jontewks/puppeteer`
- `git push heroku master`

### Health endpoint
Calling the endpoint `/health` without any parameter yields a `200 OK` response if the server is running

## Usage
Send a GET request with the following query parameters :
- `url`: URL to print as PDF (should be URI encoded)
- `name`: PDF filename (the query param can be changed by the `FILENAME_QUERY_PARAM` environment variable)
- `hash`: HMAC(sha256) signature of the URL with the `PDF_HASH_KEY` present in the environment variables

## Configuration
The serverside app can be configured with these environment variables :
- `PDF_HASH_KEY`: The key used to sign the URL (**REQUIRED**)
- `PUPPETEER_PAGE_OPTIONS`: JSON options that will be passed to the Puppeteer page
- `FILENAME_QUERY_PARAM`: query parameter used to retreive the filename
- `UNTITLED_FILENAME`: default filename

Additionally, you can configure the error messages with the following environment variables :
- `MESSAGES_MISSING_URL`: Missing URL
- `MESSAGES_INVALID_URL`: Invalid URL
- `MESSAGES_INVALID_SIGNATURE`: Invalid signature
- `MESSAGES_GENERATING_FOR_URL`: Generating PDF for `:url`
- `MESSAGES_DONE_IN_SECONDS`: Done in `:duration`
- `MESSAGES_ERROR_ON_RETRIEVAL`: An error occured during the URL retrieval
Words started with a colon are variables that will be replaced bu the value at runtime.
### Example

```js
// Assuming we want to create a PDF file, named 'output.pdf'
// of the website 'https://website.com', and this app is
// exposed at the server address: 'https://server.com'

const crypto = require('crypto')

const filename = 'output.pdf'
const url = 'https://website.com'
const key = 'YOUR-PDF_HASH_KEY-SET-IN-DOTENV'

// Generates the signature
const signature = crypto
    .createHmac('sha256', key)
    .update(url)
    .digest("hex")

// echoes the signature
console.log(signature)

// Generates the link to download the PDF
const signedUrl = 'https://server.com?'
    + 'url=' + encodeURIcomponents(url)
    + '&name=' + filename
    + '&hash=' + signature
```

The `signedUrl` should look like this :
```
https://server.com?url=https%3A%2F%2Fwebsite.com&name=output.pdf&hash=e02a0fce77bfb2b992cd2a93758e53af804ad6c61731ea40c0c1c0c5a69c192d
```

You can use it to download the file directly :
```js
// Downloading the file with fetch
fetch(signedUrl, { method: 'GET' })
    .then(res => res.blob())
    .then(blob => {
        const file = window.URL.createObjectURL(blob)
        window.location.assign(file)
    })
```

Or set it as the destination of a download link :
```html
<a id="downloadLink" href="#" download> Download the PDF</a>

<script>
    const link = document.getElementById('downloadLink')
    link.setAttribute('href', 'signedUrl')
</script>
```
