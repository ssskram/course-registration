module.exports = (context, req) => {

  console.log(req.body)
  console.log(req.query.type)
  context.res = {
    // status defaults to 200 */
    body: 'Hello'
  }
  context.done()

  // test test
  // http endpoint
  // takes a registration record in the body
  // and an activity type in as a query param, "Update" || "New"

// if activity type == "New" && registration status == "Active", email registration confirmation
// if activity type == "New" && registration status == "Waitlisted", email waitlist confirmation
// if activity type == "Update" && registration status == "Active", email registration confirmation
// if activity type == "Update" && registration status == "Canceled", email cancellation confirmation
}
