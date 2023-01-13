let domFlag = false;
let wssFlag = false;

openWebSocket()
.then (wss =>
{
//	This is where I initiate the game by telling the WebSocket server how the user has decided to play.
//
//	get cookie 'opponent' -- that tells the server how to configure...
//	tell the server
//	once the server has reponded in the affirmative, change the display attribute of the chat space and
//	game buttons...the DOM must be loaded, but it probably will be by this time...or I could could set a
//	flag to show the server is ready to go and call a function to change the display.  I also need to set
//	a flag in window.eventListener() and call the same function there, once everything is ready to go...
//	the function only changes the display attribute if both flags are set...
	getCookie ("opponent");

	wssFlag = true;
	showDOMElements();
})
.catch (error => { alert (error) } );

prefetchImages ();

function prefetchImages ()
{	//	I'm using images in the rock, paper and scissors buttons and alertnate images in hover styles.  The browser isn't
	//	going to request the image until they are referenced and that vreates some lag time between when the mouse rolls
	//	over a button and the new image is displayed.  I'm hoping that by requesting those images here (even though I'm
	//	not using them here) the browser will cache the images and have them available for the button hover event.

	let image = document.createElement ("img");
	image.src = "../images/rock-white.svg";
	image.src = "../images/rock-black.svg";
	image.src = "../images/paper-white.svg";
	image.src = "../images/paper-black.svg";
	image.src = "../images/scissors-white.svg";
	image.src = "../images/scissors-black.svg";
}

window.addEventListener ("load", event =>
{	event.preventDefault();

	//	If this is running then the browser has not disabled scripts...remove the noscript and hidden classes
	//	from <footer> and <main> respectively

	document.getElementsByTagName ("footer")[0].classList.remove ("noscript");
	document.getElementsByTagName ("main")[0].classList.remove ("hidden");


	domFlag = true;
	showDOMElements();
})

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
{	//	Change the display attribute of the DOM elements only when the DOM is loaded, the WebSocket connection has 
	//	been opened successfully and the server is configured to play...

	if (domFlag && wssFlag)
	{
		//	change the display attributes here...
	}
}