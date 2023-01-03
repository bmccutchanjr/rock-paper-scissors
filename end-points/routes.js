//  This module is the middleware used to serve static routes and their auxillary files.  It's pretty much just a
//  standard, no-frills module that configures ExpressJS to serve the application's static routes.

// Require the dependencies

const chalk = require("chalk");
const express = require("express");
const path = require("path");

//  Require the database ORM that provides the functions to authenticate our users

//	02	const people = require ("./database/people.js");

// Configure ExpressJS

const app = express();
const router = express.Router ();
app.use ("/", router);

router
.use ((request, response, next) =>
	{   // This always happens always happens whenever any route is served in this module.  At the moment its only
		// purpose is it to debug routes, but it could be something more useful.

		console.log(chalk.blue("requesting: ", request.url));

		next();
	})

.get("/", (request, response) =>
	{   //  A generic route handler

//	02			if (!request.user)
//	02				return response.status(401).sendFile(path.join(__dirname, "../web/login.html"));
//	02	
		response.sendFile(path.join(__dirname, "../www/index.html"));
	})

.use(express.static(path.join(__dirname, "../www")))

.use((request, response) =>
	{   //  Finally, a handler to for unknown route requests.  That corresponds to an HTML 404 status
		//  code, so send them a 404 page!

		response.sendFile(path.join(__dirname, "../www/404.html"));

		console.log (chalk.red ("HTTP SERVER ALERT"));
		console.log (chalk.red ("Someone requested a resource that is not found on this server"));
		console.log (chalk.red (request.url));
		console.log (chalk.red (request.ip));
	});

module.exports = router;
