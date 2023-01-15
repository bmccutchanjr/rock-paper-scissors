//	This module is responsible for setting up the WebSocket server and event listeners to handle communication
//	from client devices.  It uses the ExpressJS server that is configured in server.js.
//

//	01	No longer tracking Game Id, but the code remains in case I decide to bring it back...

const chalk = require("chalk");			//	for clarity...chalk allows console.log() to use color
const ws = require("ws");

let interval = undefined;				//	initialze a variable for setInterval

const WSS = 
{
	createServer: HTTPServer =>
	{   //  Create the Webserver server and event handlers to manage connections

		const server = new ws.Server ( { "clientTracking": true, "server": HTTPServer } );

		server.on ("connection", client =>
		{
			client.ping();

			client.RPSConfig =
				{
					status:		undefined,
					name:		undefined,
					opponent:	undefined,
					wins:		0,
					losses:		0,
					ties:		0,
				}

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

				if ([ "rock", "paper", "scissors" ].indexOf (message) > -1) playTheGame (client, message);

				else if (message == "wait list")
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
//	console.log (object);
							if (object.configuration) configureGame (client, object.configuration);
							else if (object.message) forwardThisMessage (client, object.message);
							else if (object.selection) rockPaperScissors (client, object.selection);
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

function configureGame (client, config)
{	//	This is triggered when a message is received indicating a new user has selected an opponent.  That opponent
	//	might be the server or some other player on the waiting list.  It's also possible the player has decided to
	//	wait for someone to challenge them.

//	console.log (config);
	client.RPSConfig.name = config.name;

	if (config.opponent == "server") client.RPSConfig.opponent = "server";
	else
	{

//	other options here...
//	wait list
//		A client selecting the wait list will recieve a Game Id, assigned to the game.opponent property of the client
//		object.  That property can have three values; 'server', a client object or a Game Id.  So any client object in
//		server.clients with a game.opponent value not another client object and not the string "server" is on the
//		wait list.  When a challenge is issued and accepted, the Game Id will be replaced by the challenging player's
//		client object.
	}

	client.send ("server ready");
}

//	01	const gameIDs = [];

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

//	01		if (gameIDs.indexOf (string) > -1) string = createGameId ();

	return string;
}

function playTheGame (client, selection)
{	//	One round of game play.

	client.RPSConfig.selection = selection;

	if (client.RPSConfig.opponent == "server")
	{	//	Playing against the server...randomly select 'rock', 'paper' or 'scissors'.  Since we don't need
		//	to wait for a second player to select, return the results of the game.

		const pick = ["rock", "paper", "scissors"][Math.floor (Math.random() * 3)];
		const winOrLose = andTheWinnerIs (client.RPSConfig.selection, pick)
		gameAccumulator (client, winOrLose);
	}
	else
	{	//	If we're not playing the server, we're playing another user.  They may or may not have made their
		//	selection yet...

		const opponent = client.RPSConfig.opponent;
		if (opponent.RPSConfig.selection)
		{	//	Playing against another person.  We know the player represented by client has made their selection because
			//	we're here.  If the player's opponent has also made a selection, return the results of the game...and if they
			//	haven't do nothing.  We'll be here again when they do.

			const winOrLose = andTheWinnerIs (client.RPSConfig.selection, opponent.RPSConfig.selection)
			gameAccumulator (client, winOrLose);
			gameAccumulator (opponent, winOrLose * -1);
		}
	}
}

function andTheWinnerIs (player, opponent)
{	//	Evaluate the options selected and send the results to the users...

	//	Parameter 'player' is the selection made by the player represented by the client object that sent a
	//	message and initiated this comparison.  Opponent is the selection made by player's opponent.	

	if (player == opponent) return 0;					//	it's a tie
	else if ((player == "rock") && (opponent == "scissors")) return 1;
	else if ((player == "paper") && (opponent == "rock")) return 1;
	else if ((player == "scissors") && (opponent == "paper")) return 1;

	return -1;											//	any other combination and player loses
}

function gameAccumulator (player, result)
{	//	Acculumate the results and send a message to player

	let text = "";

	if (result == 1)
	{
		player.RPSConfig.wins += 1;
		text = "You won!";
	}
	else if (result == -1)
	{
		player.RPSConfig.losses += 1;
		text = "You lost";
	}
	else 
	{
		player.RPSConfig.ties += 1;
		text = "You tied";
	}

	const resultObject =
		{	result:	text,
			opponent:	player.RPSConfig.opponent == "server" ? "server" : player.RPSConfig.opponent.RPSConfig.name,
			wins:	player.RPSConfig.wins,
			losses:	player.RPSConfig.losses,
			ties:	player.RPSConfig.ties
		}

	//	...and send the results to player
	player.send (JSON.stringify ( { result: resultObject } ) );

	//	...and rest selection
	player.RPSConfig.selection = undefined;
}

function setGameStatusTrue (client) { client.RPSConfig.status = true };

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
		else if (c.RPSConfig.status == false) c.close();
	})

	// And the second go round...ping all of the remaining clients

	clientList.forEach (c =>
	{	//	For each client set the status of to false, then ping it.  If the client responds, the client
		//	pong event handler will set the status back to true.

		c.RPSConfig.status = false;
		c.ping()
	});
}

module.exports = WSS;
