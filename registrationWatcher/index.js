const fetch = require('node-fetch')
global.Headers = fetch.Headers

module.exports = async (context, timer) => {

    // this runs every night
    const now = new Date()

    /* 
        First, try to find courses where a waitlist exists, but the maximum capacity has not been reached
        For each one of these, take the oldest n number of waitlisted registrations, and set them to active
    */

    // get all upcoming courses
    const courses = await fetch('https://365proxy.azurewebsites.us/iphelp/allCourses', {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.APP_365_API
            })
        })
        .then(res => res.json())
        .then(data => data.filter(course => new Date(course.startDate) > now))

    // get all registrations
    const registrations = await fetch('https://365proxy.azurewebsites.us/iphelp/allCourseRegistrations', {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.APP_365_API
            })
        })
        .then(res => res.json())
        .then(data => data)

    // for each course, if space is available and waitlist exists, bump oldest waitlisted enrollments to active
    courses.forEach(course => {
        const maxCapacity = course.maximumCapacity
        const allEnrollments = registrations.filter(reg => reg.courseCode == course.courseCode)
        const activeEnrollments = allEnrollments.filter(reg => reg.registrationStatus == "Active")
        const waitlistedEnrollments = allEnrollments.filter(reg => reg.registrationStatus == "Waitlisted")
        if (activeEnrollments.length < maxCapacity) {
            if (waitlistedEnrollments.length > 0) {
                const spotsToFill = maxCapacity - activeEnrollments.length
                const sortedByDateSubmitted = waitlistedEnrollments.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                const registrationsToBump = sortedByDateSubmitted.slice(0, spotsToFill)
                registrationsToBump.forEach(registration => {
                    fetch('https://365proxy.azurewebsites.us/iphelp/updateCourseRegistration?id=' + registration.registrationId, {
                        method: 'POST',
                        body: JSON.stringify({
                            "Registration_x0020_Status": "Active"
                        }),
                        headers: new Headers({
                            'Authorization': 'Bearer ' + process.env.APP_365_API,
                            'Content-type': 'application/json'
                        })
                    })
                })
            } else return
        } else return
    })

    /* 
        Next, find courses that are occuring between 24 & 48 hours in the future
        For each one of these course, email all registered users, where status == "Active", and remind them of the event
    */

    const path = __dirname + '//emailTemplates/courseReminder.html'

    const impendingCourses = courses.filter(crs => {
        let twentyFour = new Date()
        twentyFour.setDate(twentyFour.getDate() + 1)
        let fortyEight = new Date()
        fortyEight.setDate(fortyEight.getDate() + 2)
        const start = new Date(crs.startDate)
        return start > twentyFour && start < fortyEight
    })

    impendingCourses.forEach(course => {
        context.log(course.courseCode)
        const courseRegistrations = registrations.filter(reg => reg.courseCode == course.courseCode)
        courseRegistrations.filter(c => c.registrationStatus == "Active").forEach(activeReg => {
            fs.readFile(path, 'utf8', async (err, email) => {
                const load = {
                    to: activeReg.user,
                    from: {
                        email: activeReg.user,
                        name: 'I&P Help'
                    },
                    subject: course.courseName,
                    html: await String.format(email,
                        course.courseName, // 0
                        course.courseDescription, // 1
                        course.startDate, // 2
                        course.courseLocation) // 3    
                }
                await sendEmail(load)
            })
        })
    })

    context.done()

    const sendEmail = async (load) => {
        await fetch('https://sendgridproxy.azurewebsites.us/sendMail/single', {
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