const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new customer
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user: username and password required." });
});

// Task 1 & Task 10: Get the book list available in the shop using Promise / async-await
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("Books list not available"));
                }
            });
        };
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Task 2 & Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const getBookByISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });

    getBookByISBN
        .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch(err => res.status(err.status || 500).json({ message: err.message }));
});

// Task 3 & Task 12: Get book details based on author using Promises
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const getBooksByAuthor = new Promise((resolve, reject) => {
        const matchingBooks = [];
        for (let key in books) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push({
                    isbn: key,
                    title: books[key].title,
                    reviews: books[key].reviews
                });
            }
        }
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found by author: ${author}` });
        }
    });

    getBooksByAuthor
        .then(result => res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4)))
        .catch(err => res.status(err.status || 500).json({ message: err.message }));
});

// Task 4 & Task 13: Get all books based on title using Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const getBooksByTitle = new Promise((resolve, reject) => {
        const matchingBooks = [];
        for (let key in books) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push({
                    isbn: key,
                    author: books[key].author,
                    reviews: books[key].reviews
                });
            }
        }
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject({ status: 404, message: `No books found with title: ${title}` });
        }
    });

    getBooksByTitle
        .then(result => res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4)))
        .catch(err => res.status(err.status || 500).json({ message: err.message }));
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

/* ==========================================================================
   Axios Implementations with Async/Await and Promises (Tasks 10 - 13)
   ========================================================================== */

// Task 10: Get all books using async/await with Axios
const getAllBooksWithAxios = async () => {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log("All Books (Axios async/await):", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching all books:", error.message);
        throw error;
    }
};

// Task 11: Get book details based on ISBN using Promise callback with Axios
const getBookByISBNWithAxios = (isbn) => {
    return axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            console.log(`Book ISBN ${isbn} (Axios Promise):`, response.data);
            return response.data;
        })
        .catch(error => {
            console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
            throw error;
        });
};

// Task 12: Get book details based on Author using async/await with Axios
const getBookByAuthorWithAxios = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
        console.log(`Books by ${author} (Axios async/await):`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
        throw error;
    }
};

// Task 13: Get book details based on Title using Promise callback with Axios
const getBookByTitleWithAxios = (title) => {
    return axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)
        .then(response => {
            console.log(`Books with title "${title}" (Axios Promise):`, response.data);
            return response.data;
        })
        .catch(error => {
            console.error(`Error fetching books by title "${title}":`, error.message);
            throw error;
        });
};

module.exports.general = public_users;
module.exports.getAllBooksWithAxios = getAllBooksWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBookByAuthorWithAxios = getBookByAuthorWithAxios;
module.exports.getBookByTitleWithAxios = getBookByTitleWithAxios;
