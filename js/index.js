
var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var months = ["January", "February","March","April","May","June","July","August","September","October","November","December"];

var linkData;

var weatherIcons = {
	"clear-day":"sunny-white.png",
	"clear-night":"night.png",
	"rain":"rain.png", 
	"snow":"snow.png", 
	"sleet":"hail.png", 
	"wind":"wind.png", 
	"fog":"fog.png", 
	"cloudy":"cloudy.png", 
	"partly-cloudy-day":"partlycloudy.png",
	"partly-cloudy-night":"partlycloudynight.png"
}

var active = "school";

var time;
var bgAmt = 32;

function loadLinks(cat) {
	$("div.title-bar").css("background",linkData[cat]["color"]);
	for (let item in linkData) {
		let entry = linkData[item];
		if(entry["name"] == active) {
			$("#" + active + "-tab").children().attr("src","./icons/" + entry["img-name"] + "-white.png");
		}
	}
	active = cat;
	$("#" + linkData[cat]["name"] + "-tab").children().attr("src","./icons/" + linkData[cat]["img-name"] + "-" + linkData[cat]["img-color"] + ".png");
	$("#links-list-1, #links-list-2").empty();
	let links = linkData[cat]["links"];
	for (let i = 0; i < links.length; i++) {
		let $listItem = $("<li><a href='" + links[i]["url"] + "'>" + links[i]["item"] + "</a></li>");
		if(i%2==1) {
			$("#links-list-1").append($listItem);
		} else {
			$("#links-list-2").append($listItem);
		}
	}
	$("#favorites-cat").text(active);
}

function updateFavorites() {
	let linkJSON = JSON.stringify(linkData);
	$.post("/updateFavorites", {linkJSON}, success => {return true;});
}

function getFavorites() {
	$.post("/getFavorites", success => {
		linkData = JSON.parse(success);
		loadLinks(active);
		return true;
	});
}

function getNews() {
	$.post("/getNews", success => {
		newsData = JSON.parse(success);
		$("#news-list").empty();
		let articles = newsData["articles"];
		articles = articles.splice(5,articles.length - 5);
		articles.forEach(function(item, index) {
			let $newsitem = $("<li><a href='" + item["url"] + "'>" + item["title"] + "</a></li>");
			$("#news-list").append($newsitem);
		});
		return;
	});
}

function getWeather() {

	navigator.geolocation.getCurrentPosition((position)=>{

		let latitude = position["coords"]["latitude"];
		let longitude = position["coords"]["longitude"];

		let coords = {latitude, longitude};

		$.post("/getWeather", coords, (forecastData) => {
			
			dataObject = JSON.parse(forecastData);
			loadWeather(dataObject);

		});

	});

}

function loadWeather(data) {

	let currently = data.currently;
	let time = currently["time"];
	let summary = currently["summary"];
	let icon = currently["icon"];
	let precipProbability = currently["precipProbability"];
	let temperature = Math.round(currently["temperature"]);
	let windSpeed = Math.round(currently["windSpeed"]);
	let humidity = currently["humidity"];
	let location = data.timezone;
	let date = new Date(time * 1000);

	time = date.getTime();

	let hours = date.getHours();
	let minutes = date.getMinutes();
	if (minutes < 10)
		minutes = "0" + minutes.toString();

	$(".time-stamp").text(hours + ":" + minutes);
	$(".weekday").text(weekdays[date.getDay()]);
	$(".month-num").text(months[date.getMonth()] + " " + date.getDate());
	$(".year").text(date.getFullYear());

	$("#weather-location").text(location);
	$(".temp-sum").text(temperature + "\u00B0");
	$("#precipitation-val").text(Math.round(precipProbability * 100) + "%");
	$("#humidity-val").text(Math.round(humidity * 100) + "%");
	$("#windspeed-val").text(windSpeed + " MPH");

	$("#current-weather-img").attr("src","./icons/weather/" + weatherIcons[icon]);

	$(".weather-description").text(summary);

	let hourly = data.hourly;
	let forecastSummary = hourly.summary;
	let forecastHours = hourly.data;

	$(".forecast-description").text(forecastSummary);

	var forecastItems = $(".forecast").children();

	$(".forecast-item").each(function(i){

		let dataItem = forecastHours[i+1];
		let time  = dataItem["time"];
		let icon = dataItem["icon"];
		let precipProbability = dataItem["precipProbability"];
		let temperature = Math.round(dataItem["temperature"]);
		let date = new Date(time * 1000);

		let hours = date.getHours();
		let minutes = date.getMinutes();
		if(minutes < 10) minutes = "0" + minutes.toString();

		let $forecastItem = forecastItems[i];

		$(this).children(".forecast-time").text(hours + ":" + minutes);
		$(this).children(".forecast-symbol").children().attr("src","./icons/weather/" + weatherIcons[icon]);
		$(this).children(".forecast-temp").text(temperature + "\u00B0");
		$(this).children(".forecast-precip").children(".forecast-precip-val").text(Math.round(precipProbability * 100) + "%");

	});

}


