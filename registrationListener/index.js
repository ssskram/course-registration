const fetch = require('node-fetch')
var fs = require('fs')
global.Headers = fetch.Headers

module.exports = async (context, req) => {

    // registration details
    const activity = req.query.type
    const registrationType = req.body.registrationType
    const user = req.body.user
    const course = getCourse()

    // base sendgrid load
    let load = {
        to: user,
        from: {
            email: user,
            name: 'I&P Help'
        }
    }

    if (activity == "new") {
        if (registrationType == "Active") {
            const path = __dirname + '//emailTemplates/activeRegistration.html'
            fs.readFile(path, 'utf8', async (err, data) => {
                load.subject = "You have been registered for a course"
                load.html = await String.format(data, course[0].courseName) // 0
                await sendEmail(load)
                context.done()
            })
        }

        if (registrationType == "Waitlisted") {
            const path = __dirname + '//emailTemplates/waitlistedRegistration.html'
            fs.readFile(path, 'utf8', async (err, data) => {
                load.subject = "You have been waitlisted for a course"
                load.html = await String.format(data, course[0].courseName) // 0
                await sendEmail(load)
                context.done()
            })
        }
    }
    if (activity == "update") {
        if (registrationType == "Active") {
            const path = __dirname + '//emailTemplates/activeRegistration.html'
            fs.readFile(path, 'utf8', async (err, data) => {
                load.subject = "You have been registered for a course"
                load.html = await String.format(data, course[0].courseName) // 0
                await sendEmail(load)
                context.done()
            })
        }
        if (registrationType == "Canceled") {
            const path = __dirname + '//emailTemplates/canceledRegistration.html'
            fs.readFile(path, 'utf8', async (err, data) => {
                load.subject = "Course registration canceled"
                load.html = await String.format(data, course[0].courseName) // 0
                await sendEmail(load)
                context.done()
            })
        }
    }

    const getCourse = async () => {
        return await fetch("https://365proxy.azurewebsites.us/iphelp/course?courseCode=" + req.body.courseCode, {
                method: 'get',
                headers: new Headers({
                    'Authorization': 'Bearer ' + process.env.APP_365_API
                })
            })
            .then(res => res.json())
            .then(data => data)
    }

    const sendEmail = async (load) => {
        await fetch('http://localhost:3000/sendMail/single', {
            method: 'POST',
            body: JSON.stringify(load),
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.APP_SENDGRID_API,
                'Content-type': 'application/json'
            })
        })
    }
}

String.format = function () {
    var s = arguments[0]
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm")
        s = s.replace(reg, arguments[i + 1])
    }
    return s
}