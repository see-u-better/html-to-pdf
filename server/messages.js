const messages = {
    MISSING_URL: process.env.MESSAGES_MISSING_URL ?? 'Missing URL',
    INVALID_URL: process.env.MESSAGES_INVALID_URL ?? 'Invalid URL',
    INVALID_SIGNATURE: process.env.MESSAGES_INVALID_SIGNATURE ?? 'Invalid signature',
    ERROR_ON_RETRIEVAL: process.env.MESSAGES_ERROR_ON_RETRIEVAL ?? 'An error occured during the URL retrieval',
    
    // Internal
    GENERATING_FOR_URL: process.env.MESSAGES_GENERATING_FOR_URL ?? 'Generating PDF for :url',
    DONE_IN_SECONDS: process.env.MESSAGES_DONE_IN_SECONDS ?? 'Done in :duration',
    HOMEPAGE: `<!DOCTYPE html>
<html>
    <head>
        <title>HTML-TO-PDF</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <link href="https://fonts.googleapis.com/css?family=Lato:100" rel="stylesheet" type="text/css">
        <style>
            html, body { height: 100%; }
            body { margin: 0; padding: 0; width: 100%; display: table; font-weight: 100; font-family: 'Lato'; }
            .container { text-align: center; display: table-cell; vertical-align: middle; }
            .content { text-align: center; display: inline-block; }
            .title { font-size: 96px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">HTML-TO-PDF</div>
            </div>
        </div>
    </body>
</html>`
}

module.exports = messages
