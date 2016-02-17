var fs = require('fs');
var express = require('express');
var http = require('http');
var app = express();
var port = 3000;
var server = http.Server(app).listen(port);
console.log(`Express app running on port ${port}`);

app.use(express.static(__dirname + '/public'));

var hod = require('havenondemand');
var hodclient = new hod.HODClient(process.env.HOD_API_KEY, 'v1');

var Twit = require('twit');
var twitclient = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var twit_stream = twitclient.stream('statuses/filter', { track: ['Grammy Awards', 'Grammys'], language: 'en' });
var write_stream = fs.createWriteStream('tweets.txt');

var expression = /(?:https):\/\/[\n\S]+/g;
var test = /(RT)[ ]/g;
var url_regex = new RegExp(expression);
var rt_regex = new RegExp(test);

twit_stream.on('tweet', function(tweet) {
  var cur_tweet = tweet.text;
  var filtered_tweet = cur_tweet.replace(url_regex, '').replace(rt_regex, '');

  console.log(filtered_tweet);
  write_stream.write(filtered_tweet + '\n');

  console.log("\n");
});

twit_stream.on('error', function(error) {
  console.log(error);
  twit_stream.stop();
  write_stream.close();
});

setTimeout(function() {
  twit_stream.stop();
  write_stream.close();
  console.log("Streams stopped");
  console.log("Sending to Haven API. . .");

  var read_stream = fs.createReadStream("./tweets.txt", "UTF-8");
  var text = "";

  read_stream.once("data", function() {
    console.log("Started reading file. . .");
  });

  read_stream.on("data", function(chunk) {
    process.stdout.write(`chunk: ${chunk.length} | `);
    text += chunk;
  });

  read_stream.on("end", function() {
    console.log(`Finished reading. . .${text.length}`);
    console.log("Sending to API. . .");

    var data = {text: text};

    hodclient.call('extractconcepts', data, function(err, res, body) {
      var concepts = body.concepts;
      for(var i in concepts) {
        console.log(concepts[i].concept + ' : ' + concepts[i].occurrences);
      }
    });
  });
}, 10000);
