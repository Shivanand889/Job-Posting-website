const express = require('express');

const pgRouter = require('./databases/postgres.js');
const app = express();

app.use('/pg', pgRouter);

app.get('/',(req,res)=>{
    res.send('<h1>Hello World</h1>')
});

app.listen(3000 , function(){
    console.log('Server start succesfully');
});