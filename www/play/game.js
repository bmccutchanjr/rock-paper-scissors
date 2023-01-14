document.addEventListener ("server-ready", event =>
{	//	A custom event triggered by a WebSocket message recieved from the server.

//	Either my Promise is not working correctly, or WS is incredibly fast.  This event listener was not getting
//	added when coded after the call to openWebSocket().  Truth be told, it was also after prefetching the images
//	and now I wonder if that is not also async?  Should I move prefetch?

	wssIsReady = true;
	showDOMElements ();
})

openWebSocket()
.then (wss =>
{
	//	Initiate the game by telling the WebSocket server how the user has decided to play.  That choice
	//	was made in home.html and passed to this page with a cookie.  So...get the cookie.

	const config = getCookie ("opponent")

	//	...and send a message to the server

	if (config) wssSend ( { "challenge": getCookie ("opponent") } ); 
	else
	{
		alert ("wait list");
		wssSend ("wait list");
	}

	//	websocket.js listenes for the cooresponding reponse from the server and once recieved, dispatches an event
	//	to configure this page and allow the user to play.
})
.catch (error => { alert (error) } );

window.addEventListener ("load", event =>
{	event.preventDefault();

	//	If this is running then the browser has not disabled scripts...remove the noscript and hidden classes
	//	from <footer> and <main> respectively

	document.getElementsByTagName ("footer")[0].classList.remove ("noscript");

	DOMIsLoaded = true;
	showDOMElements();
})

prefetchImages ();

function prefetchImages ()
{	//	I'm using images in the rock, paper and scissors buttons and alernate images in hover styles.  But the browser
	//	doesn't request those images until they're referenced and that creates some lag time between when the mouse
	//	rolls over a button and the new image is displayed -- which will only be more obvious when this is hosted on the
	//	web.  So fetch them now...and the browser will use from cache when they're needed.

	let image = document.createElement ("img");
	image.src = "../images/rock-white.svg";
	image.src = "../images/rock-black.svg";
	image.src = "../images/paper-white.svg";
	image.src = "../images/paper-black.svg";
	image.src = "../images/scissors-white.svg";
	image.src = "../images/scissors-black.svg";
}

let DOMIsLoaded = false;
let wssIsReady = false;
let playAgainstServer = true;

function configureTheGame ()
{	//	The user chooses how they want to play in home.html and that configuration is passed to this page with a
	//	cookie.  Get that cookie...

	const opponent = getCookie ("opponent");

	if (opponent == "server") playAgainstServer = true;
	else if (opponent != "")
	{	
		playAgainstServer = false;
		useGameID = opponent;
	}
}

function getCookie (name)
{   //  Parse the cookie string and return the value of the selected cookie

	let value = undefined;

	const cookies = document.cookie.split (";");
	cookies.forEach (c =>
	{
		const cPrime = c.split ("=");
		if (cPrime[0].trim() == name) value = cPrime[1];
	})

	return value;
}

function showDOMElements ()
{	//	These elements are hidden by default so they don't appear on screen if JavaScript is disabled.  They should
	//	only be made visible once the DOM is loaded and the WebSocket server is configured and ready to play.
	//
	//	Further, the message section should remain hiddden if the user has opted to play against the server.

	if (DOMIsLoaded && wssIsReady)
	{	document.getElementsByTagName ("main")[0].classList.remove ("hidden");

		if (!playAgainstServer)
		{	//	Because I use an id (#message-section) to reference this element, I can't override the display
			//	property with a class.  In fact, I can't even override another class because the element has an id.
			//	So it seems to dynamically hide / display this element, I can have no display property in any CSS
			//	rule applied to the element.  The flex-box configuration nust in be a dynamically assigned class as
			//	well.  So now, remove class hidden from the classList and add class flex-box.

			document.getElementById ("message-section").classList.add ("flex-box");
			document.getElementById ("message-section").classList.remove ("hidden");
		}
	}
}
