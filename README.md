
# Spass mit Daten

Dieses Repository enthält den Code für die Open Data Linkliste auf spassmitdaten.de. 

## Copyright Infos

* Logo Icon: Smile by Gregor Cresnar from the Noun Project - https://thenounproject.com/search/?q=smile&i=770810
* Logo Font: Jomhuria by KB Studio Principal design - https://fonts.google.com/specimen/Jomhuria

## Install

1. Copy your credential files to the config directory
2. Execute the following commands: 
```
    npm install googleapis@27 --save

    node read-google-spreadsheet.js
```
3. The links will be written to _public/links.json_

## Generate screenshot thumbnail previews
```
    # generate all missing previews
    npm run generate-previews
```
That command ^ does the following things:  
1. Generate screenshots of all websites via: npx phantomjs generate-website-previews.js
2. Optimize the screenshot images to width 480px via: node generate-thumbnails.js


## Development

The following command builds the files in watch mode and serves the result at localhost:3000
```
    npx nanogen start 
```

## Prod build

```
    # Build for prod
    npm run build

    # Serve static files
    cd public;sudo docker run -d -v `pwd -P`:/var/www:ro -p 8080:8080 trinitronx/python-simplehttpserver
```


## Ideensammlung / Todos

* Lazy load images: https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/

* Use bulma for design
* Nice design: https://dansup.github.io/bulma-templates/templates/kanban.html
* Nice theme:  https://cssninja.io/themes/fresh


## Static Site generation with nanogen

Read full documentation about nanogen here: https://doug2k1.github.io/nanogen/docs/

```
    npx nanogen init
```

  Start the current site:

    $ npx nanogen start [options]

  Build the current site:

    $ nanogen build [options]
