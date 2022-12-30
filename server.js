//  This module is the entry point to the application and is used to configure the web server with ExpressJS,
//  Passport and the WebSockets module ws.  Several other dependencies have been required that serve as an aid
//  in development and/or modularization and encapsulation.
//
//  Require and configure NPM modules that are required to configure ExpressJS with WS
//

const chalk = require("chalk");
const cookies = require ("cookie-parser");
const dotenv = require("dotenv").config();
const express = require("express");
//	01	const session = require ("express-sessions");
const passport = require("passport");
const websocket = require("./end-points/sockets.js");

// Configure ExpressJS

const app = express();
app.use(cookies());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//	01	app.use (session (
//	01		{
//	01			secret: "keyboard cat",
//	01			resave: true,
//	01			saveUninitialized: true
//	01		}));

//  And link Passport to ExpressJS

//	01	app.use (passport.initialize());
//	01	app.use (passport.session ());

//  Require custom modules to handles routes and end-points

//	03	app.use ("/api", require("./end-points/api.js"));
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

websocket.createServer (server);