$(document).ready(function(){

	$(".icon").mouseover(function(){
		$(this).prev().addClass("icon-support");
		$(this).next().addClass("icon-support");
	}).mouseleave(function(){
		$(this).prev().removeClass("icon-support");
		$(this).next().removeClass("icon-support");
	});

	$(".icons-container").mouseover(function(){
		$(".navbar-glow").addClass("navbar-glow-highlight");
	}).mouseleave(function(){
		$(".navbar-glow").removeClass("navbar-glow-highlight");
	});

	$("#search-input").keydown(function(e){
		if (e.keyCode === 13) {
			e.preventDefault();
			let input = $(this).val();
			
			let sections = input.split(" ");
			let cat = sections[1];
			let item;
			let links;

			switch(sections[0]){
				case "s":
					sections.splice(0,1);
					let query = sections.join(" ");
					window.location.href = "https://www.google.com/search?q=" + query;
					break;
				case "add":
					item = sections[2];
					let url = sections[3];

					let entry = {item, url};

					linkData[cat]["links"].push(entry);

					if (cat == active) {
						let $listItem = $("<li><a href='" + url + "'>" + item + "</a></li>");
						if (linkData[cat]["links"].length % 2 == 0){
							$("#links-list-1").append($listItem);
						} else {
							$("#links-list-2").append($listItem);
						}
					};
					updateFavorites();
					break;
				case "rename":
					links = linkData[cat]["links"];
					console.info(links);
					item = sections[2];
					let newName = sections[3];
					console.info(sections);
					for(let i = 0;i < links.length;i++) {
						if (links[i]["item"] == item) {
							linkData[cat]["links"][i]["item"] = newName;
						}
					}
					loadLinks(cat);
					updateFavorites();
					break;
				case "relink":
					links = linkData[cat]["links"];
					item = sections[2];
					let newLink = sections[3];
					for(let i = 0;i < links.length;i++) {
						if (links[i]["item"] == item) {
							linkData[cat]["links"][i]["url"] = newLink;
						}
					}
					loadLinks(cat);
					updateFavorites();
					break;
				case "rm":
					links = linkData[cat]["links"];
					item = sections[2];
					for(let i = 0;i < links.length;i++) {
						if (links[i]["item"] == item) {
							linkData[cat]["links"].splice(i, 1);
						}
					}
					loadLinks(cat);
					updateFavorites();
					break;
				default:
					break;
			}
			$(this).val("");
		}
	});

	$("#school-tab").mouseenter(function(){
		$(this).children().attr("src","./icons/book-blue.png");
	}).mouseleave(function(){
		if(active != 'school') {
			$(this).children().attr("src","./icons/book-white.png");
		}
	}).click(function(){
		loadLinks("school");
	});

	$("#tech-tab").mouseenter(function(){
		$(this).children().attr("src","./icons/terminal-green.png");
	}).mouseleave(function(){
		if(active != 'tech') {
			$(this).children().attr("src","./icons/terminal-white.png");
		}
	}).click(function(){
		loadLinks("tech");
	});

	$("#misc-tab").mouseenter(function(){
		$(this).children().attr("src","./icons/puzzle-orange.png");
	}).mouseleave(function(){
		if(active != 'misc') {
			$(this).children().attr("src","./icons/puzzle-white.png");
		}
	}).click(function(){
		loadLinks("misc");
	});

	$("#nip-tab").mouseenter(function(){
		$(this).children().attr("src","./icons/japan-red.png");
	}).mouseleave(function(){
		if(active != 'nip') {
			$(this).children().attr("src","./icons/japan-white.png");
		}
	}).click(function(){
		loadLinks("nip");
	});

	$("#settings-tab").mouseenter(function(){
		$(this).children().attr("src","./icons/settings-purple.png");
	}).mouseleave(function(){
		if(active != 'settings') {
			$(this).children().attr("src","./icons/settings-white.png");
		}
	}).click(function(){
		loadLinks("settings");
	});

	$("div.exit-button").click(function() {	
	      	      
		var el = $(this).parent().parent();
		el.remove();

	});
	
	let bgNum = Math.floor((Math.random() * (bgAmt + 1)));
	$("body").css("background-image", "url('/backgrounds/bg-" + bgNum + ".jpg')");

	getWeather();
	getFavorites();
	getNews();

	$("#search-input").focus();

});

