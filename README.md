
# Spass mit Daten

Dieses Repository enthält den Code für die Open Data Linkliste auf spassmitdaten.de. 

## Copyright Infos

* Logo Icon: Smile by Gregor Cresnar from the Noun Project - https://thenounproject.com/search/?q=smile&i=770810
* Logo Font: Jomhuria by KB Studio Principal design - https://fonts.google.com/specimen/Jomhuria

## Install

1. Copy our credential files to the config directory
2. Execute the following commands: 
```
    npm install googleapis@27 --save

    node read-google-spreadsheet.js
```
3. The links will be written to _public/links.json_


## Run in dev mode

```
    npx nanogen start 
```

## Build for prod

```
    npm run build
```

## Serve static files

```
    cd public;sudo docker run -d -v `pwd -P`:/var/www:ro -p 8080:8080 trinitronx/python-simplehttpserver
```


## Ideensammlung / Todos

* Use bulma for design
* Nice design: https://dansup.github.io/bulma-templates/templates/kanban.html
* Nice theme: 
https://cssninja.io/themes/fresh


## Static Site generation with nanogen

Read full documentation about nanogen here: https://doug2k1.github.io/nanogen/docs/

```
    npx nanogen init
```

  Start the current site:

    $ npx nanogen start [options]

  Build the current site:

    $ nanogen build [options]