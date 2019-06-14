# Course Registration

Course Registration is a BaaS service hosted in Azure that facilitates the course registration module on [I&P Help](https://github.com/CityofPittsburgh/IP-help).  On that site, users are able to register for training courses being offered by the Department of Innovation & Performance. 

This service interfaces with Sharepoint via the [365-proxy](https://github.com/CityofPittsburgh/365-api), which serves as a data store for registration records.  All email correspondence is delivered through the [sendgrid-proxy](https://github.com/CityofPittsburgh/sendgrid-proxy).

## cancelRegistration
Triggered by HTTP, this function takes a registration ID (registrationId) and email address (user) as query parameters.  It then marks the registration record as 'canceled' within Sharepoint, emails the user a cancelation confirmation, and deletes the event from their Outlook calendar.

## registrationListener
Triggered by HTTP, this function takes a registration ID (registrationId) and a registration type (type) as query parameters.  It expects the following object in the body of the request:
```typescript
{
    user: String as email address
    registrationType: "Active" | "Waitlisted" | "Canceled"
}
```

This function is called up whenever a course registration record is created or updated.  It sends the necessary email confirmations of whatever activity has occured, and creates calendar events as necessary.

## registrationWatcher
This is a cron job that runs nightly.  It does two things: first, it checks to see if waitlisted registrations can be bumped to full registrations (i.e. somebody canceled their registration during the preceding day).  Second, for courses occuring within 48 hours, it sends out reminder emails to all participants fully registered for the event.

## Authorization

Keys! For the http triggers.

## Running Locally

### Prerequisites
* [.Net Core](https://dotnet.microsoft.com/download) - BaaS execution environment
* [Node.js](https://nodejs.org) - JS runtime
* local.settings.json - See local.settings.json.example for all required secrets

### Installation
```
git clone https://github.com/CityofPittsburgh/course-registration
cd course-registration
func extensions install
func host start
```

## Deployment

Deployed as an Azure Function.  Application is deployed directly from github, and can be triggered either (a) through the Azure GUI, (b) through the [CLI](https://docs.microsoft.com/en-us/cli/azure/webapp/deployment/source?view=azure-cli-latest#az-webapp-deployment-source-sync), or (c) through the [proxy service](https://github.com/CityofPittsburgh/azure-proxy).

For complete documentation on the azure environment, see [here](https://github.com/CityofPittsburgh/all-things-azure.git).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details