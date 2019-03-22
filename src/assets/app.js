

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
  daten: ['Daten', 'primary'],
  info: ['Informationen', 'link'],
  news: ['Nachrichten', 'warning'],
  code: ['Code', 'info'],
  tool: ['Werkzeug', 'success'],
  karte: ['Karte', 'danger'],
  network: ['Netzwerk', 'light'],
  book: ['Buch', 'info'],
  blog: ['Blog', 'info'],
  info: ['Info', 'info'],
  konferenz: ['Konferenz', 'dark'],
}

var updateBooksTable = function(books) {
  indexedBooksTable.innerHTML = '';

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = books.length; i < length; i++) {
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

  /*
  link: row[0],
  type: row[2],
  prio: row[3],
  keyw: row[4],
  area: row[5],
  titl: row[6],
  desc: row[7]

<span class="tag is-black">Black</span>
<span class="tag is-dark">Dark</span>
<span class="tag is-light">Light</span>
<span class="tag is-white">White</span>
<span class="tag is-primary">Primary</span>
<span class="tag is-link">Link</span>
<span class="tag is-info">Info</span>
<span class="tag is-success">Success</span>
<span class="tag is-warning">Warning</span>
<span class="tag is-danger">Danger</span>

  */
    var source   = document.getElementById("entry-template").innerHTML;
    var template = Handlebars.compile(source);
    
    if (typeof book.keyw === 'string' || book.keyw instanceof String) {
      book.keyw = book.keyw.split(',').map(function(s) { return s.trim() });
    }
    var html    = template(book);

    indexedBooksTable.innerHTML += html;
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
  bookCountBadge.innerText = numBooks + ' Links gefunden';
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
      searchInput.value = decodeURI(location.hash.substr(1));
      searchBooks();
  }
}

window.onhashchange = locationHashChanged;