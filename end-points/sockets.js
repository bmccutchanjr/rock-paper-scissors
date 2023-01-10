//	This module houses the functions required by api.js to get information from the WebSocket server.

const wss = require ("../sockets.js");

const f =
{
	challengeAPlayer: () =>
	{	//	Forward a challenge from a new player to someone waiting for a match and wait for their reply.  Because
		//	we we can't control how quickly that player will respond, this must be handled as an asynchronous procedure.
		//
		//	return a Promise

		return new Promise ((resolve, reject) =>
		{

		})
	},

	getGameId: () =>
	{	//	Request a new unique game ID from the WebSocket server.  Game IDs are used to match up players before
		//	a game can actually begin and are required when 'challenging a friend' or 'challenging the server'.

		return wss.getGameId ();
	},

	getPlayerList: () =>
	{	//	Request a list of currently connected players waiting for a game.  A Promise may not actually be required
		//	here, but it doesn't hurt either.

		return new Promise ((resolve, reject) =>
		{
//	No one is connecting to the server during this portion of the development cycle -- so fake it.  Send properly
//	formulate gobbledy-gook
			const obj =
			{	"players": 1992,
				"games":	678,
				"wait-list":
					[
						"faithful squirrel",
						"happy bicycle",
						"juicy trumpet",
						"ultraviolet thrush",
						"pretty player",
						"ageless tiger",
						"hungry ladybug",
						"cute bicycle",
						"pretty badger",
						"red trombone",
						"captive kumquat"
					]
			}
			resolve (obj);
		})
	},
}

module.exports = f;