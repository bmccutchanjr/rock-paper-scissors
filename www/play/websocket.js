//	This module is used to open a WebSocket connection to the server and handle communications.  It uses the browser
//	implementation of the WebSocket protocol.

function openWebSocket ()
{	//  Open a WebSocket to the test server and add some event listeners

	//	In the interest of making this code a little more portable, build the URL for the WebSocket server from
	//	the URL of the HTTP server this page was loaded from.  Thw HTTP and WebSocket servers are on the same machine
	//	and listening on the same port.

	const ws = new WebSocket ("ws://" + window.location.host);

	ws.onopen = function (event)
	{
		ws.send ("Hello!");
	};

	ws.onmessage = function (event)
	{   //  A message was received from the server

		switch (event.data)
		{
			case "ping":
			{   //  This is a message sent from the server at regular intervals to verify that all of the connections it has opened
				//  are still active.  If a user closed the web page or navigated away from this page the connection established here
				//  would no longer be active and if the server didn't clean up the garbage occasionally it would eventiually crash
				//  and burn.

				ws.send ("pong");
				break;
			}

			case "Welcome aboard!":
			{   //  This is the server's response to this browser's successful connection.  There really isn't much to do with
				//  it.  But its not an error either, so accomodate it.
				break;
			}

			default:
			{
				const data = JSON.parse(event.data);

				switch (data.message)
				{
					case "Availability Change":
					{
						changeAvailability (data)
						break;
					}
					default:
					{
						modal ("WEBSOCKET ERROR:\n\nAn unsupported message was received from the server", buzz);
					}
				}
			}
		}
	}
}