//	This module houses the functions needed to request data from server APIs via XMLHTTPRequest.

function ajax (method, route, data)
{	//	Make a request to a API end point on the server and wait for a responce.

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
			reject (error)
		}

		const xml = new XMLHttpRequest ();

		xml.open (method, route);
		if (method != "POST")
			xml.send();
		else
		{
			xml.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
			xml.send (postData);
		}

		xml.onreadystatechange = () =>
		{
			if (xml.readyState == 4) resolve (xml.responseText);
//	xml.responseText is just the response text and does not include the status (200, 404, 500, etc.).  Status may be
//	important to the function that made this request, so it might be better to resolve the entire xml response and let
//	that function deal with it.  Maybe what I need to do is resolve an object with the status and responseText, but
//	that's not really any different...
		}

		xml.onfailure = (error => reject);
	})
}
