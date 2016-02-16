var express = require('express');
var http = require('http');
var app = express();
var port = 3000;
var server = http.Server(app).listen(port);
console.log(`Express app running on port ${port}`);

app.use(express.static(__dirname + '/public'));

var Twit = require('twit');
var twitclient = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var twit_stream = twitclient.stream('statuses/filter', { track: 'deadpool', language: 'en' });

twit_stream.on('tweet', function(tweet) {
  console.log(tweet);
  console.log("\n");
});
