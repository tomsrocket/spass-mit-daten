"use strict";

var app = require("node-server-screenshot");
var md5 = require('md5');
var fs = require('fs');

var pageWidth = 1280;
var pageHeight = 1024;


// read all urls from config file
var content = fs.readFileSync('public/links.json');
var links = JSON.parse(content);
var urls = links.links.map(function (url) {
    return url.link;
});
console.log("LIST OF URLS", urls);

console.log("");
console.log("=========================================================000");
console.log("================ generate all screenshots ===============000");
console.log("=========================================================000");
console.log("");

(async () => {

    try {
        for (let i = 0; i < urls.length; i++) {
            
            let address = urls[i];
            var file = md5(address) + ".png"
            var output = "screenshots/large/" + file;
            
            var fileSizeInBytes = 0;
            if (fs.existsSync(output)) {
                const stats = fs.statSync(output);
                fileSizeInBytes = stats.size; 
            }
            if (fileSizeInBytes > 50) {
                
                // screenshot is alread there
                console.log("skipping", address, output);
            } else {

                // generate screenshot
                await loadPage(address, output);        
            } 
        }
    } catch (err) {
        console.error("Error reading file:", err);
    }

    console.log("");
    console.log("DONE");

})();

        
function loadPage(address, output)
{
    console.log("Processing", address);
    
    return new Promise(function(resolve, reject) {
 
        app.fromURL(address, output, {
            width: pageWidth,
            height: pageHeight, 
        }, function(){
            //an image of google.com has been saved at ./test.png
            console.log("wrote " + output);
            resolve();
        });
    });
}
