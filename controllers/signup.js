const asyncHandler = require("express-async-handler");
const { pool} = require("../auth");
const { hashPassword} = require("../hash");



const Func_signup = asyncHandler(async (req, res) => {
 
    const email = req.body.Email ;
    const password = req.body.Password ;
    const dob = req.body.dob  ;
    const gender = req.body.Gender ;
    const account_type = req.body.Account_type ;
    password = hashPassword(password) ;
    var q = `select * from User_account where email = ${email}` ;
    await pool.query(q)
    .then(result=>{
        if(result){
            res.send("this email already registered") ;
        }
    })
    .catch(err=>{
        console.log(err) ;
    });
    q = `insert into User_account (email, password,dob,gender,account_type) values(${email}
                , ${password} , ${dob}, ${gender}, ${account_type})` ;

    await pool.query(q)
        .then(result=>{
            console.log("succesfully inserted") ;
        })
        .catch(err=>{
            console.log(err) ;
        }) ;

});

module.exports  = {Func_signup} ; 