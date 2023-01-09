//	This module is responsible for setting up the WebSocket server and event listeners to handle communication
//	from client devices.  It uses the ExpressJS server that is configured in server.js.
//

const chalk = require("chalk");			//	chalk allows console.log() to use color, for clarity
const ws = require("ws");

let interval = undefined;				//	initialze a variable for setInterval

function setGameStatusTrue (client) { client.game.status = true };

function testConnections (clientList)
{	//	Interate through the set of clients and remove any that are not responding.
	//
	//	The client's status is set to true everytime a message is recieved from the client, or when the client
	//	responds to a ping.  So if the client's status is false, it hasn't sent a message or responded to a ping
	//	for 5 minutes (the repeat interval of this function).
	//
	//	5 minutes seems to be a sufficiently long period of time.
	//
	//	So at this point...
	//
	//	Interate through the list of clients and close any with a status of false.  And I might want to terminate
	//	any clients that are closing.  Same idea...they were told to close and are still in the process 5 minutes
	//	later.  It shouldn't happen, but the function is provided by the developer's for just this reason.

	clientList.forEach (c =>
	{
		if (c.closing) c.terminate()
		else if (c.game.status == false) c.close();
	})

	// And the second go round...ping all of the remaining clients

	clientList.forEach (c =>
	{	//	For each client set the status of to false, then ping it.  If the client responds, the client
		//	pong event handler will set the status back to true.

		c.game.status = false;
		c.ping()
	});
}

function createUniqueID (clientList)
{	//	Create a random string of 10 digits and verify it is unique.  If this string is in use, do it again...

	let string = "";
	for (let i=0; i<10; i++)
	{
		string += Math.floor (Math.random() * 10);
	}

	clientList.forEach (c =>
	{
		if (c.game != undefined)
			if (c.game.uniqueID != undefined)
				if (c.game.uniqueId  == string) createUniqueID (clientList);
	})

	return string;
}

const WSS = 
{
	createServer: HTTPServer =>
	{   //  Create the Webserver server and event handlers to manage connections

		const server = new ws.Server ( { "clientTracking": true, "server": HTTPServer } );

		server.on ("connection", client =>
		{
			client.send ("Welcome aboard!");
			client.ping();

			client.game =
			{
				uniqueID: createUniqueID(server.clients),
				status: true
			};

			console.log (chalk.blueBright("WebSocket server says a client has connected"));
			console.log (chalk.blueBright("current # connections: " + server.clients.size));

			//	Now add appropriate event handlers for this client...

			client.on ("close", event =>
			{	//	The CLIENT is closing this connection and has emitted a close event to inform the  server.  It's
				//	a good time for the server to clean up and destroy the associated client object.

				client.close();
			}),

			client.on ("pong", event =>
			{
				setGameStatusTrue (client);
			}),

			client.on ("message", message =>
			{   //  Listen for messages from this CLIENT

				//	First things first...any message recieved from a client means the client is active.  Set active status
				//	to true.

				setGameStatusTrue (client);

				switch (message.toString())
				{
					case "Hello!":
						{	//  A client has connected and sent this message.  It doesn't mean anything, ignore it...
							setGameStatusTrue (client);
							break;
						}

					case "ping":
						{	//	The client has sent an automated message to test connectivity...respond to the message
							//	and set the client's status to true.  ANY message received from the client means the
							//	client is still connected and active.

							client.send ("pong");
							setGameStatusTrue (client);
							break;
						}

					default:
						{
							console.log (chalk.redBright ("WEBserver ERROR"));
							console.log (chalk.redBright ("Unknown message received"));
							console.log (chalk.redBright (message));
							break;
						}
				}
			});
		});

		server.on ("error", error =>
		{
			console.log (chalk.redBright ("WEBserver ERROR"));
			console.log (chalk.redBright (error));
		});

		server.on ("listening", () =>
		{
			console.log (chalk.greenBright ("WebSocket server is listening for new connections"));
			interval = setInterval (() => { testConnections (server.clients) }, 300000);
		})

		return server;
	},

	sendToAll: message =>
	{   //  Push the indicated message to all connected clients.
		//  
		//  This is invoked as a response to some event outside of the scope of the Webserver server, and not as a response to
		//  a message received from a client.  This is how the server pushes notification to the clients to changes made to the
		//  database, perhaps a new animal added or someone has taken an animal out of its cage.
		//
		//  There is no need, at this time, to be selective.  All messages will be pushed to all connected clients.

		clientList.forEach (cl =>
		{   cl.client.send(message);
		})
	},

	shutdown: server =>
	{	//	This function allows the HTTP server to forward a shutdown event notification...

		console.log (chalk.redBright("Shutting down the WebSocket server..."))
		server.close();
		server.clients.forEach (c => { c.close() } );
		clearInterval (interval);
		console.log (chalk.redBright("The WebSocket server is down"))
	},
}

module.exports = WSS;