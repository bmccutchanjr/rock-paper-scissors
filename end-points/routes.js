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
	{   //  Serve the home page

//	02			if (!request.user)
//	02				return response.status(401).sendFile(path.join(__dirname, "../web/login.html"));
//	02	
		response.sendFile(path.join(__dirname, "../www/home.html"));
	})

.get("/404.html", (request, response) =>
	{   //  Serve the 404 error page

		response.sendFile(path.join(__dirname, "../www/404.html"));
	})

.get("/about", (request, response) =>
	{   //  serve the 'about' page

		response.sendFile(path.join(__dirname, "../www/about.html"));
	})

.get("/play/:what", (request, response) =>
	{   //  Serve the routes to start and play a game...  Games may be started by requesting a URL with a game ID, or
		//	requesting a URL with the string server.  In the latter case, the player's opponent will be the server.
		//	But it's the same HTML file.  The browser then connects via WebSockets to connect to the game.  I'm only
		//	including the Dame ID in the URL so the browser script can figure all that out...

		response.sendFile(path.join(__dirname, "../www/game/game.html"));
	})

//	03B	.get("/404/", (request, response) =>
//	03B		{   //  A generic route handler
//	03B	
//	03B	//	03A		response.sendFile(path.join(__dirname, "../www/404/" + request.url));
//	03B			response.sendFile(path.join(__dirname, "../www/404/404.html"));
//	03B		})

.use(express.static(path.join(__dirname, "../www")))

.use((request, response) =>
	{   //  Finally, a handler to for unknown route requests.  That corresponds to an HTML 404 status
		//  code, so send them a 404 page!

//	03	Rather than serve the 404 page directly, redirect the browser to the 404 page.  Serving the page requires
//	03	that I either save the 404 page from the root folder or specify the path to it's support files (like .css
//	03	and .js) in the HTML.  Neither is a really pretty solution but the later is uglier.  Redirecting the
//	03	browser will get it to request support files from the proper folder without a lot of extra routes...
//	03			response.sendFile(path.join(__dirname, "../www/404.html"));
//	03B	But it seems that dosn't work the way I expected it to...the browser requested the [age correctly, but it's
//	03B	requesting the .css from the root folder...so it's back to serving the file for now...
//	03B		response.redirect ("/404/404.html");
//	04	console.log (path.join(__dirname));
//	04		response.sendFile(path.join(__dirname, "../www/404.html"));
		response.redirect("/404.html");

		console.log (chalk.red ("HTTP SERVER ALERT"));
		console.log (chalk.red ("Someone requested a resource that is not found on this server"));
		console.log (chalk.red (request.url));
		console.log (chalk.red (request.ip));
	});

module.exports = router;
