var http = require("http");
var fs = require("fs");
var formidable = require("formidable");
var path = require("path");
var fetch = require("node-fetch");

var weatherKey = "";
var newsKey = "";

var weatherHost = "https://api.darksky.net";
var weatherPath = "/forecast/" + weatherKey + "/";
var weatherParams = "?exclude=[minutely,daily,alerts,flags]"

var newsHost = "https://newsapi.org";
var newsPath = "/v2/top-headlines";
var newsParams = "?sources=google-news&lang=en&apiKey=" + newsKey;

const agent = new https.Agent({
	rejectUnauthorized: false
});

var server = http.createServer(function(req, res) {
	if (req.method.toLowerCase() == "get") {
		respondPage(req, res);
	} else {
		postData(req,res);
	}
});

function respondPage(req, res) {
	var filePath = req.url;
	if (filePath == "/") {
		filePath = "/index.html";
	}
	filePath = __dirname + filePath;
	var extname = path.extname(filePath);
	var contentType = "text/html";
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	fs.exists(filePath, (exists) => {
		if (exists) {
			fs.readFile(filePath, (err, data) => {
				if (err) errorRespond();
				res.writeHead(200, {'Content-Type': contentType});
				res.end(data, 'utf8');
			});
		} else {
			res.writeHead(404);
			res.end();
		}
	});
}

function postData(req, res) {
	if (req.url == "/getWeather") {
		returnWeather(req, res);
	} else if (req.url == "/getFavorites") {
		returnFavorites(req, res);
	} else if (req.url == "/updateFavorites") {
		updateFavorites(req, res);
	} else if (req.url == "/getNews") {
		returnNews(req, res);
	}
}

function returnNews(req, res) {
	res.writeHead(200, {'Content-Type':'text/plain'});
	reqUrl = newsHost + newsPath + newsParams;
	fetch(reqUrl, {agent})
		.then(function (fetch_res) {
			return fetch_res.text();
		}).then(function (body){
			res.end(body);
		}).catch(err => console.info(err.message));

}

function returnWeather(req, res) {
	let form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){

		let latitude = fields.latitude;
		let longitude = fields.longitude;

		let reqUrl = weatherHost + weatherPath + latitude + "," + longitude + weatherParams;

		res.writeHead(200, {'Content-Type': 'text/plain'});

		fetch(reqUrl, {agent})
			.then(function (fetch_res) {
				return fetch_res.text();
			}).then(function (body){
				res.end(body);
			}).catch(err => console.info(err.message));
	});
}

function returnFavorites(req, res) {
	fs.readFile("./favorites.json", function(error, content) {
		if (error) {
			res.writeHead(500);
			res.end();
		}
		else {                   
			res.writeHead(200, { 'Content-Type': "text/plain" });
			res.end(content, 'utf8');                  
		}
	})
}

function updateFavorites(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		let links = JSON.parse(fields.linkJSON);
		fs.writeFile("./favorites.json", JSON.stringify(links, null, '	'), "utf8", callback => {return;});
		res.end();
	});
}

server.listen(3000);
console.info("Server listening at 3000...");