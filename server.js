'use static'

require('dotenv').config();

const express=require('express');
const pg= require('pg');
const superagent= require('superagent');
const method_override= require('method-override');
const ejs= require('ejs')
const app= express();
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(method_override('_method'));
app.use(express.static('./public')); 
app.set('view engine', 'ejs');
// app.set('views', '/views');


app.get('/',mainHandler);



function mainHandler(req,res){

    res.render('index.ejs');
}


const client=new pg.Client(process.env.DATABASE_URL);
const PORT= process.env.PORT || 3030;
client.connect().then(()=>{

    app.listen(PORT, () => console.log(`jokes app listening at http://localhost:${PORT}`))

})