

var search, allBooks = [];

var indexStrategySelect = document.getElementById('indexStrategySelect');
var removeStopWordsCheckbox = document.getElementById('removeStopWordsCheckbox');
var useStemmingCheckbox = document.getElementById('useStemmingCheckbox');
var sanitizerSelect = document.getElementById('sanitizerSelect');
var tfIdfRankingCheckbox = document.getElementById('tfIdfRankingCheckbox');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchBooks();
};

indexStrategySelect.onchange = rebuildAndRerunSearch;
removeStopWordsCheckbox.onchange = rebuildAndRerunSearch;
useStemmingCheckbox.onchange = rebuildAndRerunSearch;
sanitizerSelect.onchange = rebuildAndRerunSearch;
tfIdfRankingCheckbox.onchange = rebuildAndRerunSearch;

var pageNr = 0;
var rebuildSearchIndex = function() {
  search = new JsSearch.Search('link');

  if (useStemmingCheckbox.checked) {
    search.tokenizer = new JsSearch.StemmingTokenizer(stemmer, search.tokenizer);
  }
  if (removeStopWordsCheckbox.checked) {
    search.tokenizer = new JsSearch.StopWordsTokenizer(search.tokenizer);
  }

  search.indexStrategy =  eval('new ' + indexStrategySelect.value + '()');
  search.sanitizer =  eval('new ' + sanitizerSelect.value + '()');;

  if (tfIdfRankingCheckbox.checked) {
    search.searchIndex = new JsSearch.TfIdfSearchIndex('titl');
  } else {
    search.searchIndex = new JsSearch.UnorderedSearchIndex();
  }

    search.addIndex('link');
    search.addIndex('keyw');
    search.addIndex('type');
    search.addIndex('area');
    search.addIndex('titl');
    search.addIndex('desc');
 

  search.addDocuments(allBooks);
};

var indexedBooksTable = document.getElementById('linkResultsList');
var searchInput = document.getElementById('searchInput');
var bookCountBadge = document.getElementById('bookCountBadge');

const type2color = {
  daten: ['Daten', 'primary', 'Datenquellen für Offene Daten'],
  info: ['Informationen', 'link'],
  news: ['Nachrichten', 'warning', 'Links zu relevanten Nachrichtenportalen oder einzelnen Artikeln'],
  code: ['Code', 'info'],
  tool: ['Werkzeug', 'success'],
  karte: ['Karte', 'danger'],
  video: ['Video', 'light'],
  info: ['Info', 'info'],
  termin: ['Termin', 'dark'],
}

var maxBooks = 60;


/**
  Main Method that prints the books table

  Format of the book element
    link: row[0],
    type: row[2],
    prio: row[3],
    keyw: row[4],
    area: row[5],
    titl: row[6],
    desc: row[7]
  */
var pagination = 0;

var updateBooksTable = function(books) {
  indexedBooksTable.innerHTML = '';

  var tokens = search.tokenizer.tokenize(searchInput.value);
  var length = books.length > maxBooks ? maxBooks : books.length;
  var start = 0;

  if (books.length > maxBooks) {
    var nextPage = parseInt( pageNr )+1;
    start = pageNr*maxBooks;
    length = nextPage*maxBooks;
    console.log("length", length, pageNr, nextPage)
    if (length > books.length) {
      length = books.length;
    }
    pagination = [start, length];
  } else {
    pagination = 0;
  }
  updateBookCount(books.length);

  // Main loop that builds the list of all links
  // TODO Add some pagination here
  for (var i = start; i < length; i++) {
    var book = books[i];

    var icon = type2color[book["type"].toLowerCase()] ;
    if (!icon) {
      console.log("icon not found:",book["type"].toLowerCase());
      icon = ['',''];
    }
    book['icontext'] = icon[0];
    book['icon'] = icon[1]; 
    var img = book['img'];
    book['image'] = img ? "/screens/" + img + ".jpg" : "";

    var source   = document.getElementById("entry-template").innerHTML;
    var template = Handlebars.compile(source);
    
    if (typeof book.keyw === 'string' || book.keyw instanceof String) {
      book.keyw = book.keyw.split(',').map(function(s) { return s.trim() });
    }
    var html    = template(book);

    indexedBooksTable.innerHTML += html;
  }

  if (books.length > maxBooks) {
    indexedBooksTable.innerHTML += 
      '<div id="paginationDiv" class="column is-full">'
      + (pageNr>0 ? '<a class="button is-primary" href="#'+searchInput.value+'-'+ (parseInt(pageNr)-1) +'">'
        //+ '<span class="icon"><i class="fab fa-github"></i></span>'
        + '&lt;&lt; Vorherige Seite</a> &nbsp; ' : '' )
      + ( length < books.length ? '<a class="button is-primary" href="#'+searchInput.value+'-'+ (parseInt(pageNr)+1) +'">Nächste Seite &gt;&gt;</a>' : "" )
      + '</div>';
  }
};

var updateBookCountAndTable = function(searchResults) {
  updateBookCount(searchResults.length);

  if (searchResults.length > 0) {
    updateBooksTable(searchResults);
  } else if (!!searchInput.value) {
    updateBooksTable([]);
  } else {
    updateBookCount(allBooks.length);
    updateBooksTable(allBooks);
  }
};

var searchBooks = function() {
  var searchResults = search.search(searchInput.value);
  updateBookCountAndTable(searchResults);
};

searchInput.oninput = searchBooks;

var updateBookCount = function(numBooks) {
  bookCountBadge.innerText = numBooks <= maxBooks ? numBooks + ' Links gefunden' : ('Zeige Treffer ' + (parseInt(pagination[0])+1) + ' bis ' + pagination[1] + ' von ' + numBooks + ' gefundenen  Links');
};
var hideElement  = function(element) {
  element.className += ' hidden';
};
var showElement = function(element) {
  element.className = element.className.replace(/\s*hidden/, '');
};

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var json = JSON.parse(xmlhttp.responseText);

    allBooks = json.links;

    updateBookCount(allBooks.length);

    var loadingProgressBar = document.getElementById('loadingProgressBar');
    hideElement(loadingProgressBar);
    showElement(indexedBooksTable);

    rebuildSearchIndex();
    if (location.hash) {
      locationHashChanged();
    } else {
      updateBooksTable(allBooks);
    }
  }
}
xmlhttp.open('GET', 'links.json', true);
xmlhttp.send();


function locationHashChanged() {
  if (location.hash) {

      var locationHashValue = location.hash.substr(1);

      // Check if we are on a different page
      var found = locationHashValue.match(/(.*)-(\d+)$/);
      if (found) {
        pageNr = found[2];
        locationHashValue = found[1];
      } else {
        pageNr = 0;
      }
      console.log(pageNr, locationHashValue, found);
  
      searchInput.value = decodeURI(locationHashValue);
      searchBooks();
      scroll(0,0);
  }
}

window.onhashchange = locationHashChanged;


// Event handler for Bulma mobile navigation burger
document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }

});