const fs = require('fs');
const dotenv = require("dotenv").config();
// let action = process.argv[2];
let value = "";
// const key = require("./keys");
// const https = require('https');
const moment = require('moment');
const inquirer = require('inquirer');
const keys = require('./keys');
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);
const axios = require('axios');
// README 
// output the data to a .txt file called log.txt.


inquirer
    .prompt([
        {
            type: 'list',
            message: 'Welcome to LIRI. LIRI is a Language Interpretation and Recognition Interface. LIRI can find your favorite song, search your favorite artist tour dates or search your favorite movie. Please select a command.',
            name: 'welcome',
            choices: ['spotify-this-song', 'concert-this', 'movie-this', 'do-what-it-says']
        },

    ]).then(function (user) {

        if (user.welcome == "spotify-this-song") {
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'Enter either a song name',
                    name: 'songName'
                }
            ]).then(function (user) {
                if (!user.songName) {
                    getSong('The Sign, Ace Of Base');

                } else {
                    getSong(user.songName)
                }
            })
        } if (user.welcome == "concert-this") {
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'Enter either an artist/band',
                    name: 'bandName'
                }
            ]).then(function (user) {
                if (user.bandName) {
                    concertThis(user.bandName)
                } else {
                    console.log('Please enter a valid artist or band, try again.')
                }
            })
        } if (user.welcome == "movie-this") {
            inquirer.prompt([
                {
                    type: 'input',
                    message: 'Enter either a movie',
                    name: 'movieName'
                }
            ]).then(function (user) {
                if (!user.movieName) {
                    getMovie('Mr.Nobody')

                } else {
                    getMovie(user.movieName)
                }
            })
        } if (user.welcome == "do-what-it-says") {
            fs.readFile("random.txt", "utf8", function (error, data) {

                // If the code experiences any errors it will log the error to the console.
                if (error) {
                    return console.log(error);
                }

                // We will then print the contents of data
                console.log(data);

                // Then split it by commas (to make it more readable)
                let dataArr = data.split(", ");
                // assign the text in the doc to variables
                action = dataArr[0];
                value = dataArr[1];

                switch (action) {

                    case "movie-this":
                        getMovie(value);
                        break;

                    case "concert-this":
                        concertThis(value);
                        break;

                    case "spotify-this-song":
                        getSong(value);
                        break;
                };

            });
        }
        // 1st .then function closing brackets 
    });

// added lines to .gitignore file
fs.writeFile(".gitignore", "node_modules\n .DS_Store\n .env", function (err) {
    if (err) {
        return console.log(err.Message);
    } else {
        return;
    }
});

let getSong = (value) => {

    spotify.search({ type: 'track', query: `${value}`, limit: 5 })
        .then(function (response) {

            let a = response.tracks.items;
            // console.log(a)
            a.forEach(songs => {
                let songInfo =
                    `
                SONGS:
                Artist(s): ${songs.artists[0].name}
                Song name: ${songs.name}
                Preview: ${songs.preview_url}
                Album name: ${songs.album.name}
                ----------------------------------
                `;
                fs.appendFile('log.txt', songInfo, (err) => {
                    if (err) throw err;
                })

                console.log(`Artist(s): ${songs.artists[0].name}`);
                console.log(`Song name: ${songs.name}`);
                console.log(`Preview: ${songs.preview_url}`);
                console.log(`Album name: ${songs.album.name}`);
                console.log('----------------------------------');

            });



        })
        .catch(function (err) {
            console.log(err);
        });
};


let getMovie = (value) => {

    const key = require('./omdbkey');

    axios.get(`http://www.omdbapi.com/?t=${value}&y=&plot=short&apikey=${key}&type=movie`).then(
        function (response) {
            // console.log(response.data)
            if (response.data.Title === undefined) {
                console.log('This movie may not exist, try again.')
            } else {

                let movieInfo =
                    `
                MOVIES:
                * Movie title: "${response.data.Title}"
                * Year: "${response.data.Year}"
                * IMDB rating: "${response.data.Ratings[0].Value}"
                * Rotten Tomatoes rating: "${response.data.Ratings[1].Value}"
                * Country(s) produced: "${response.data.Country}"
                * Language(s): "${response.data.Language}"
                * Actors: "${response.data.Actors}"
                `;
                fs.appendFile('log.txt', movieInfo, (err) => {
                    if (err) throw err;
                })

                console.log(`* Movie title: "${response.data.Title}",`);
                console.log(`* Year: "${response.data.Year}",`);
                console.log(`* IMDB rating: "${response.data.Ratings[0].Value}",`);
                console.log(`* Rotten Tomatoes rating: "${response.data.Ratings[1].Value}",`);
                console.log(`* Country(s) produced: "${response.data.Country}",`);
                console.log(`* Language(s): "${response.data.Language}",`);
                console.log(`* Actors: "${response.data.Actors}",`);
            }
        }).catch(function (err) {
            // if user types gibberish or movie that doesn't exist
            // console.log(err.message)
            if (err.response === undefined) {
                err.message = "OMDB couldn't find this movie, try again"
                console.log(err.message)
            }
        });
};

let concertThis = (value) => {
    axios.get(`https://rest.bandsintown.com/artists/${value}/events?app_id=codingbootcamp`).then(
        function (response) {
            const x = response.data;
            if (x[0] == null) {
                console.log('No upcoming events, try another search')
            } else {
                x.forEach(function (item) {
                    let y = item;
                    let momentTime = moment(y.datetime).format('ddd, MM/DD/YYYY, HH:mm')
                    console.log(`Artist: ${y.lineup[0]}`);
                    console.log(`Venue: ${y.venue.name}`);
                    console.log(`City/Country: ${y.venue.city}, ${y.venue.country}`);
                    console.log(`Date/time: ${momentTime}`);
                    console.log('----------------------------------')
                    let concertInfo =
                        `
                CONCERT INFO:
                Artist: ${y.lineup[0]}
                Venue: ${y.venue.name}
                City/Country: ${y.venue.city}, ${y.venue.country}
                Date/time: ${momentTime}
                ----------------------------------
                `;
                    fs.appendFile('log.txt', concertInfo, (err) => {
                        if (err) throw err;
                        
                    })
                })
            }
        }).catch(function (err) {
            if (err.response === 'x.forEach is not a function') {
                console.log(err.response.status);
            } else {
                console.log('An error occurred, please try again')
            }
        });
};








