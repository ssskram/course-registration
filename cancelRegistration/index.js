const fetch = require('node-fetch')
global.Headers = fetch.Headers

module.exports = async (context, req) => {

    // return cancelation confirmation
    context.res = {
        status: 202,
        headers: {
            "Content-Type": "text/html"
        },
        body: "<html><body><h1>You've successfully canceled your course enrollment</h1><h3>Thanks for letting us know!!</h3></body></html>",
    }

    // incoming params
    const registrationId = req.query.id
    const user = req.query.user

    // set registration status == "Canceled"
    fetch('https://365proxy.azurewebsites.us/iphelp/updateCourseRegistration?id=' + registrationId, {
        method: 'POST',
        body: JSON.stringify({
            "Registration_x0020_Status": "Canceled"
        }),
        headers: new Headers({
            'Authorization': 'Bearer ' + process.env.APP_365_API,
            'Content-type': 'application/json'
        })
    })

    try {
        // get calendar event
        const eventId = await fetch('https://365proxy.azurewebsites.us/iphelp/courseRegistrationCalendarEvent?registrationID=' + registrationId, {
                method: 'GET',
                headers: new Headers({
                    'Authorization': 'Bearer ' + process.env.APP_365_API
                })
            })
            .then(res => res.json())
            .then(data => data[0].eventId)

        // delete calendar event
        fetch('https://365proxy.azurewebsites.us/calendar/deleteEvent?user=' + user + "&eventId=" + eventId, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.APP_365_API,
                'Content-type': 'application/json'
            })
        })
    } catch (err) {}
}