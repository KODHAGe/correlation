var express = require('express');
var router = express.Router();
var scraper = require('../scrapethestuff.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'So you need a random dataset?' });
});

router.get('/wb', function(req, res, next) {
	var wbLinks = scraper.scrapeIndicators();
	wbLinks.then(function(result){
		res.render('result', {title:'Here you go', link:result.link, url:result.url});
	})
});

module.exports = router;
