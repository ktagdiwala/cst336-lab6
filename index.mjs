import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
 
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "walid-elgammal.online",
    user: "walidelg_webuser2",
    password: "Cst-336",
    database: "walidelg_quotes2",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection()

//routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get("/authors", async function(req, res){
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await conn.query(sql);
    res.render("authorList", {"authors":rows});
});// list all authors

app.get("/author/new", (req, res)=>{
    res.render("newAuthor");
});// fill out information to add new author

app.post("/author/new", async function(req, res){
    let fName = req.body.fName;
    let lName = req.body.lName;
    let birthDate = req.body.birthDate;
    let deathDate = req.body.deathDate;
    let sex = req.body.sex;
    let profession = req.body.profession;
    let country = req.body.country;
    let portrait = req.body.portrait;
    let bio = req.body.bio;
    let sql = `INSERT INTO q_authors
               (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [fName, lName, birthDate, deathDate, sex, profession, country, portrait, bio];
    const [rows] = await conn.query(sql, params);
    res.render("newAuthor", 
               {"message": "Author added!"});
});// add new author to database



app.get("/author/edit", async function(req, res){
    let authorId = req.query.authorId;
    let sql = `SELECT *, 
           DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
           DATE_FORMAT(dod, '%Y-%m-%d') dodISO
           FROM q_authors
           WHERE authorId =  ${authorId}`;
    const [rows] = await conn.query(sql);
    res.render("editAuthor", {"authorInfo":rows});
});// edit existing author

app.post("/author/edit", async function(req, res){
    let sql = `UPDATE q_authors
              SET firstName = ?,
                lastName = ?,
                dob = ?,
                dod = ?,
                sex = ?, 
                profession = ?,
                country = ?,
                portrait = ?,
                biography = ?
              WHERE authorId =  ?`;
    let params = [req.body.fName,  req.body.lName,
                req.body.dob, req.body.dod,
                req.body.sex, req.body.profession,
                req.body.country, req.body.portrait,
                req.body.bio, req.body.authorId];      
    const [rows] = await conn.query(sql,params);
    res.redirect("/authors");
});// update author info (based on edits) in database

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;
    let sql = `DELETE
                FROM q_authors
                WHERE authorId = ?`;
    const [rows] = await conn.query(sql, [authorId]);

    let sql2 = `DELETE *
                FROM q_quotes
                WHERE authorId = ?`;
    const [rows2] = await conn.query(sql, [authorId]);

    res.redirect("/authors");
});// delete author

app.get("/quotes", async function(req, res){
    let sql = `SELECT *
            FROM q_quotes
            NATURAL JOIN q_authors
            ORDER BY quote`;
    const [rows] = await conn.query(sql);
    res.render("quoteList", {"quotes":rows});
});// list all quotes

app.get("/quote/new", async (req, res)=>{
    // retrieve authors
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await conn.query(sql);

    // retrieve categories
    let sql2 = `SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category`;
    const [rows2] = await conn.query(sql2);
    res.render("newQuote", {"authors":rows, "quotes":rows2});
});// fill out information to add new quote

app.post("/quote/new", async function(req, res){
    let quote = req.body.quote;
    let authorId = req.body.author;
    let category = req.body.category;
    let likes = req.body.likes;
    let sql = `INSERT INTO q_quotes
               (quote, authorId, category, likes)
                VALUES (?, ?, ?, ?)`;
    let params = [quote, authorId, category, likes];
    const [rows] = await conn.query(sql, params);

    // retrieve authors
    let sql2 = `SELECT *
        FROM q_authors
        ORDER BY lastName`;
    const [rows2] = await conn.query(sql2);

    // retrieve categories
    let sql3 = `SELECT DISTINCT category
        FROM q_quotes
        ORDER BY category`;
    const [rows3] = await conn.query(sql3);

    res.render("newQuote", {"message": "Quote added!", "authors":rows2, "quotes":rows3});
});// add new quote to database

app.get("/quote/edit", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `SELECT *
           FROM q_quotes
           WHERE quoteId =  ${quoteId}`;
    const [rows] = await conn.query(sql);
        // retrieve authors
    let sql2 = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows2] = await conn.query(sql2);

    // retrieve categories
    let sql3 = `SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category`;
    const [rows3] = await conn.query(sql3);

    res.render("editQuote", {"quoteInfo":rows, "authors":rows2, "quotes":rows3});
});// edit existing quote

app.post("/quote/edit", async function(req, res){
    let sql = `UPDATE q_quotes
              SET quote = ?,
              authorId = ?,
              category = ?,
              likes = ?
              WHERE quoteId =  ?`;
    let params = [req.body.quote, req.body.author, req.body.category, req.body.likes, req.body.quoteId];      
    const [rows] = await conn.query(sql,params);
    res.redirect("/quotes");
});// update quote info (based on edits) in database


app.get("/quote/delete", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `DELETE
                FROM q_quotes
                WHERE quoteId = ?`;
    const [rows] = await conn.query(sql, [quoteId]);

    res.redirect("/quotes");
});// delete quote

app.get("/dbTest", async(req, res) => {
     let sql = "SELECT * FROM q_quotes";
     const [rows] = await conn.query(sql);
     res.send(rows);
});//dbTest
 
app.listen(3000, ()=>{
     console.log("Express server running");
});