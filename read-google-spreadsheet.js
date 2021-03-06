const fs = require('fs');
const md5 = require('md5');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'config/token.json';
let spreadsheetId = '';


// Load spreadsheet Id from config file
fs.readFile('config/config.json', (err, content) => {
  if (err) return console.log('Error loading config file:', err);
  const config = JSON.parse(content);
  spreadsheetId = config.spreadsheetId;

  start();
});

function start() {
  // Load client secrets from a local file.
  fs.readFile('config/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
  });
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


var dataset = [];

var siteConfig = {
  build: {
    srcPath: './src',
    outputPath: './public'
  },
  site: {
    title: 'SpassMitDaten.de',
    categories: [],
    regions: [],
    tags: []
  }
};

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'Linkliste!A4:H',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      
      /*
      Link	Datum	Typ	Relevanz	Stichworte	Region	Titel	Beschreibung

      [ 'https://www.kommune21.de/',
  '20.11.2018',
  'News',
  '1',
  'Nachrichten, Open Government',
  '',
  'Kommune21',
  'Nachrichtenmagazin für Open Data, Open Government, und Digitalisierung' ]
*/
      var keywords = {};
      rows.map((row) => {
        if (row[2]) {
          const type = row[2];
          const area = row[5];
          const keyw = row[4];
          const filename = md5(row[0]);
          const imgpath = "screenshots/small/" + filename + ".jpg";
          dataset.push({
            link: row[0],
            date: row[1],
            type: type,
            prio: row[3],
            keyw: keyw,
            area: area,
            titl: row[6],
            desc: row[7],
            img: fs.existsSync(imgpath) ? filename : ""
          });
          if (type && !siteConfig.site.categories.includes(type)) {
            siteConfig.site.categories.push(type);
          }
          if (area && !siteConfig.site.regions.includes(area)) {
            siteConfig.site.regions.push(area);
          }

          if (keyw) {
            keyw.split(',').map(function(s) { 
              const keyword = s.trim(); 
              if (keywords[keyword]) {
                keywords[keyword]++;
              } else {
                keywords[keyword] = 1;
              }
            });
          }

        }
      });

      function comparator(data) {
        var dd = "" + data["date"].substr(6,4) + data["date"].substr(3,2) + data["date"].substr(0,2);
        console.log(dd);
        return dd;
      }

      dataset.sort(function(a, b) {
        if (comparator(a) > comparator(b))
          return -1;
        if ( comparator(a) < comparator(b))
          return 1;
        return 0;
      });

      // sort the taglist by most used
      var keys = Object.keys(keywords);
      keys.sort(function(a, b) {
          return keywords[a] - keywords[b]
      }).reverse().forEach(function(k) {
        if (keywords[k] > 1) {
          siteConfig.site.tags.push([k, keywords[k]]);
        }
      });

      const outputFile = "src/assets/links.json";
      fs.writeFile(outputFile, JSON.stringify({links: dataset}), function(err) {
        if(err) {
            return console.log(err);
        }
        const filestats = fs.statSync(outputFile);
        console.log("The links.json file was saved:", outputFile, "size:", filestats.size);
      }); 
      
      fs.writeFile("site.config.js", 'module.exports = ' + JSON.stringify(siteConfig) + ';', function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The site.config.js file was saved!");
      }); 

    } else {
      console.log('No data found.');
    }
  });


}