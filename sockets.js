//	This module is responsible for setting up the WebSocket server and event listeners to handle communication
//	from client devices.  It uses the ExpressJS server that is configured in server.js.
//

const chalk = require("chalk");			//	for clarity...chalk allows console.log() to use color
const ws = require("ws");

//	01	function configureChallenge (client, opponent)
//	01	{	//	This is triggered when a message is received indicating a new user has selected an opponent.  That opponent
//	01		//	might be the server or some other player on the waiting list.  It's also possible the player has decided to
//	01		//	wait for someone to challenge them.
//	01	
//	01		if (opponent == "server") client.game.opponent = "server";
//	01		else
//	01		{
//	01	
//	01	//	other options here...
//	01	
//	01		}
//	01	
//	01	
//	01		client.send ("server ready");
//	01	}

let interval = undefined;				//	initialze a variable for setInterval

//	01	function setGameStatusTrue (client) { client.game.status = true };
//	01	
//	01	function testConnections (clientList)
//	01	{	//	Iterate through the set of clients and remove any that are not responding.
//	01		//
//	01		//	The client's status is set to true everytime a message is recieved from the client, or when the client
//	01		//	responds to a ping.  So if the client's status is false, it hasn't sent a message or responded to a ping
//	01		//	for 5 minutes (the repeat interval of this function).
//	01		//
//	01		//	5 minutes seems to be a sufficiently long period of time.
//	01		//
//	01		//	So at this point...
//	01		//
//	01		//	Interate through the list of clients and close any with a status of false.  And I might want to terminate
//	01		//	any clients that are closing.  Same idea...they were told to close and are still in the process 5 minutes
//	01		//	later.  It shouldn't happen, but the function is provided by the developer's for just this reason.
//	01	
//	01		clientList.forEach (c =>
//	01		{
//	01			if (c.closing) c.terminate()
//	01			else if (c.game.status == false) c.close();
//	01		})
//	01	
//	01		// And the second go round...ping all of the remaining clients
//	01	
//	01		clientList.forEach (c =>
//	01		{	//	For each client set the status of to false, then ping it.  If the client responds, the client
//	01			//	pong event handler will set the status back to true.
//	01	
//	01			c.game.status = false;
//	01			c.ping()
//	01		});
//	01	}

//	02	function createUniqueID (clientList)
//	02	{	//	Create a random string of 10 digits and verify it is unique.  If this string is in use, do it again...
//	02	
//	02		let string = "";
//	02		for (let i=0; i<10; i++)
//	02		{
//	02			string += Math.floor (Math.random() * 10);
//	02		}
//	02	
//	02		clientList.forEach (c =>
//	02		{
//	02			if (c.game != undefined)
//	02				if (c.game.uniqueID != undefined)
//	02					if (c.game.uniqueId  == string) createUniqueID (clientList);
//	02		})
//	02	
//	02		return string;
//	02	}

//	01	const gameIDs = [];
//	01	
//	01	function createGameId ()
//	01	{	//	Create a new Game ID and double check that it is unique.  Game IDs are a random string of 10 alpha-numeric
//	01		//	characters.
//	01	
//	01		let string = "";
//	01	
//	01		for (let i=0; i<10; i++)
//	01		{
//	01			const index = Math.floor (Math.random() * 62);
//	01	
//	01			if (index < 10) string += String.fromCharCode (index + 48)
//	01			else if (index < 36) string += String.fromCharCode (index + 55)
//	01			else string += String.fromCharCode (index + 61);
//	01		}
//	01	
//	01		if (gameIDs.indexOf (string) > -1) string = createGameId ();
//	01	
//	01		return string;
//	01	}

