# curl_from_illustrator
use bash and applescript to request data from specific url

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
