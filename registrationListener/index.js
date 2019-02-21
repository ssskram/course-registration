module.exports = (context, req) => {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl)

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        }
    } else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        }
    }
    context.done()

    // http endpoint
    // takes a registration record in the body
    // and an activity type in as a query param, "Update" || "New"

    // if activity type == "New" && registration status == "Active", email registration confirmation
    // if activity type == "New" && registration status == "Waitlisted", email waitlist confirmation
    // if activity type == "Update" && registration status == "Active", email registration confirmation
    // if activity type == "Update" && registration status == "Canceled", email cancellation confirmation
}