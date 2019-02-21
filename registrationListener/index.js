const fetch = require('node-fetch')
global.Headers = fetch.Headers

module.exports = async (context, req) => {

    // get courses here
    const activity = req.query.type
    const registrationType = req.body.registrationType
    const course = await fetch("https://365proxy.azurewebsites.us/iphelp/course?courseCode=" + req.body.courseCode, {
        method: 'get',
        headers: new Headers({
            'Authorization': 'Bearer ' + process.env.APP_365_API
        })
    })
        .then(res => res.json())
        .then(data => data)

    if (activity == "new") {
        if (registrationType == "Active") {

        }
        if (registrationType == "Waitlisted") {

        }
    }
    if (activity == "update") {
        if (registrationType == "Active") {

        }
        if (registrationType == "Canceled") {

        }
    }

    context.done()
}
