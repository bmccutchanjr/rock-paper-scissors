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

//	01		const config = getCookie ("opponent")
const config = getCookie ("RPSConfiguration")
//	console.log (config);

	//	...and send the configuration to the server...

//		if (config) wssSend ( { "challenge": getCookie ("opponent") } ); 
//	if (config) wssSend ( config ); 
if (config) wssSend ( { "configuration": config } );
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
{	event.preventDefault();;

	//	If this is running then the browser has not disabled scripts...remove the noscript and hidden classes
	//	from <footer> and <main> respectively

	document.getElementsByTagName ("footer")[0].classList.remove ("noscript");

	DOMIsLoaded = true;
	showDOMElements();

document.getElementById ("button-section").addEventListener ("click", event =>
{	event.preventDefault();

	const id = event.target.getAttribute ("id");
	if (id != undefined) wssSend (id)
})
})

prefetchImages ();

function prefetchImages ()
{	//	I'm using images in the rock, paper and scissors buttons and alernate images in hover styles.  But the browser
	//	doesn't request those images until they're referenced and that creates some lag time between when the mouse
	//	rolls over a button and the new image is displayed -- which will only be more obvious when this is hosted on the
	//	web.  So fetch them now...and the browser will use them from cache when they're needed.

	//	The buttons are created with the white versions of the SVG, so they're needed first.

	document.createElement ("img").src = "../images/rock-white.svg";
	document.createElement ("img").src = "../images/paper-white.svg";
	document.createElement ("img").src = "../images/scissors-white.svg";

	//	The black versions are used in the button's hover style and won't be needed until the DOM is loaded and the
	//	user has a chance to click a button, so they can wait a few milliseconds

	document.createElement ("img").src = "../images/rock-black.svg";
	document.createElement ("img").src = "../images/paper-black.svg";
	document.createElement ("img").src = "../images/scissors-black.svg";
}

let DOMIsLoaded = false;
let wssIsReady = false;
let playAgainstServer = true;

//	02	I don't seem to be using this code...
//	02	function configureTheGame ()
//	02	//	01	{	//	The user chooses how they want to play in home.html and that configuration is passed to this page with a
//	02	//	01		//	cookie.  Get that cookie...
//	02	//	01	
//	02	//	01		const opponent = getCookie ("opponent");
//	02	//	01	
//	02	//	01		if (opponent == "server") playAgainstServer = true;
//	02	//	01		else if (opponent != "")
//	02	//	01		{	
//	02	//	01			playAgainstServer = false;
//	02	//	01			useGameID = opponent;
//	02	//	01		}
//	02	{	//	home.html passes a cookie with the game configuration the player selected.  That configuration includes the
//	02		//	name they have chosen to play with and the opponent they have selected.  Get that cookie...
//	02	
//	02		const cookie = getCookie ("RPSConfiguration");
//	02	
//	02		if (cookie.opponent == "server") playAgainstServer = true;
//	02		else if (cookie.opponent != "")
//	02		{	
//	02			playAgainstServer = false;
//	02			useGameID = opponent;
//	02		}
//	02	
//	02		return cookie;
//	02	}

function getCookie (name)
{   //  Parse the cookie string and return the value of the selected cookie

	let value = undefined;

	const cookies = document.cookie.split (";");
	cookies.forEach (c =>
	{
		const cPrime = c.split ("=");
		if (cPrime[0].trim() == name) value = cPrime[1];
	})

//	01	return value;
	return JSON.parse (value);
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
