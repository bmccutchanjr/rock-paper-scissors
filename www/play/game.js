openWebSocket();

alert (window.location);

window.addEventListener ("load", event =>
{	event.preventDefault();

	//	If this is running then the browser has not disabled scripts...remove the noscript and hidden classes
	//	from <footer> and <main> respectively

	document.getElementsByTagName ("footer")[0].classList.remove ("noscript");
	document.getElementsByTagName ("main")[0].classList.remove ("hidden");

})