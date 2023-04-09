'use strict'
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const bodyParser = require('body-parser')
const { Client } = require('pg')
// let url = `postgres://lama94:0000@localhost:5432/moviedb`;
let url =process.env.URL
const client = new Client(url)
const app = express();
const movieData=require('./MovieData/data.json');
// const{json} = require('express');
const port = process.env.port;
const apikey = process.env.apikey;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());



//routs
app.get('/', moviesHandler)
app.get('/favorite', FavoriteHandler)
app.get('/trending', trendingHandler)
app.get('/search', searchHandler)
app.get('/popular', tvPopularHandler)
app.get('/top_rated',topRatedMovieshandler)

app.post('/addMovie',addMovieHandler)
app.get('/getAllMovies',getAllMoviesHandler);

app.put('/UPDATE/:id',updateHandler)
app.delete('/DELETE/:id',deleteHandler)
app.get('/getMovie/:id', getHandler)
app.get('*', pageNotFound)

//get spicefic recourd
function getHandler(req,res){
    let idMovie =req.params.id;
    let sql=`SELECT * FROM movietable
    WHERE id = $1 ;` ;
    let value = [idMovie];
    client.query(sql,value).then(result=>{
        res.send(result.rows);
    }).catch(err =>{
        console.log(err);
    })
}
//delete
function deleteHandler(req,res){
    let idMovie =req.params.id;
    let sql=`DELETE FROM movietable WHERE id = $1;` ;
    let value = [idMovie];
    client.query(sql,value).then(result=>{
        res.status(204).send("deleted");
    }).catch(err =>{
        console.log(err);
    })
}

//update 

function updateHandler(req,res){
let idMovie =req.params.id;//params
let comment=req.body.comment;
let sql =`UPDATE movietable SET comment=$1
WHERE id=$2 RETURNING* `;
let values =[comment,idMovie];
client.query(sql,values).then((result)=>{
    console.log(result.rows);
    res.send(result.rows)}).catch(err =>{
        console.log(err);
    })
}











function addMovieHandler(req,res){
 console.log(req.body);
 let {title,poster,overview,comment} = req.body;
 let sql = `INSERT INTO movietable (title,poster,overview, comment)
 VALUES ($1,$2,$3 ,$4) RETURNING *; `
 let values = [title,poster,overview ,comment]
 client.query(sql,values).then((result)=>{
     console.log(result.rows)
     res.status(201).json(result.rows)})

 .catch(err =>{
    console.log(err);
})
}
function getAllMoviesHandler(req,res){
    let sql =`SELECT * FROM movietable `; //read all data from database table
    client.query(sql).then((result)=>{
        console.log(result);
        res.json(result.rows)
    }).catch(err =>{
        console.log(err);
    })}

// constructors
function Movies(title, poster, overview) {
    this.title = title;
    this.poster = poster;
    this.overview = overview;
}

function Trending(id, title, release_date, poster_path, overview,name) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
    this.name=name;
}
function TVPopularData (id , name ,overview){
    this.id = id;
    this.name = name;
    this.overview = overview;
}
function TopRateMovies (id, title ,overview){
    this.id = id ;
    this.title=title;
    this.overview=overview;
}
function Search(title ,poster_path , overview){
    this.title=title;
    this.poster_path=poster_path;
    this.overview=overview
}
//function
function moviesHandler(req, res) {
    let result =[];
    let newMovie = new Movies(movieData.title, movieData.poster_path, movieData.overview)
    result.push(newMovie);
    res.json(result);
}

function FavoriteHandler(req, res) {
    res.send("Welcome to Favorite Page");
}
function trendingHandler(req, res) {
    let url =`https://api.themoviedb.org/3/trending/all/week?api_key=${apikey}`;
    axios.get(url)
        .then((result) => {
            let trendingMoviesData = result.data.results.map((movie)=> {
                if ('name' in movies) {
                    return new Trending(movie.id, movie.name, movie.release_date, movie.poster_path, movie.overview)
                }
                if ('title' in movies) {
                    return new Trending(movie.id, movie.title, movie.release_date, movie.poster_path,movie.overview)
                }
               
            });

            console.log(trendingMoviesData);
            res.json(trendingMoviesData);
        })
        .catch((err)=>{
            console.log(err)
        })

}

function searchHandler(req, res) {
    let moviename = req.query.title // name it as you want 
    console.log(moviename)
    let url=`https://api.themoviedb.org/3/search/movie?api_key=${apikey}&language=en-US&query=${moviename}`
    axios.get(url)
    .then((result)=>{
        let response= result.data.results.map((movies)=>{
            return new Search (movies.title ,movies.poster_path , movies.overview)
        })
        res.json(response)})
    
    .catch((err)=>{
        console.log(err)
    })
}
function tvPopularHandler(req,res){
    let url =`https://api.themoviedb.org/3/tv/popular?api_key=${apikey}&language=en-US&page=1`;
    axios.get(url)
    .then((result) => {
        console.log(result.data.results);
        let tvPopularData = result.data.results.map((movie)=> {
            
                return new TVPopularData (movie.id , movie.name ,  movie.overview)
        })        

        console.log(tvPopularData);
        res.json(tvPopularData);
    })
    .catch((err)=>{
        console.log(err)
    })}
function topRatedMovieshandler(req,res){
    let url =`https://api.themoviedb.org/3/movie/top_rated?api_key=${apikey}&language=en-US&page=1`;
    axios.get(url)
    .then((result) => {
        console.log(result.data.results);
        let topRate = result.data.results.map((movie)=> {
            
                return new TopRateMovies (movie.id , movie.title ,  movie.overview)
        })        

        console.log(topRate);
        res.json(topRate);
    })
    .catch((err)=>{
        console.log(err)
    })
    }
//errors case 
app.get("*", (res, req) => {
    res.send("error")
})

function pageNotFound(req, res) {
    res.status(404).send("page not found ");
};
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("server not found")
})
//listen

client.connect().then(()=>{
app.listen(port, () => {
    console.log(`example app listening on port ${port}`)
})
}).catch(err =>{
    console.log('error here');

    console.log(err);
})