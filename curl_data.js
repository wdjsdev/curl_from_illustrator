//curl data from a specified url and return the data as an anonymous object
//url is a string representing a web url ending with a resource string.
//arg is the value of the given variable on the end of the resource string
//example: 
	//url = "https://www.web.site/path/to/json_generator/scriptlet.nl?orderNumber="
	//arg = "1234567"
function curlData(url,arg)
{
	var result;
	var errorList = [];
	
	if(!arg)
	{
		errorList.push("Failed to get the data from netsuite. The required information was missing.");
		return result;
	}


	var documentsPath = "~/Documents/";
	var resourcePath = documentsPath + "curl_script_resources/";

	var localDataFile = File(documentsPath + "curlData/curlData.txt");
	var executor = File(resourcePath + "/curl_from_illustrator.app");
	var killExecutor = File(resourcePath + "/kill_curl_from_illustrator.app");


	//write the dynamic .scpt file
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


	//clear out the local data file..
	//make sure we always start with an empty string
	localDataFile.open("w");
	localDataFile.write("");
	localDataFile.close();

	

	//try to read the data
	var curTries = 0;
	var maxTries = 101;
	var delay 100;

	var parsedJSON;
	var htmlRegex = /<html>/gmi;

	//as long as the json data is invalid
	//and the max number of attempts has not been exhausted
	//try and gather the data
	while(!parsedJSON && curTries < maxTries)
	{
		if(result === "")
		{
			try
			{
				if(curTries === 50)
				{
					//executor probably hanging.. kill it and try again.
					killExecutor.execute();
				}

				executor.execute();
			}
			catch(e)
			{
				return;
			}
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