const WSS = 
{
	createServer: HTTPServer =>
	{   //  Create the Webserver server and event handlers to manage connections

		const server = new ws.Server ( { "clientTracking": true, "server": HTTPServer } );

		server.on ("connection", client =>
		{
			client.ping();

//	02				client.game =
//	02				{
//	02					uniqueID: createUniqueID(server.clients),
//	02					status: true
//	02				};

			console.log (chalk.blueBright("WebSocket server says a client has connected"));
			console.log (chalk.blueBright("current # connections: " + server.clients.size));

			//	Now add appropriate event handlers for this client...

			client.on ("close", event =>
			{	//	The CLIENT is closing this connection and has sent a message to inform the  server.  It's
				//	a good time for the server to clean up and destroy the associated client object.

				client.close();
			}),

			client.on ("pong", event => { setGameStatusTrue (client); } ),

			client.on ("message", message =>
			{   //  Listen for messages from this CLIENT

				//	All messages sent by WebSOcket are binary data whic is recieved here as a Buffer object.  This
				//	can be converted into a string type easily, but messages sent from the client may be JSON objects.
				//	There seems to be no way to convert a Buffer into a useable object.
				//
				//	But converting a string to an object is trivial.  It seems the simplest solution is to ensure that
				//	my client always sends a string type, regardless of what the actual data type is.  This handler
				//	converts all messages to string types and tries to handle them.  Anything that could not be handled
				//	can be assumed to be a stringified object, so we'll parse the recieved message and try to handle the
				//	result.
				//
				//	Anything not handled can be assumed to be an error.
//	This event handler could get quite large...it may be better to move it into a separate function.  For now, though,
//	I'll leave it here...
				message = message.toString();
				if (message == "wait list")
				{
					// eventually do something here...
				}
				else
				{
					try
					{
						object = JSON.parse (message);
						if (typeof object == "object")
						{
							console.log (object);
							if (object.challenge) configureChallenge (client, message.challenge);
							else if (object.message) forwardThisMessage (client, message.message);
							else if (object.selection) rockPaperScissors (client, message.selection);
							else
							{
								console.log (chalk.redBright ("WEBSOCKET ERROR"));
								console.log (chalk.redBright ("Unknown message received"));
								console.log (chalk.redBright (message));
							}
						}
					}
					catch (error)
					{
						console.log (chalk.redBright ("WEBSOCKET ERROR"));
						console.log (chalk.redBright (error));
						console.log (chalk.redBright ("actual message recieved: " + message));
					}
				}
			})
		});

		server.on ("error", error =>
		{
			console.log (chalk.redBright ("WEBSOCKET ERROR"));
			console.log (chalk.redBright (error));
		});

		server.on ("listening", () =>
		{
			console.log (chalk.greenBright ("WebSocket server is listening for new connections"));
			interval = setInterval (() => { testConnections (server.clients) }, 30000);
		})

		return server;
	},

	getGameId: () => { return createGameId(); },

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

function configureChallenge (client, opponent)
{	//	This is triggered when a message is received indicating a new user has selected an opponent.  That opponent
	//	might be the server or some other player on the waiting list.  It's also possible the player has decided to
	//	wait for someone to challenge them.

	if (opponent == "server") client.game.opponent = "server";
	else
	{

//	other options here...

	}


	client.send ("server ready");
}

//	03	const gameIDs = [];

function createGameId ()
{	//	Create a new Game Id and verify that it is unique.  Game IDs are a random string of 10 alpha-numeric
	//	characters.

	//	This function no longer checks to verify the Game Id is unique.  It's a 10 character code made up of
	//	uppercase letters, lowercase letters and single digit numerals.  That's 62 possible values for each character
	//	in the code and gosh but 10^62 is an awfully large number.  The odds of two identical codes being generated
	//	are vanishingly small.  The code is only used once, to get two players together.  The odds that two identical
	//	codes will be generated in the short window of opportunity for a duplicate to matter is effectively zero.
	//
	//	On the other hand, if I do keep track of Game Ids and don't have some code to clean-up the ones no longer
	//	in use, I will eventually have a memory problem.
	//
	//	I'm choosing the lesser of two evils: the extremely small chance that two identical codes will be created
	//	and the minor confusion that will create or the real (but still remote) chance that a vast number of unused
	//	Game Ids will eventually crash the server.
	//
	//	There's also a real world consideration.  Heroku will shut down the server when noone is using it and I'd
	//	lose any saved Game Ids any way.

	let string = "";

	for (let i=0; i<10; i++)
	{
		const index = Math.floor (Math.random() * 62);

		if (index < 10) string += String.fromCharCode (index + 48)
		else if (index < 36) string += String.fromCharCode (index + 55)
		else string += String.fromCharCode (index + 61);
	}

//	03		if (gameIDs.indexOf (string) > -1) string = createGameId ();

	return string;
}

function setGameStatusTrue (client) { client.game.status = true };

function testConnections (clientList)
{	//	Iterate through the set of clients and remove any that are not responding.
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

module.exports = WSS;
