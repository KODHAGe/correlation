/* 	
		This used to be only a scraper. Hence the name. Now it does more, like calculates correlations between things.
		Divided into functions, held together by promises, returns two random things that correlate with each other.
		exports loadTheData for a random correlation and scrapeIndicators for a lit of indicators on the wb site.
*/

var Xray = require('x-ray');
var x = Xray();
var simplestatistics = require('simple-statistics');
var request = require('superagent');

var correlationSetting = 0.8;

/*
for bluebehrd
var Promise = require("bluebird");

Promise.config({
    // Enable warnings
    warnings: true,
    // Enable long stack traces
    longStackTraces: true,
    // Enable cancellation
    cancellation: true,
    // Enable monitoring
    monitoring: true
});*/


Array.prototype.isNull = function (){
    return this.join().replace(/,/g,'').length === 0;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getCountries(){
	var countries = [];
	return new Promise(function(resolve,reject){
		request.get('http://api.worldbank.org/countries?format=json&per_page=310').end(function(err,res){
		for(var country of res.body[1]){
			countries.push(country.id);
		}
		resolve(countries);
		});
	});
}

/* 	This gets the indicators directly from the API and returns too many to be useful
		Hence not in use, use getIndicatorsWeb() instead

function getDatasets(){
	console.log("getDatasets: ");
	var datasets = [];
	return new Promise(function(resolve,reject){
		request.get('http://api.worldbank.org/indicators?format=json&per_page=3000').end(function(err,res){
		for(var set of res.body[1]){
			datasets.push(set.id);
		}
		resolve(datasets);
		});
	});
}
*/

function getIndicatorsWeb(){
	console.log("getIndicatorsWeb: Scraping indicators from the wb site");
	var foundLinks = [];
	return new Promise(function(resolve, reject){
		x('http://data.worldbank.org/indicator?tab=all', ['.overviewPage .wrapper .overviewArea .nav-item ul li'])(function(err, list){
			x('http://data.worldbank.org/indicator?tab=all', ['.overviewPage .wrapper .overviewArea .nav-item ul li a@href'])(function(err, urls){
				for(var i = 0; i < list.length; i++){
					urls[i] = urls[i].replace("http://data.worldbank.org/indicator/", "");
					urls[i] = urls[i].replace("?view=chart", "");					
				}
				resolve(urls);
			})
		})
	});
}

function getData(country, dataset, countries, datasets){
	console.log('getData: Getting data from API');
	var set = [];
	console.log(country, dataset);
	return new Promise(function(resolve, reject){
		request.get('http://api.worldbank.org/countries/'+country+'/indicators/'+dataset+'?date=2000:2015&format=json').end(function(err,res){
			console.log("Errors: ", err);
			if(res.body[1] === null){
				set.push(null);
				resolve(set);
			} else {
				for(var indicator of res.body[1]){
					set.push(indicator.value);
				}
				resolve(set);					
			}
		});
	})
}

function selectCountry (countries){
	return new Promise(function(resolve, reject){
		resolve(countries[getRandomInt(0,countries.length)]);
	})
}

function selectDataset (datasets){
	return new Promise(function(resolve, reject){
		resolve(datasets[getRandomInt(0,datasets.length)]);
	})
}

function getSets(countries,datasets){
	return new Promise(function(resolve, reject){
		console.log("getSets: Getting two sets of data");
		var country1 = countries[getRandomInt(0,countries.length)];
		var dataset1 = datasets[getRandomInt(0,datasets.length)];
		var set1 = getData(country1, dataset1, countries, datasets);
		var country2 = countries[getRandomInt(0,countries.length)];
		var dataset2 = datasets[getRandomInt(0,datasets.length)];
		var set2 = getData(country2, dataset2, countries, datasets);
		set1.then(function(){
			set2.then(function(){
				resolve([[set1, set2],[country1, country2], [dataset1, dataset2]]);
			});
		})
	})
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

exports.loadTheData = function(url){
	console.log("Start loading");
	getIndicatorsWeb();
	var countries = getCountries();
	var datasets = getIndicatorsWeb();
	return new Promise(function(resolve,reject){
		datasets.then(function(datasets){
			countries.then(function(countries){
				var setter = function(){
					console.log("Setter function: Getting all the data");
					console.log("Loop start");
					var sets = getSets(countries,datasets);
					sets.then(function(sets){
						var sets = sets;
						sets[0][0].then(function(result){
							var set1 = result;
							sets[0][1].then(function(result){
								var set2 = result;
								var corr = simplestatistics.sampleCorrelation(set1,set2).toFixed(2);
								console.log(corr);
								if(corr != null && corr > correlationSetting){
									var allTheData = {'set1': set1, 'country1':sets[1][0], 'country2':sets[1][1], 'dataset1':sets[2][0], 'dataset2':sets[2][1],'set2': set2, 'correlation': corr};
									resolve(allTheData);
								} else {
									setter();
								}
							})
						})
					});
				}
			setter();
			});
		})
	});
}

exports.dataFunnel = function(urltoload){
	var urltoload = urltoload;
	console.log("Funnel data from API");
	return new Promise(function(resolve, reject){
		request.get(urltoload.url).end(function(err, res){
			resolve(res.body);
		})
	})
}