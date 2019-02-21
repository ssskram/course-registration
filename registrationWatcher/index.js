module.exports = (context, timer) => {
    var timeStamp = new Date().toISOString()

    // every night
    // get table of registrations
    // get table of courses
    // for each course, if maximum capacity is not reached, but waitlisted registration exist
    // bump the oldest wait listed registrations up to fill the course

    // then, if any courses are occuring within 48 hours
    // get the list of fully registered users
    // and email them a reminder
    
    context.done()
}