const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const app = express();
const crypto = require('crypto');
const pg = require("pg");
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    genid: (req) => {
        return uuidv4(); 
    },
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


function hashPassword(password) {
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}

module.exports = {hashPassword} ;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "dbms_project",
    password: "password", // add your password
    port: 5432
});
db.connect() ;

app.get('/',(req,res)=>{
    var a =1  ;
    // console.log(req.session.refresh) ;
    if(req.session.refresh==1){
        a = req.session.login ;
        // console.log(a) ;
        req.session.refresh =0 ;
    }
    res.render('login.ejs' , {login : a}) ;
});
app.post('/login', async(req,res)=>{
    const email = req.body.email ;
    var password = req.body.password ;
    password = hashPassword(password) ;
    var q = `select * from User_account where email = $1` ;
    var x = [email]
    await db.query(q,x)
        .then(result=>{
            req.session.refresh  = 1 ;
            // console.log(result) ;
            if(result.rowCount !=0){
                if(result.rows[0].password == password){
                    console.log('exists') ;
                    req.session.login = 1 ;
                    return res.redirect('/') ;
                }
                else{
                    req.session.login = 0 ;
                    return res.redirect('/') ;
                }
            }
            else{
                req.session.login = 2 ;
               return res.redirect('/') ;
            }
        })
        .catch(err=>{
            console.log(err) ;
        });
    // res.redirect('back') ;
}) ;
app.post('/signup', async (req,res)=>{
    const email = req.body.email;
    const password = hashPassword(req.body.password);
    const dob = req.body.dob;
    const gender = req.body.gender;
    let account_type;
    if (req.body.account_type === 'Job Seeker') {
        account_type = 1;
    } else {
        account_type = 2;
    }
    const number = req.body.contact;

    // Check if email already exists
    const emailCheckQuery = `SELECT * FROM user_account WHERE email = $1`;
    const emailCheckValues = [email];
    try {
        const emailCheckResult = await db.query(emailCheckQuery, emailCheckValues);
        if (emailCheckResult.rows.length > 0) {
            console.log("Email already exists");
            return res.redirect("back");
        }
    } catch (error) {
        console.error("Error checking email:", error);
        return res.status(500).send("Internal Server Error");
    }

    // Insert new user
    const insertQuery = `INSERT INTO user_account (email, password, date_of_birth, gender, contact_number, account_type) 
                         VALUES ($1, $2, $3, $4, $5, $6)`;
    const insertValues = [email, password, dob, gender, number, account_type];
    try {
        await db.query(insertQuery, insertValues);
        console.log("Successfully inserted");
        return res.redirect('back');
    } catch (error) {
        console.error("Error inserting user:", error);
        return res.status(500).send("Internal Server Error");
    }
    
}) ;
app.listen(3000 , function(){
    console.log('Server start succesfully');
});