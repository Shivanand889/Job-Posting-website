const asyncHandler = require("express-async-handler");
const { pool} = require("../auth");
const { hashPassword} = require("../hash");


const Func_signup = asyncHandler(async (req, res) => {
 
    const email = req.body.Email ;
    const password = req.body.Password ;
    password = hashPassword(password) ;
    var q = `select * from User_account where email = ${email}` ;
    await pool.query(q)
        .then(result=>{
            if(result){
                if(result[0].password == password){
                    res.json({data : result[0], success : 1})
                }
                else{
                    res.json({success: 0}) ;
                }
            }
            else{
                res.json({success: 2}) ;
            }
        })
        .catch(err=>{
            console.log(err) ;
        });

});

module.exports  = {Func_signup} ; 