## Discord ID Scraper
This application scrapes information from Discord's API based on user's ID's.

## Requirements
* NodeJS
* Required Node modules
  * `colors`
  * `axios`
* List of IDs

## Install / run
1. Clone repo and extract it
2. Open command prompt in the application's directory
3. Run `npm i` (this will install the modules)
4. Rename `ids.txt.example` to `ids.txt` and replace all the text with your list of IDs
5. Change the `TOKEN` variable in `index.js` to your Discord token
6. Run `node index.js` in command prompt
7. Sit back and wait. The output of the scraping will be in `scraped.json`