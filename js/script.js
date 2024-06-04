const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

/** STORAGE FUNC **/
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Your browser does not support local storage!');
        return false;
    }
    return true;
}

function uploadData() {
    if (isStorageExist()) {
        const bookString = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, bookString);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function downloadData() {
    const bookData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (bookData !== null) {
        for (const book of bookData) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

/** HELPER FUNC **/
function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

function findBookById(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndexById(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

/** BOOKS FUNC **/
function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);

    const ID = generateId();
    const bookObject = generateBookObject(ID, title, author, year, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    uploadData();
}

function addToCompleteRead(bookId) {
    const completedBook = findBookById(bookId);
    if (completedBook == null) return;
    completedBook.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    uploadData();
}

function addToIncompleteRead(bookId) {
    const uncompletedBook = findBookById(bookId);
    if (uncompletedBook == null) return;
    uncompletedBook.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    uploadData();
}

function deleteBook(bookId) {
    const toDeleteBook = findBookIndexById(bookId);
    if (toDeleteBook === -1) return;
    books.splice(toDeleteBook,1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    uploadData();
}

function searchBook() {
    clearSearchResult();
    const title = document.getElementById('searchBookTitle').value.toLowerCase();
    for (const book of books) {
        if (book.title.toLowerCase() === title) {
            const resultDisplay = displaySearchResult(book);
            const main = document.getElementById('main');
            const afterSection = document.getElementById('listWrapper');
            main.insertBefore(resultDisplay,afterSection);
        }
    }
    return null;
}

/** HTML HANDLER FUNC **/
function display(bookData) {
    const {id, title, author, year, isComplete} = bookData;
    const textTitle = document.createElement('h4');
    textTitle.innerText = "Title: "+title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Author: "+author;

    const textYear = document.createElement('p');
    textYear.innerText = "Year: "+year;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener('click', function () {
        deleteBook(id);
    });

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('info');
    infoContainer.append(textTitle, textAuthor, textYear)

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    const article = document.createElement('article');
    article.classList.add('book-item')
    article.setAttribute('id', `book-${id}`);

    if (isComplete) {
        const reverseButton = document.createElement('button');
        reverseButton.classList.add('reverse-button');
        reverseButton.innerText = "Undone";
        reverseButton.addEventListener('click', function () {
            addToIncompleteRead(id);
        });
        actionContainer.append(reverseButton, deleteButton);
    } else {
        const reverseButton = document.createElement('button');
        reverseButton.classList.add('reverse-button');
        reverseButton.innerText = "Done";
        reverseButton.addEventListener('click', function () {
            addToCompleteRead(id);
        });
        actionContainer.append(reverseButton, deleteButton);
    }
    article.append(infoContainer, actionContainer);
    return article;
}

function displaySearchResult(bookData) {
    const {id, title, author, year, isComplete} = bookData;

    const textTitle = document.createElement('h4');
    textTitle.innerText = "Title: "+title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Author: "+author;

    const textYear = document.createElement('p');
    textYear.innerText = "Year: "+year;

    const article = document.createElement('article');
    article.classList.add('book-result');
    article.append(textTitle, textAuthor, textYear);

    const section = document.createElement('section');
    section.classList.add('section-wrapper');
    section.setAttribute('id', 'searchResult');
    section.append(article);

    return section;
}

function clearSearchResult() {
    const result = document.getElementById('searchResult');
    if (result) {
        result.remove;
    }
}

/** THE EVENT LISTENER **/
document.addEventListener('DOMContentLoaded', function () {
    const bookInput = document.getElementById('inputBook');
    bookInput.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchInput = document.getElementById('searchBook');
    searchInput.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        downloadData();
    }
});

document.addEventListener(SAVED_EVENT, () => {
    console.log('Book Saved!');
});

document.addEventListener(RENDER_EVENT, function () {
    const completeBook = document.getElementById('completeList');
    const incompleteBook = document.getElementById('incompleteList');
    completeBook.innerHTML = '';
    incompleteBook.innerHTML = '';

    for (const book of books) {
        const bookDisplay = display(book);
        if (book.isComplete) {
            completeBook.append(bookDisplay);
        } else {
            incompleteBook.append(bookDisplay);
        }
    }
});
