var Xray = require('x-ray');
var x = Xray();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.scrapeIndicators = function(){
	console.log("scrape thangs");
	var foundLinks = [];
	return new Promise(function(resolve, reject){
		x('http://data.worldbank.org/indicator?tab=all', ['.overviewPage .wrapper .overviewArea .nav-item ul li'])(function(err, list){
			x('http://data.worldbank.org/indicator?tab=all', ['.overviewPage .wrapper .overviewArea .nav-item ul li a@href'])(function(err, urls){
				for(var i = 0; i < list.length; i++){
					var obj = {'link': list[i], 'url': urls[i]};
					foundLinks.push(obj);
				}
				var selector = getRandomInt(0, foundLinks.length);
				resolve(foundLinks[selector]);
			})
		})
	});
}