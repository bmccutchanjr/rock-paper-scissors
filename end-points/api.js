//  This module is the middleware used to serve API end-points.  It's pretty much just a standard, no-frills module that
//  that configures ExpressJS to serve the application's end-points in a NodeJS environment.

// Require the dependencies

const chalk = require("chalk");
const express = require("express");

//  Require custom middleware

//	01	const passport = require("./authenticate.js");
//	01	const people = require("./database/people.js");

// Configure ExpressJS

const app = express();
const router = express.Router ();
app.use ("/api", router);

router
.use (function (request, response, next)
	{   //  This always happens whenever any end-point is served in this module.  At the moment I only use it to debug
		//  routes, but it could be something more useful.

		console.log(chalk.purple("api.js says client is requesting: ", request.url));
		next();
	})

//	02	.del("/some end-point", (request, response) =>
//	02		{   //  A generic end-point for DEL requests.  DEL requests could also be requested via a GET request, but this a
//	02			//  bit more semantic.
//	02	
//	02		})

.get("/pick-a-name", function(request, response)
	{   // Create a random name for the player to use

		response.status(200).sendData ("Mister Peepers");

	})

.post("/some endpoint", function(request, response)
	{   // A generic end-point for POST requests

	})

//	02	.put("/some endpoint", function(request, response)
//	02		{   // A PUT request has been made for some endpoint.  Respond with the appropriate data
//	02	
//	02		})

.use((request, response) =>
	{   //  Default handler for invalid end-points...all this does is send a 404 status with a custom message.

		console.log (chalk.redBright("ERROR 404"));
		console.log (chalk.redBright("Someone requested an invalid end-point."));
		response.status(404).send("So sorry.  The service you requested does not exist on this server.");
	});

module.exports = router;
