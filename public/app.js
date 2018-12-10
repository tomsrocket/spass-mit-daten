var search, results, allBooks = [];

var indexOnAuthorCheckbox = document.getElementById('indexOnAuthorCheckbox');
var indexStrategySelect = document.getElementById('indexStrategySelect');
var removeStopWordsCheckbox = document.getElementById('removeStopWordsCheckbox');
var indexOnTitleCheckbox = document.getElementById('indexOnTitleCheckbox');
var useStemmingCheckbox = document.getElementById('useStemmingCheckbox');
var sanitizerSelect = document.getElementById('sanitizerSelect');
var tfIdfRankingCheckbox = document.getElementById('tfIdfRankingCheckbox');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchBooks();
};

indexOnAuthorCheckbox.onchange = rebuildAndRerunSearch;
indexStrategySelect.onchange = rebuildAndRerunSearch;
removeStopWordsCheckbox.onchange = rebuildAndRerunSearch;
indexOnTitleCheckbox.onchange = rebuildAndRerunSearch;
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

  if (indexOnTitleCheckbox.checked) {
    search.addIndex('titl');
  }
  if (indexOnAuthorCheckbox.checked) {
    search.addIndex('desc');
  }

  search.addDocuments(allBooks);
};

var indexedBooksTable = document.getElementById('indexedBooksTable');
var indexedBooksTBody = indexedBooksTable.tBodies[0];
var searchInput = document.getElementById('searchInput');
var bookCountBadge = document.getElementById('bookCountBadge');

var updateBooksTable = function(books) {
  indexedBooksTBody.innerHTML = '';

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = books.length; i < length; i++) {
    var book = books[i];

    var isbnColumn = document.createElement('td');
    isbnColumn.innerText = book.link;

    var titleColumn = document.createElement('td');
    titleColumn.innerHTML = book.titl;

    var authorColumn = document.createElement('td');
    authorColumn.innerHTML = book.type;

    var tableRow = document.createElement('tr');
    tableRow.appendChild(isbnColumn);
    tableRow.appendChild(titleColumn);
    tableRow.appendChild(authorColumn);

    indexedBooksTBody.appendChild(tableRow);
  }
};

var updateBookCountAndTable = function() {
  updateBookCount(results.length);

  if (results.length > 0) {
    updateBooksTable(results);
  } else if (!!searchInput.value) {
    updateBooksTable([]);
  } else {
    updateBookCount(allBooks.length);
    updateBooksTable(allBooks);
  }
};

var searchBooks = function() {
  results = search.search(searchInput.value);
  updateBookCountAndTable();
};

searchInput.oninput = searchBooks;

var updateBookCount = function(numBooks) {
  bookCountBadge.innerText = numBooks + ' books';
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
    updateBooksTable(allBooks);
  }
}
xmlhttp.open('GET', 'links.json', true);
xmlhttp.send();