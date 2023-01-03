//	Rock Paper Scissors is an two person interactive real-time web version of the classic game.  Only two people can
//	play in one game, the application does support multiple games.
//
//  This module is the entry point.  It configures a web server with ExpressJS and WS to support WebSockets.

//	01  This application requires no confdential or personally identifiable information and there's no need for players
//		to register or authenticate.  So there's no need for Passport, except to show that I can do it.  In the interest
//		of an improved user experience, I'm removing Passport.
//
//		Without Passport and user authentication, I don't need cookies, a database or session management.

//	02	I'm thinking I don't need to support API's either.  Just static routes and WebSockets

//  Require and configure NPM modules that are required to configure ExpressJS with WS

const chalk = require("chalk");
//	01	const cookies = require ("cookie-parser");
//	01	const dotenv = require("dotenv").config();
const express = require("express");
//	01	const session = require ("express-session");
//	01	const passport = require("passport");
const websocket = require("./sockets.js");

// Configure ExpressJS

const app = express();
//	01	app.use(cookies());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//	01	app.use (session (
//	01		{
//	01			secret: "keyboard cat",
//	01			resave: true,
//	01			saveUninitialized: true
//	01		}));
//	01	
//	01	//  And link Passport to ExpressJS
//	01	
//	01	app.use (passport.initialize());
//	01	app.use (passport.session ());

//  Require custom modules to handles routes and end-points

//	02	app.use ("/api", require("./end-points/api.js"));
app.use ("/", require("./end-points/routes.js"));

// Set the PORT to be used by the server.  If the Node.js process environment has a variable defined called
// PORT, this application is likely deployed on Heroku and it must use the server must use the port specified
// by Heroku.  If the process environment does not have a PORT variable defined it is probably running locally
// and can use pretty much whatever port I want.

const PORT = process.env.PORT ? process.env.PORT : 80;

const server = app.listen (PORT, () =>
{   //  Start the ExpressJS server to handle HTTP requests.

	//  If this application is hosted on the cloud, we'll listen on whatever port is assigned to it,
	//  otherwise we'll listen to port 80 and any address configured on the host machine

	if (server.listening)
	{
		console.log (chalk.green("The server is up and running"));
		console.log (chalk.green("Listening on port " + PORT));
	}
});

//  ExpressJS returns a reference to the HTTP server it created.  Use that to start a WebSocket server.

const wss = websocket.createServer (server);

//	And finally, close the HTTP and WebSocket servers...that should also get rid of any event listeners.

//	And finally, monitor the OS for shutdown commands and close the HTTP and WebSocket servers.  Closing the servers
//	should also get rid of any event listeners they had.  But the process event listeners...that's a different
//	story.

process.on ("SIGINT", shutDown);
process.on ("SIGQUIT", shutDown);
process.on ("SIGTERM", shutDown);

function shutDown ()
{	//	The application has received a shutdown event.  The application is being terminated by the OS either
	//	as a result of user interaction at the keybard or some other cause.  In any event, the operating system
	//	is terminating the application and the application needs to clean up after itself.
	//
	//	The HTTP and WebSocket servers need to be closed.

	console.log (chalk.red ("Detected shutdown event."));
	console.log (chalk.red ("Shutting down the HTTP server..."));
	websocket.shutdown(wss);
	server.close();
	console.log (chalk.red ("The HTTP server is down"));

	//	As far as I know any event listeners associated with the servers will be removed by closing them.  The server
	//	should be cleanly down.  That may not apply to the WebSocket clients and their listeners.  Those sockets must be
	//	explicitly closed by the WebSocket server.

	//	And remove those pesky event listeners...

	process.removeListener ("SIGINT", shutDown);
	process.removeListener ("SIGQUIT", shutDown);
	process.removeListener ("SIGTERM", shutDown);
}
