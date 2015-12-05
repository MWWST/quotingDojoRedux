var express = require("express");
// Create an Express App
var app = express();

var path = require("path");
// Require body-parser (to recieve post data from clients)
var bodyParser = require("body-parser");

var mongoose = require('mongoose');

// Integrate body-parser with our App
app.use(bodyParser.urlencoded());
// Setting our Static Folder Directory
app.use(express.static(__dirname + "./static"));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request
app.get('/', function(req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.

    
    res.render('index');
    
})

app.get('/quotes', function(req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.

    Quote.find({},function(err,quotes){
    	if(quotes){
    		res.render('quotes',{thequotes:quotes});

    	}

   		else if(err){
   			res.render('quotes',{thequotes:err});
   		}

   		else {
   			res.render('quotes',{thequotes:'no quotes saved yet'})
   		}
    })
    
    
})

app.post('/quotes',function(req,res){
	console.log("POST DATA",req.body);

	var quote = new Quote({name:req.body.name,
		quote:req.body.quote});

	quote.save(function(err){
		if(err){
			console.log('something went wrong',err);
		}
		else {
			console.log('successfully added the user');
			res.redirect('/quotes')
		}
	})
	
})

app.post('/like',function(req,res){
	console.log(req.body);
	var conditions = {_id: req.body.id},
	update ={$inc:{likes:1}}
	, options = {};

	Quote.update(conditions,update,options,function(err,numAffected){
		if (err){
			console.log("no update",err);
		}
		else {
			console.log(numAffected);
			// res.send(numAffected);
		}


	})


})

var server = app.listen(8008, function() {
    console.log("listening on port 8008");
})

var io = require('socket.io').listen(server)

io.sockets.on('connection', function (socket) {
  console.log("WE ARE USING SOCKETS!");
  console.log(socket.id);

  socket.on("new_like",function(data){
  	console.log(data);
  	var conditions = {_id: data.id},
	update ={$inc:{likes:1}}
	, options = {};

	Quote.update(conditions,update,options,function(err,numAffected){
		if (err){
			console.log("no update",err);
		}
		else {
			// console.log(numAffected);
			// res.send(numAffected);
		Quote.find({_id:data.id},function(err,quote){
			if(err){
				console.log('there was an error',err)
			}
			else {
				console.log(quote[0].likes);

				update = {
					id: data.id,
					newcount: quote[0].likes
				}
			io.emit("like_update",{update:update});

			}
		});
			
		}


	})

  })


})

mongoose.connect('mongodb://localhost/quotingDojo2016');




var QuoteSchema = new mongoose.Schema({
	name: String,
	quote: String,
	likes: {type: Number, default:0},
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date}
})

mongoose.model('Quote',QuoteSchema) // set the schema in our models as User
var Quote = mongoose.model('Quote');