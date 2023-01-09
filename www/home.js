//	To start, get the list of available players from the server.  This is an asynchronous procedure and the data
//	retrieved probably won't change much in just a few minutes.  So there's no reason not to get the player list
//	right up front, saves the user a few seconds waiting later...
getPlayerList();

window.addEventListener ("load", event =>
{	event.preventDefault();

	splashScreen (0);

	//	Add some event listeners...

	const main = document.getElementsByTagName ("main")[0];
	main.addEventListener ("click", event => { mainClickHandler (event) } );

	const name = document.getElementById ("name-input");
	name.addEventListener ("input", event => { nameInputHandler (event) } );
})

function mainClickHandler (event)
{	event.preventDefault();

	//	One listener for all click events in <main>
		
	const target = event.target;
	switch (target.getAttribute ("id"))
	{
		case "get-a-name":
		{
			getRandomName();
			break;
		}

		case "wait":
		{
			//	load the game page with no game or opponent...the user will wait until someone else
			//	loads the page and challenges them.
			alert ("wait");
			break;
		}

		case "challenge-server":
		{
			//	load the game page with the server as the opponent...the user makes their selection
			//	and the server randomly selects an option
			alert ("challenge-server");
			break;
		}

		case "challenge-friend":
		{
			//	generate a game ID and display a URL on the screen...the user is responsible for sending
			//	the URL to someone...load the game page with the generated game ID...the user waits for
			//	their opponent to load the page
			alert ("challenge-friend");
			break;
		}

		default:
		{
			break;
		}
	}
}

function getRandomName ()
{
	ajax ("get", "/api/pick-a-name")
	.then (data => { document.getElementById ("name-input").value = data; } )
	.catch (error => { console.log (error); } );
}

function nameInputHandler (event)
{	event.preventDefault ()

	//	Handle the 'input' event for the name <input> element...basically changes the classList of the associated
	//	<button> elements to hide or display them

	const next = document.getElementById ("next-button");
	const pick = document.getElementById ("get-a-name");

	if (event.target.value == "")
	{
		hideElement (next);
		showElement (pick);
	}
	else
	{
		hideElement (pick);
		showElement (next);
	}
}

function hideElement (element)
{	//	Use classList.add() to add a class 'hidden' to the specified element

	element.classList.add ("hidden");
}

function showElement (element)
{	//	Use classList.remove() to remove a class 'hidden' from the specified element

	element.classList.remove ("hidden");
}

function splashScreen (count)
{	//	Animate the "splash page"...in quotes because it isn't a separate page, but some animation that happens
	//	when the page loads...

	//	This apparently doesn't work if I'm using one DOM element and simply changing the innerText and class.  It
	//	either only does the animation for the first element of message[] or for the last, but never all of them.
	//
	//	Take that back, it works if I step through in debug mode.  But it's not a timing issue because it doen't
	//	matter how long the animation is or how long the delay is.  It only works if I actually add a DOM element
	//	to <main> in each iteration.  Not what I expected, but it works now...

	//	If <main> has a child element with id = "title-animation", remove it.

	let fade = document.getElementById ("title-animation");
	if (fade) document.getElementsByTagName ("main")[0].removeChild (fade);

	//	create and configure a new element with id = "title-fade" and append it to <main>

	const message = [ "Let's", "play", "Rock", "Paper", "Scissors" ];
	if (count >= message.length)
	{	//	If count is greater then message.length, the entire splash screen animation has played...change the
		//	display attribute of the name section and return.

		document.getElementById ("name-section").classList.remove ("hidden");
		return;
	}

	fade = document.createElement ("div");
	fade.setAttribute ("id", "title-animation");
	fade.classList.add ("title-animation");
	fade.innerText = message[count];
	document.getElementsByTagName ("main")[0].append (fade);

	//	increment count and invoke titleFade().  I couldn't get setTimeout to pass a parameter to titleFade() with
	//	either old-style functions or arrow functions, so count is a global variable.

	setTimeout (_ => { splashScreen (++count); }, 800 );
}

function getPlayerList ()
{	//	Get a list of current players from the server API...

//		ajax ()
}

function populatePlayerList (data)
{	//	Get the list of current players into the DOM...

	const playerCount = document.getElementById ("player-count");
	playerCount.innerText = data.playerCount;

	const gameCount = document.getElementById ("game-count");
	gameCount.innerText = data.gameCount;

	const waitCount = document.getElementById ("wait-count");
	waitCount.innerText = data.waitCount;

	const playerList = document.getElementById ("wait-list");
	data.waitList.forAll (w =>
	{
		const div = document.createElement ("div");
		div.classList.add ("waiting");

		const name = document.createElement ("div");
		name.innerText = w.name;
		name.setAttribute ("gameID", w.gameID);
		div.append (name);

		const button = document.createElement ("button");
		button.innerText = "CHALLENGE";
		button.setAttribute ("gameID", w.gameID);
		div.append (button);

		playerList.append (div);
	})
}
