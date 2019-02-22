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
        context.log(course.courseName)
        context.log("----------------------------")
        const maxCapacity = course.maximumCapacity
        context.log("Max capacity: " + maxCapacity)
        const allEnrollments = registrations.filter(reg => reg.courseCode == course.courseCode)
        context.log("All enrollments: " + allEnrollments.length)
        const activeEnrollments = allEnrollments.filter(reg => reg.registrationStatus == "Active")
        context.log("Active enrollments: " + activeEnrollments.length)
        const waitlistedEnrollments = allEnrollments.filter(reg => reg.registrationStatus == "Waitlisted")
        context.log("Waitlisted enrollments: " + waitlistedEnrollments.length)
        if (activeEnrollments < maxCapacity) {
            context.log("Space available: true")
            if (waitlistedEnrollments.length > 0) {
                context.log("Waitlist exists: true")
                const spotsToFill = maxCapacity - activeEnrollments
                context.log("Spots to fill: " + spotsToFill)
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

    context.done()
}