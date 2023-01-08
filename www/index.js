getPlayerList();

window.addEventListener ("load", event =>
	{	event.preventDefault();

		splashScreen();
	})

let count = 0

function splashScreen ()
{	//	Animate the "splash page"...in quotes because it isn't a separate page, but some animation that happens
	//	when the page loads...

	//	This apparently doesn't work if I'm using one DOM element and simply changing the innerText and class.  It
	//	either only does the animation for the first element of message[] or for the last, but never all of them.
	//
	//	Take that back, it works if I step through in debug mode.  But it's not a timing issue because it doen't
	//	matter how long the animation is or how long the delay is.  It only works if I actually add a DOM element
	//	to <main> in each iteration.  Not what I expected, but it works now...

	//	If <main> has achild element with id = "title-fade", remove it.

	let fade = document.getElementById ("title-fade");
	if (fade) document.getElementsByTagName ("main")[0].removeChild (fade);

	//	create and configure a new element with id = "title-fade" and append it to <main>

	const message = [ "Let's", "play", "Rock", "Paper", "Scissors" ];
	if (count >= message.length) return;

	fade = document.createElement ("div");
	fade.setAttribute ("id", "title-fade");
	fade.classList.add ("title-fade");
	fade.innerText = message[count];
	document.getElementsByTagName ("main")[0].append (fade);

	//	increment count and invoke titleFade().  I couldn't get setTimeout to pass a parameter to titleFade() with
	//	either old-style functions or arrow functions, so count is a global variable.

	++count;
	setTimeout ( titleFade, 800 );
}

function getPlayerList ()
{	//	Get a list of current players from the server API...

	ajax ()
}

function populatePlayerList (data)
{	//	Get the list of current players into the DOM...

	const playerCount = document.getElementById ("player-count");
	playerCount.innerText = data.playerCount;

	const gameCount = document.getElementById ("game-count");
	gameCount.innerText = data.gameCount;

	const waitCount = document.getElementById ("wait-count");
	waitCount.innerText = data.waitCount;

}
