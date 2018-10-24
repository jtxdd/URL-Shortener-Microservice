'use strict';

var express    = require('express');
var app        = express();
var mongo      = require('mongodb');
var mongoose   = require('mongoose');
var cors       = require('cors');
var port       = process.env.PORT || 3000;
var bodyParser = require('body-parser');

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  originalUrl: String,
  shortUrl: String,
}, {timestamps: true});
const shortUrl = mongoose.model('shortUrl', urlSchema);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/new/:urlToShorten(*)', (req, res) => {
  var { urlToShorten } = req.params; //es6 notation
  var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  urlToShorten = 'https://www.' + urlToShorten;
  var valid = regex.test(urlToShorten);
  
  var test = {good: 'good', bad: 'bad'};
  
  if (valid) {
    var res_short = Math.floor(Math.random() * 100000).toString();
    
    var data_url = new shortUrl({
      originalUrl: urlToShorten,
      shortUrl: res_short
  });
      
  data_url.save(err => {
    if (err) {
      return res.send('Error saving to the database');
    }
  });
  return res.json(data_url);
  } else {
    return res.json(test.bad);
  }
});

app.get('/shorturl/:urlToForward', (req, res) => {                         
  var urlToForward= req.params.urlToForward;
                                                                            
  shortUrl.find({shortUrl: urlToForward}, (error, result) => {
    return (error) ? res.send(error) : res.redirect(result[0]['originalUrl']);
  });
});



app.post('/api/shorturl/', (req, res) => {
  var { longUrl } = req.body;
  
  console.log(longUrl);
});


app.listen(port, () => {
  console.log('Node.js listening ...');
});











/*INSTRUCTIONS
    route: [project_url]/api/shorturl/new
    - POST a URL to route, receive a shortened URL in the JSON response
       *Ex: {"original_url":"www.google.com","short_url":1}
    - invalid URL, receive {"error":"invalid URL"}
       *Ex: = improper url format. . . http(s)://www.example.com(/more/routes)
    
    - **check valid url with - dns.lookup(host, cb) from the dns core module.
    - visit the shortened URL, it will redirect me to my original link.
*/