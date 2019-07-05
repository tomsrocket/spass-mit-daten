"use strict";

const sharp = require('sharp');
const fs = require('fs');

const thumbnailWidth = 433;
const jpgQuality = 65;

(async () => {
    try {
        const testFolder = './screenshots/large';

        const files = fs.readdirSync(testFolder)

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            var outputfile = 'screenshots/small/' + file.replace(".png", ".jpg");
            var fileSizeInBytes = 0;
            if (fs.existsSync(outputfile)) {
                const stats = fs.statSync(outputfile);
                fileSizeInBytes = stats.size; 
            }
            if (fileSizeInBytes > 50) {
                console.log("exists", outputfile)
            } else if (file.match(/\.png$/)) {
                console.log("resizing to " + thumbnailWidth, file);
                await convert('./screenshots/large/' + file, outputfile);
        
            }
        } 

    } catch (err) {
      console.error("Error reading file:", err);
    }

    console.log();
    console.log("DONE");

})();


function convert(inputFile, outputFile) {
    return new Promise(function(resolve, reject) {
        sharp(inputFile)
        .resize({ width: thumbnailWidth })
        .jpeg({
            quality: jpgQuality,
            chromaSubsampling: '4:4:4'
        })
        .toFile(outputFile)
            .then(function(newFileInfo) {
                console.log("Success");
                resolve(newFileInfo);
            })
            .catch(function(err) {
                console.log("Error occured");
                reject(err);
            });    
        });
}
