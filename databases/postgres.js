const express = require("express");
const router = express.Router();
const pg = require("pg");



const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"database_name",
    password:"password",
    port:5432

})

db.connect();




module.exports = router