const fetch = require('node-fetch')
var fs = require('fs')
global.Headers = fetch.Headers

module.exports = (context, req) => {

    // http endpoint
    // takes a registrationId, and sets the registrationStatus == "Canceled"
    
    context.done()
}