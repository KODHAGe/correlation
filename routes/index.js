var express = require('express')
var router = express.Router()
var scraper = require('../scrapethestuff.js')

/* GET home page. */
router.get('/random', function (req, res, next) {
  res.render('index', { title: 'So you need a random dataset?' })
})

router.get('/wb', function (req, res, next) {
  var wbLinks = scraper.scrapeIndicators()
  wbLinks.then(function (result) {
    console.log(result)
    if (result != undefined) {
		  res.render('result', {title: 'Here you go', link: result.link, url: result.url})
		  // http://api.worldbank.org/v2/en/indicator/DT.NFL.NIFC.CD?downloadformat=xml
    } else {
      res.render('result', {title: 'Sorry, the World Bank seems to be down :('})
    }
  })
})

router.get('/', function (req, res, next) {
  console.log('wb', wb)
  if (req.headers['content-type'] === 'application/json') {
    var wb = scraper.loadTheData()
    wb.then(function (result) {
      console.log('res', result)
      res.setHeader('Content-Type', 'application/json')
    	res.send(JSON.stringify({result}))
    	})
  } else {
    res.render('corr', {result: 'Here be dragons'})
  }
})

router.post('/funnel', function (req, res, next) {
  var data = req.body
  console.log('data', data)
  if (req.headers['content-type'] === 'application/json') {
    var returndata = scraper.dataFunnel(data)
    returndata.then(function (re, er) {
      res.send(re)
    })
  }
})

module.exports = router
