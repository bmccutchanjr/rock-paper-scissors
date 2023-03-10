//	To start, get the list of available players from the server.  This is an asynchronous procedure and the data
//	retrieved probably won't change much in just a few minutes.  So there's no reason not to get the player list
//	right up front, saves the user a few seconds waiting later...
getPlayerList();

window.addEventListener ("load", event =>
{	event.preventDefault();

	//	If this id running then the browser has not disabled scripts...remove the noscript and hidden classes
	//	from <footer> and <main> respectively

	document.getElementsByTagName ("footer")[0].classList.remove ("noscript");
	document.getElementsByTagName ("main")[0].classList.remove ("hidden");

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

		case "next-button":
		{
			hideElementById ("next-button");
			showElementById ("players-section");
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
//				alert ("challenge-server");
//	It doesn't seem like I can code the game configuration into the url.  The next page does know what the url I
//	requested is (play against the server, play a friend's challenge or wait for a challenger) but the server's
//	route handler gets very complicated AND no longer works with the 404 page.  The server apparently thinks it
//	has something to serve and gets lost in the weeds looking for it.
//
//	I need a cookie... 

			setCookie ("server");
			window.location = "http://localhost/play";
			break;
		}

		case "challenge-friend":
		{
			//	generate a game ID and display a URL on the screen...the user is responsible for sending
			//	the URL to someone...load the game page with the generated game ID...the user waits for
			//	their opponent to load the page

			ajax ("get", "/api/get-game-id")
			.then (data =>
			{
				if (data.status == 200)
				{
					const url = document.getElementById ("challenge-link");
					if (url.firstChild) url.removeChild (url.firstChild);

					const link = document.createElement ("a");
					link.href = "http://localhost/challenge/" + data.responseText;
					link.innerText = "http://localhost/challenge/" + data.responseText;

					url.append (link);
				}
			})
			.catch (error => { alert (error) } );

			break;
		}

		default:
		{
			break;
		}
	}
}

function setCookie (opponent)
{	//	Cookie setter.  Cookies are used to communicate the player's name and selected game option to game.html.  The
	//	cookie is used once and that would be almost immediately, so maxAge is 5 minutes.
	//
	//	The only parameter to this function is the opponent the player has selected

	const cookie = 
		{
			name:	document.getElementById ("name-input").value,
			opponent:	opponent
		}
	document.cookie = "RPSConfiguration=" + JSON.stringify(cookie) + "; path=/; max-age=86400;";
}

function getRandomName ()
{
	ajax ("get", "/api/pick-a-name")
	.then (data =>
	{
		if (data.status == 200)
		{
			document.getElementById ("name-input").value = data.responseText;
			hideElementById ("get-a-name");
			showElementById ("next-button");
		}
		else
		{
			alert ("Something went wrong");
			slert (data.status);
			alert (data.responseText);
		}
	})
	.catch (error => { console.log (error); } );
}

function nameInputHandler (event)
{	event.preventDefault ()

	//	Handle the 'input' event for the name <input> element...basically changes the classList of the associated
	//	<button> elements to hide or display them

	if (event.target.value == "")
	{
		hideElementById ("next-button");
		hideElementById ("players-section");
		showElementById ("get-a-name");
	}
	else
	{
		hideElementById ("get-a-name");
		showElementById ("next-button");
	}
}

function hideElementById (id)
{	//	Use classList.add() to add a class 'hidden' to the specified element

	document.getElementById (id).classList.add ("hidden");
}

function showElementById (id)
{	//	Use classList.remove() to remove a class 'hidden' from the specified element

	document.getElementById (id).classList.remove ("hidden");
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

	ajax ("get", "/api/get-player-list")
	.then (data =>
	{
		if (data.status == 200)
		{
			populatePlayerList (JSON.parse (data.responseText));
		}
		else new Error (data.status + ":  " + data.responseText);
	})
	.catch (error => { alert (error) } )
}

function populatePlayerList (data)
{	//	Get the list of current players into the DOM...

	const playerCount = document.getElementById ("player-count");
	playerCount.innerText = data.players;

	const gameCount = document.getElementById ("game-count");
	gameCount.innerText = data.games;

	const waitCount = document.getElementById ("wait-count");
	waitCount.innerText = data["wait-list"].length;

	const playerList = document.getElementById ("wait-list");
	data["wait-list"].forEach (w =>
	{
		const div = document.createElement ("div");
		div.classList.add ("waiting");

		const button = document.createElement ("button");
		button.classList.add ("challenge-button");
		button.innerText = "challenge";
		button.setAttribute ("gameID", w.gameID);
		div.append (button);

		const name = document.createElement ("div");
		name.innerText = w.name;
		name.setAttribute ("gameID", w.gameID);
		div.append (w);

		playerList.append (div);
	})
}
