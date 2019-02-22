module.exports = async (context, timer) => {
    // runs every night
    const now = new Date()

    // get all upcoming courses
    const courses = await fetch('https://365proxy.azurewebsites.us/iphelp/allCourses', {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + process.env.APP_365_API
            })
        })
        .then(res => res.json())
        .then(data => data.filter(course => new Date(course.startDate) > now))

    context.log(courses)

    // get table of registrations
    // for each course, if maximum capacity is not reached, but waitlisted registration exist
    // bump the oldest wait listed registrations up to fill the course

    // then, if any courses are occuring within 48 hours
    // get the list of fully registered users
    // and email them a reminder

    context.done()
}