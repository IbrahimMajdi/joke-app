'use static'

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const method_override = require('method-override');
const ejs = require('ejs')
const app = express();

app.use(express.urlencoded({
    extended: true
}));
app.use(method_override('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

const PORT = process.env.PORT || 3030;
const client = new pg.Client(process.env.DATABASE_URL);


app.get('/', mainHandler);
app.post('/addJoke', addHandler);
app.get('/fav', favHandler);
app.get('/details/:joke_id', detailsHandler);
app.get('/random', randomHandler);
app.post('/update', updateHandler);
app.post('/delete', deleteHandler);


function mainHandler(req, res) {

    let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';

    superagent.get(url).then(result => {

        // console.log(result.body);
        var alljokes = result.body.map(joke => {
            return new Jokes(joke);
        })

        return alljokes;

    }).then(alljokes => {

        // console.log('alljokes', alljokes);

        res.render('index.ejs', {
            jokes: alljokes
        });
    })


}

function addHandler(req, res) {

    var joke = req.body;

    // console.log('joke', joke);

    let SQL = `INSERT INTO jokes(type,setup,punchline) VALUES ($1,$2,$3);`
    let values = [joke.type, joke.setup, joke.punchline];

    console.log(values);
    client.query(SQL, values).then(() => {
        res.redirect('/fav')
    })
}

function favHandler(req, res) {
    let SQL = `SELECT * FROM jokes;`;

    client.query(SQL).then(result => {
        // console.log(result.rows);
        res.render('fav', {
            favJokes: result.rows
        })
    })



}

function randomHandler(req, res) {

    let url = 'https://official-joke-api.appspot.com/jokes/programming/random'

    superagent.get(url).then(result => {

        return new Jokes(result.body[0])

    }).then(result => {

        res.render('random', {
            randomjoke: result
        })
    })

}


function deleteHandler(req, res) {
    let id = req.params.joke_id
    let SQL = `DELETE FROM jokes WHERE id=$1;`
    let value = [id]

    client.query(SQL, value).then(
        res.redirect('/fav')
    )
}

function updateHandler(req, res) {
    let data = req.body

    let SQL = `UPDATE jokes SET type=$1, setup=$2 punchline=$3 WHERE id=$1;`
    let value = [data.type, data.setup, data.punchline]

    client.query(SQL, value).then(
        res.redirect('/fav')
    )
}



function Jokes(joke) {

    this.type = joke.type;
    this.setup = joke.setup;
    this.punchline = joke.punchline;
}

client.connect().then(() => {

    app.listen(PORT, () => console.log(`jokes app listening at http://localhost:${PORT}`))

})