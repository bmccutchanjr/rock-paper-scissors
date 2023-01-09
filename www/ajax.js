//	This module houses the functions needed to request data from server APIs via XMLHTTPRequest.

function ajax (method, route, data)
{	//	Make a request to a API end point on the server and wait for a responce.

//	02		//  Because the function call is expecting a Promise, it needs a reject or resolve, not a simple boolean
//	02		//  value.  Reject and resolve are only available in the Promise's callback and so the parameters must be
//	02		//  validated in callback.

return new Promise ((resolve, reject) =>
{
	try
	{
		if (typeof method != "string") new Error ("'method' is not a string.");

		method = method.toUpperCase ();
		if ((method != "GET") && (method != "POST")) new Error ("'method' is not a supported HTTP method.");

		if (typeof route != "string") new Error ("'route' is not a string.");

		let postData = "";

		if (method == "POST")
		{
			if (data == undefined) new Error ("'request data' is required for POST requests.");

			if (typeof data != "object")new Error ("'request data' is not JSON object.");

			let post = [];

			try
			{   data.forEach (d =>
				{
					Object.entries (d).forEach (entry =>
					{
						post.push (entry[0] + "=" + entry[1]);
					});
				})
			}
			catch (error)
			{   //  This is not actually an error.  Post data passed to this function canbe either an array or an object.
				//	JavaScript can iterate an array with .forEach() but not an object.  JavaScript can iterate an object
				//	with .forAll() but not an array.
				//
				//  So try to use .forEach() and if the script throws an error treat it like an object.
				
				Object.entries (data).forEach (entry =>
				{
					post.push (entry[0] + "=" + entry[1]);
				});
			}

			postData = post.join ("&");
		}
	}
	catch (error)
	{
console.log ("rejecting: " + error);
//	Confused...does throwing a new Error automatically imply a reject or do I still have to code that?
		resolve (error)
	}

	const xml = new XMLHttpRequest ();

	xml.open (method, route);
	if (method != "POST")
		xml.send ();
	else
	{
		xml.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
		xml.send (postData);
	}

	xml.onreadystatechange = () =>
	{
//	02			if (xml.readyState == 4)
//	02			{   
//	02	//  Error handling SUCKS!  When you catch errors, JavaScript won't expose all of the information that is available when
//	02	//  you don't catch error -- it makes debugging very difficult.  So error handling is disabled during the development
//	02	//  cycle.
//	02	//			  try
//	02	//			  {
//	02					switch (xml.status)
//	02					{
//	02						case 200:
//	02						{
//	02							switchHandlers[200](xml);
//	02							break;
//	02						}
//	02						case 204:
//	02						{
//	02							switchHandlers[204](xml);
//	02							break;
//	02						}
//	02						case 205:
//	02						{
//	02							switchHandlers[205](xml);
//	02							break;
//	02						}
//	02						default:
//	02					{
//	02	//  01						  playAudio (buzz);
//	02							if (switchHandlers["default"])
//	02								switchHandlers["default"](xml);
//	02							else
//	02								modal (xml.responseText);
//	02							break;
//	02						}
//	02					}
//	02	//			  }
//	02	//			  catch(error)
//	02	//			  {
//	02	//  //  01				  playAudio (buzz);
//	02	//				  modal (error);
//	02	//			  
//	02			}
if (xml.readyState == 4) resolve (xml);
	}

//	02		xml.onfailure = error =>
//	02		{
//	02	//  01		  playAudio(buzz);
//	02			modal (error);
//	02		}
	xml.onfailure = (error => reject);
})
}
