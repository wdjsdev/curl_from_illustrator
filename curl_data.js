//curl data from a specified url and return the data as an anonymous object
//url is a string representing a web url ending with a resource string.
//arg is the value of the given variable on the end of the resource string
//example: 
	//url = "https://www.web.site/path/to/json_generator/scriptlet.nl?orderNumber="
	//arg = "1234567"

/*

	How it works:
		Feed in a url and an argument. For my purposes, this has been
		a url and an order number as indicated above. This could be pointed
		to some API and the resource string could be built dynamically to get
		all the data you'd need.

		Using the given arguments, an applscript (.scpt) file is written locally
		which contains the instructions for running a shell script to execute
		a curl command.

		Unfortunately, we cannot execute a .scpt file from extendscript,
		so we need to use a preexisting .app that executes the .scpt file.
		curl_from_illustrator.app can be executed from extendscript, and this
		app executes the .scpt. For this reason, if you change the name or location
		of the .scpt, you will need to update the .app file to reflect this. I would
		love to hear suggestions on how to improve this or prevent that dependency..

		The .app executes the .scpt file which curls the data from the given url,
		saves it to a local data file, then several attempts are made to parse and
		validate the incoming data. I have been using this to pull JSON data, so the
		logic below is just trying to parse json data. This could be changed to fit any
		use case, I'm sure.

		If the data is deemed valid, it will be returned, otherwise 'undefined' is returned.



*/
function curlData(url,arg)
{
	var result;
	var errorList = [];
	var parsedJSON;
	var htmlRegex = /<html>/gmi;


	var documentsPath = "~/Documents/";
	var resourcePath = documentsPath + "curl_script_resources/";

	//the shell script will point the result of the curl command to this file
	var localDataFile = File(documentsPath + "curlData/curlData.txt");

	//this is the applescript .app that calls the dynamically written .scpt file 
	var executor = File(resourcePath + "/curl_from_illustrator.app");

	//applescript app for killing the executor if it gets hung
	var killExecutor = File(resourcePath + "/kill_curl_from_illustrator.app");


	//write the dynamic .scpt file
	//this curl command pulls down all of the contents of the webpage and saves them
	//into the localDataFile for reading and validation
	var scptText =
		[
			"do shell script ",
			"\"curl \\\"" + url,
			arg + "\\\" > \\\"",
			localDataFile.fullName + "\\\"\""
		];
	var dataString = scptText.join("");
	var scriptPath = documentsPath + "curlData/"
	var scriptFolder = new Folder(scriptPath);
	if(!scriptFolder.exists)
	{
		scriptFolder.create();
	}
	var scptFile = new File(scriptPath + "curl_from_illustrator.scpt");

	scptFile.open("w");
	scptFile.write(dataString);
	scptFile.close();


	//scptFile is written, now get ready to read the data
	var curTries = 0;
	var maxTries = 101;
	var delay 100;


	//first clear out the local data file..
	//make sure we always start with an empty string
	localDataFile.open("w");
	localDataFile.write("");
	localDataFile.close();


	//as long as the json data is invalid
	//and the max number of attempts has not been exhausted
	//try and gather the data
	while(!parsedJSON && curTries < maxTries)
	{
		if(result === "")
		{
			if(curTries === 50)
			{
				//executor probably hanging.. kill it and try again.
				killExecutor.execute();
			}

			executor.execute();

		}

		//check that the local data file was written
		localDataFile.open("r");
		result = localDataFile.read();
		localDataFile.close();


		//make sure that the data is not in HTML format
		if(htmlRegex.test(result))
		{
			errorList.push("Netsuite returned improper data for " + arg + ".")
			break;
		}

		if(result !== "")
		{
			//there's SOMETHING in the local data file
			try
			{
				parsedJSON = JSON.parse(result);
				//hooray. we've got valid json data
			}
			catch(e)
			{ 
				//data was invalid
			}
		}

		curTries++;
		$.sleep(delay);
	}

	if(errorList.length)
	{
		alert("The following errors ocurred:\n" + errorList.join("\n"));
	}

	return parsedJSON;

}