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

app.get("/author/new", (req, res)=>{
    res.render("newAuthor");
});

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
});
  

app.get("/dbTest", async(req, res) => {
     let sql = "SELECT * FROM q_authors";
     const [rows] = await conn.query(sql);
     res.send(rows);
});//dbTest
 
app.listen(3000, ()=>{
     console.log("Express server running");
});