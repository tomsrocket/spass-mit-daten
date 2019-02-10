"use strict";


var 
    system = require('system'),
    output, size;

var md5 = require('md5');
var fs = require('fs');
 

var pageWidth = 1280;
var pageHeight = 1024;


// read all urls from config file
var content = fs.read('public/links.json');
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

loadPage();




function loadPage()
{
    if (urls.length == 0) {
        console.log("DONE");
        phantom.exit();
    } else {
        // remove the first address item of an array
        var address = urls.shift();
        
        output = "screenshots/large/" + md5(address) + ".png";
        if (fs.exists(output)) {

            // screenshot is alread there
            console.log("skipping", address, output);
            loadPage();
        
        } else {
            // generate screenshot
            console.log("generating", address, output);
            var page = require('webpage').create();
                 
            page.viewportSize = { width: pageWidth, height: pageHeight };
            page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };

            page.open(address, function (status) {
                if (status !== 'success') {
                    console.log('Unable to load the address ' + address + " .. MESSSAGE: " + status);
                    page.release();
                    loadPage();
                } else {
                    window.setTimeout(function () {
                        page.render(output);
                        page.release();
                        loadPage();
                    }, 1000);
                }
            });
        }
    }
}