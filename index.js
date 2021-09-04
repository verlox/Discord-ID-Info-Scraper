const { TOKEN } = require("./cfg.json");

const axios = require("axios");
const { writeFileSync, readFileSync, existsSync, exists } = require("fs");
const { decode } = require("punycode");
require("colors");

var tokens, ids = [];

if (existsSync("ids.txt"))
  ids = readFileSync("ids.txt").toString().split('\n');

if (existsSync("tokens.txt"))
  tokens = readFileSync("tokens.txt").toString().split('\n');

// if theres tokens, decode them and add them to the ids list
if (tokens)
{
  for (var x = 0;x < tokens.length;x++)
  {
    const snowflake = decodeBase64(tokens[x].split('.')[0]);
    ids.push(snowflake);
    console.log(`Added token snowflake ${snowflake}`)
  }
}

// making the array
var json = [];

// set this var so that we can say how many items were removed from the array
let pre = ids.length;

// remove copies from array
// https://www.javascripttutorial.net/array/javascript-remove-duplicates-from-array/
ids = [...new Set(ids)];
console.log(`Removed ${pre - ids.length} copies from IDs array`.green);

if (!existsSync("scraped.json"))
  writeFileSync("scraped.json", "{\"users\":[]}");

function decodeBase64(str)
{
  return Buffer.from(str, "base64").toString("utf-8");
}

function userInfo(id)
{
  return new Promise((res, rej) => {
    axios.get(`https://discord.com/api/v9/users/${id}`, { // user information URL
    headers: {
      "authorization": TOKEN,
    }
  }).then(result => { // success
    console.log(`Got information on ${result.data.username}#${result.data.discriminator} (${id})`.green);
    return res(result);
  }).catch(er => { // error
    if (er.response && er.response.data.message == "You are being rate limited.") // doesnt mean user is unknown, just means we have to check again after a couple seconds
    {
      console.log(`${id} was ratelimited, retrying in ${er.response.data.retry_after}`.red);
      setTimeout(() => {
        return res(userInfo(id));
      }, Math.ceil(er.response.data.retry_after) * 1000)
    } else
    {
      console.log(`Failed to get information on ${id}`.red);
      return rej(er) // reject promise
    }
  });
  })
}

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
    return run(id + 1);

  console.log(`Checking ID ${ids[id]}`.yellow);
  
  userInfo(ids[id]).then(result => {
    json.push(result.data); // add teh user data to the json object
    run(id + 1);
  })
}

// use @me instead of getting id from first part of token, i had completely forgotten this until nows
userInfo("@me").then(info => {
  console.log(`Using token for account ${info.data.username}#${info.data.discriminator}`.cyan);
  run(0);
});