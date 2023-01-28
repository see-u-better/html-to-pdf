const messages = {
    MISSING_URL: process.env.MESSAGES_MISSING_URL ?? 'Missing URL',
    INVALID_URL: process.env.MESSAGES_INVALID_URL ?? 'Invalid URL',
    INVALID_SIGNATURE: process.env.MESSAGES_INVALID_SIGNATURE ?? 'Invalid signature',
    ERROR_ON_RETRIEVAL: process.env.MESSAGES_ERROR_ON_RETRIEVAL ?? 'An error occured during the URL retrieval',
    
    // Internal
    GENERATING_FOR_URL: process.env.MESSAGES_GENERATING_FOR_URL ?? 'Generating PDF for :url',
    DONE_IN_SECONDS: process.env.MESSAGES_DONE_IN_SECONDS ?? 'Done in :duration',
}

module.exports = messages
