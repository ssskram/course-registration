const fetch = require("node-fetch");
var fs = require("fs");
global.Headers = fetch.Headers;

module.exports = async (context, req) => {
  // registration details
  const registrationId = req.body.registrationId;
  const activity = req.query.type;
  const registrationType = req.body.registrationType;
  const user = req.body.user;
  const cancelUrl =
    process.env.CANCEL_URL + "&id=" + registrationId + "&user=" + user;
  const course = await fetch(
    "https://365proxy.azurewebsites.us/iphelp/course?courseCode=" +
      req.body.courseCode,
    {
      method: "get",
      headers: new Headers({
        Authorization: "Bearer " + process.env.APP_365_API
      })
    }
  )
    .then(res => res.json())
    .then(data => data[0]);

  // base sendgrid load
  let load = {
    to: user,
    from: {
      email: user,
      name: "I&P Help"
    }
  };

  if (activity == "new") {
    if (registrationType == "Active") {
      const path = __dirname + "//emailTemplates/activeRegistration.html";
      fs.readFile(path, "utf8", async (err, data) => {
        load.subject = "Course registration complete";
        load.html = await String.format(
          data,
          course.courseName, // 0
          course.courseDescription, // 1
          course.startDate, // 2
          course.courseLocation, // 3
          cancelUrl
        ); // 4
        await calendarEvent();
        await sendEmail(load);
      });
    }

    if (registrationType == "Waitlisted") {
      const path = __dirname + "//emailTemplates/waitlistedRegistration.html";
      fs.readFile(path, "utf8", async (err, data) => {
        load.subject = "You're on the waitlist";
        load.html = await String.format(
          data,
          course.courseName, // 0
          course.courseDescription, // 1
          course.startDate, // 2
          cancelUrl
        ); // 3
        await sendEmail(load);
      });
    }
  }
  if (activity == "update") {
    if (registrationType == "Active") {
      const path = __dirname + "//emailTemplates/activeRegistration.html";
      fs.readFile(path, "utf8", async (err, data) => {
        load.subject = "Course registration complete";
        load.html = await String.format(
          data,
          course.courseName, // 0
          course.courseDescription, // 1
          course.startDate, // 2
          course.courseLocation, // 3
          cancelUrl
        ); // 4
        await calendarEvent();
        await sendEmail(load);
      });
    }
    if (registrationType == "Canceled") {
      const path = __dirname + "//emailTemplates/canceledRegistration.html";
      fs.readFile(path, "utf8", async (err, data) => {
        load.subject = "Course registration canceled";
        load.html = await String.format(
          data,
          course.courseName, // 0
          course.courseDescription, // 1
          course.startDate
        ); // 2
        await sendEmail(load);
      });
    }
  }

  const sendEmail = async load => {
    await fetch("https://sendgridproxy.azurewebsites.us/sendMail/single", {
      method: "POST",
      body: JSON.stringify(load),
      headers: new Headers({
        Authorization: "Bearer " + process.env.APP_SENDGRID_API,
        "Content-type": "application/json"
      })
    });
  };

  const calendarEvent = async () => {
    const event = {
      subject: course.courseName,
      body: {
        contentType: "HTML",
        content: course.courseDescription
      },
      start: {
        dateTime: course.startDate,
        timeZone: "America/New_York"
      },
      end: {
        dateTime: course.endDate,
        timeZone: "America/New_York"
      },
      location: {
        displayName: course.courseLocation
      },
      attendees: []
    };
    await fetch(
      "https://365proxy.azurewebsites.us/calendar/newEvent?user=" + user,
      {
        method: "POST",
        body: JSON.stringify(event),
        headers: new Headers({
          Authorization: "Bearer " + process.env.APP_365_API,
          "Content-type": "application/json"
        })
      }
    )
      .then(response => response.text())
      .then(eventId => {
        fetch(
          "https://365proxy.azurewebsites.us/iphelp/courseRegistrationCalendarEvent",
          {
            method: "POST",
            body: JSON.stringify({
              Registration_x0020_ID: registrationId,
              Event_x0020_ID: eventId
            }),
            headers: new Headers({
              Authorization: "Bearer " + process.env.APP_365_API,
              "Content-type": "application/json"
            })
          }
        );
      });
    return;
  };
};

String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
};
