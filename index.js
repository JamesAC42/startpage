const http = require("http");
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const fetch = require("node-fetch");
const https = require("https");

const weatherHost = "https://api.darksky.net";
const weatherKey = "";
const weatherPath = "/forecast/";
const weatherParams = "?exclude=[minutely,daily,alerts,flags]"

const newsHost = "https://newsapi.org";
const newsKey = "";
const newsPath = "/v2/top-headlines";
const newsParams = "?sources=google-news&lang=en&apiKey=";

const agent = new https.Agent({
	rejectUnauthorized: false
});

const server = http.createServer(function(req, res) {
	if (req.method.toLowerCase() == "get") {
		respondPage(req, res);
	} else {
		postData(req,res);
	}
});

function respondPage(req, res) {
	let filePath = req.url;
	if (filePath == "/") {
		filePath = "/index.html";
	}
	filePath = __dirname + filePath;
	const extname = path.extname(filePath);
	let contentType = "text/html";
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

	switch(req.url) {
		case "/getWeather":
			returnWeather(req, res);
			break;
		case "/getFavorites":
			returnFavorites(req, res);
			break;
		case "/updateFavorites":
			updateFavorites(req, res);
			break;
		case "/getNews":
			returnNews(req, res);
			break;
		case "/getBackgroundAmount":
			returnBackgroundAmount(req, res);
			break;
		default:
			res.writeHead(500);
			res.end();
	}
}

function returnNews(req, res) {
	res.writeHead(200, {'Content-Type':'text/plain'});
	reqUrl = newsHost + newsPath + newsParams + newsKey;
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

		let reqUrl = weatherHost + weatherPath + weatherKey + latitude + "," + longitude + weatherParams;

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
	const form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		let links = JSON.parse(fields.linkJSON);
		fs.writeFile("./favorites.json", JSON.stringify(links, null, '	'), "utf8", callback => {return;});
		res.end();
	});
}

function returnBackgroundAmount(req, res) {
	fs.readdir('./backgrounds', (err, files) => {
		if(err) {
			res.writeHead(500);
			res.end();
		}
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end(JSON.stringify(files));
	});
}

server.listen(3000);
console.info("Server listening at 3000...");