const TOKEN = "ODExNzg5NzMwNzY1MjA5NjQy.YC3USw.3_qOSbE-VDCK-rHasRBksAYGcrw";

const axios = require("axios");
const { writeFileSync, readFileSync, existsSync, exists } = require("fs");
require("colors");

var tokens, ids = [];

if (existsSync("ids.txt"))
  ids = readFileSync("ids.txt").toString().split('\n');

if (existsSync("tokens.txt"))
  tokens = readFileSync("tokens.txt").toString().split('\n');

if (tokens)
{
  for (var x = 0;x < tokens.length;x++)
  {
    const snowflake = Buffer.from(tokens[x].split('.')[0], "base64").toString("utf-8");
    ids.push(snowflake);
    console.log(`Added token snowflake ${snowflake}`)
  }
}


var json = []

let pre = ids.length;
// remove copies from array
// https://www.javascripttutorial.net/array/javascript-remove-duplicates-from-array/
ids = [...new Set(ids)];
console.log(`Removed ${pre - ids.length} copies from IDs array`.green);

if (!existsSync("scraped.json"))
  writeFileSync("scraped.json", "{\"users\":[]}");

function run(id)
{
  if (id > ids.length - 1)
  {
    console.log("Finished scraping IDs");
    
    // get the users already in the scraped file
    var diff = require("./scraped.json").users;
    
    // add all the new items
    for (var x = 0;x < json.length;x++)
      diff.push(json[x]);
    
    // keep only unique keys
    diff = { users: [...new Set(diff.map(JSON.stringify))].map(JSON.parse) };

    // write it back out
    writeFileSync("scraped.json", JSON.stringify(diff, null, 2));
    return;
  }

  if (ids[id] == '')

  console.log(`Checking ID ${ids[id]}`.yellow);
  axios.get(`https://discord.com/api/v9/users/${ids[id]}`, { // user information URL
    headers: {
      "authorization": TOKEN,
    }
  }).then(res => { // success
    console.log(`Got information on ${res.data.username}#${res.data.discriminator} (${ids[id]})`.green);
    json.push(res.data) // add teh user data to the json object
    run(id + 1) // run next user
  }).catch(er => { // error
    if (er.response && er.response.data.message == "You are being rate limited.") // doesnt mean user is unknown, just means we have to check again after a couple seconds
    {
      console.log(`${ids[id]} was ratelimited, retrying in ${er.response.data.retry_after}`.red);
      setTimeout(() => {
        run(id); // retry the user after this delay
      }, Math.ceil(er.response.data.retry_after) * 1000)
    } else
    {
      console.log(`Failed to get information on ${ids[id]}`.red);
      run(id + 1) // try and get next users info
    }
  });
}

run(0)