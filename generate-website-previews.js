"use strict";

var app = require("node-server-screenshot");
var md5 = require('md5');
const fs = require('fs');
var http = require('http');
var https = require('https');
// var pdftk = require('node-pdftk');
var im = require('imagemagick');

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
            } else if (address.match(/.pdf$/)) {
                await pdfScreenshot(address, output);
                //await extractFirstPage(output);
                await pdf2png(output);
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

async function pdfScreenshot(address, output)
{
    console.log("Downloading PDF", address);

    return new Promise(function(resolve, reject) {
 
        const filename = output + ".pdf";

        var fileSizeInBytes = 0;
        if (fs.existsSync(filename)) {
            const stats = fs.statSync(filename);
            fileSizeInBytes = stats.size; 
        }
        if (fileSizeInBytes > 50) {
            
            // pdf is alread there
            console.log("skipping pdf download", filename);
            resolve();

        } else {
            // Decide http or https client to retrieve the URI.
            var url = new URL(address)
            var client = http; 
            client=url.protocol.match(/https/) ? https:client; 

            var file = fs.createWriteStream(filename);
            var request = client.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(function() {
                    resolve();
                });  // close() is async, call cb after close completes.
                
            });
            }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
                console.log("error with file", filename)
                reject();
            });
        }

    });
}
/**
 * Extract the first page from a pdf 
 * This method works fine, but we don't need it, because "convert" can do that by itself
 * @param {*} pdfFileOrig 
 */
function extractFirstPage(pdfFileOrig)
{
    var pdfFile = pdfFileOrig + ".pdf";
    console.log("PDF firstpage", pdfFile);   

    return new Promise(function(resolve, reject) {
        console.log("file", pdfFile);
        pdftk
            .input("./" + pdfFile)
            .cat("1")
            .output(pdfFileOrig + '-1pagefile.pdf')
            .then(buffer => {
                resolve();
                // Do stuff with the output buffer
                console.log("success pdfextract")
                
            })
            .catch(err => {
                // handle errors
                console.log(err)
                console.log("ERROR inside pdfextract")
                reject();
            });
    });
}

// convert -thumbnail x800 -background white -alpha remove screenshots/large/05ebe5aee09e233b3fbb19c49d52db36.png.pdf[0] screenshots/large/05ebe5aee09e233b3fbb19c49d52db36.png
function pdf2png(outputFile) 
{
    var pdfFile = outputFile + '.pdf';
    return new Promise(function(resolve, reject) {
        console.log("file", pdfFile);
        im.convert(['-thumbnail', 'x800', '-background', 'white', '-alpha', 'remove', pdfFile + '[0]', outputFile], 
            function(err, stdout){
                if (err) {
                    console.log( err );
                    reject();
                } else {
                   console.log('stdout:', stdout);
                    resolve();
                }
            }
        );
    });
}