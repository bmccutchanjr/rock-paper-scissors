//	This module is used to open a WebSocket connection to the server and handle communications.  It uses the browser
//	implementation of the WebSocket protocol.

//	01	"ping" is an automatic function...I don't need this code

let wss = {};

function openWebSocket ()
{	//  Open a WebSocket to the test server and add some event listeners

	//	Because this is an asynchronous procedure...return a Promise

	return new Promise ((resolve, reject) =>
	{	
		wss = new WebSocket ("ws://" + window.location.host);

		//	In the interest of making this code a little more portable, use window.location.host for the URL rather
		//	than hardcoding it.  The HTTP and WebSocket servers are on the same machine.

		wss.onerror = function (event) { reject (error) };

		wss.onopen = function (event) { resolve (wss); };

		wss.onmessage = function (event)
		{   //  A message was received from the server

			if (event.data == "server ready") document.dispatchEvent (new Event ("server-ready"));
			//	"server-ready" indicates the server has configured a game for this player and is ready to go.  Configure the DOM
			//	elements so the user can play also.
// if (event.data == "server ready")
// {
// 	alert ("dispatching new Event ('server-ready'");
// 	document.dispatchEvent (new Event ("server-ready"));
// //	"server-ready" indicates the server has configured a game for this player and is ready to go.  Configure the DOM
// //	elements so the user can play also.
// }
			else if (event.data == "results") document.dispatchEvent (new Evet ("you-win"));
			else
			{
				alert ("WEBSOCKET ERROR:\n\nThe WebSocket received an unsupported message.  See console.log for more details");
				console.log ("WEBSOCKET ERROR:");
				console.log ("An unsupported message was received:");
				console.log (event.data);
			}
		}

	})
}

function wssSend (message)
{	//	Unlike HTTP, WebSockets sends all messages as binary data which is received as a Buffer object.  Some messages
	//	sent to the server are simply string types and the server has no problem converting those to back to strings
	//	so they can be used.  But there does not seem to be a simple way to convert a Buffer into a useable object.
	//
	//  But converting an object to a string type is trivial.  So, everything sent to the server must be a string
	//	including objects.

	if (typeof message == "object") message = JSON.stringify (message);
	wss.send (message);
}