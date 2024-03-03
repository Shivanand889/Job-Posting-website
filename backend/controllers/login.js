const asyncHandler = require("express-async-handler");
const { User_account } = require("../models/user_account");



const Func_login = asyncHandler(async (req, res) => {
 
  const email = req.body.Email ;
  const password = req.body.Password ;
  const dob = req.body.dob  ;
  const gender = req.body.Gender ;
  const account_type = req.body.Account_type ;
  const obj  = {"email" : email , "password" : password ,"dob" : dob, "gender" : gender ,"account_type": account_type} 
  await User_account.create(obj) ;
});

module.exports  = {Func_login} ; 