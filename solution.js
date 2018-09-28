var fs = require('fs');//write output file
var request = require('request');//request http
var cheerio = require('cheerio');//cheerio
var Promise = require("bluebird");//promise all
var BASE_URL = 'https://www.bankmega.com/promolainnya.php'
var responseJson = {}
function crawlerCategories($) {
    return $('#subcatpromo div img').map(function() {
        return $(this).attr('title');
    }).get();
}

function crawlerCategoryEndPage($) {
    return $('.page_promo_lain').eq(1).attr('title').match(/\d+/g).map(Number).pop();
}

function crawlerCategoryName($) {
    return $('#subcatselected img').attr('title')
}

function writeOutput(data) {
    fs.writeFile('solution.json', data, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
}

function crawler(html) {
    var $ = cheerio.load(html);
    //category
    categories = crawlerCategories($)

    var promiseCategories = [];
    for (i=1; i<=categories.length; i++) {
        var subcat = i;
        var taskCategory = new Promise(function(resolve, reject) {
            var pageEnd = 1;
            //step 1: get data from pageStart=1 then find the value of pageEnd
            var pageStart = 1;
            var categoryURL = BASE_URL+'?'+'subcat='+subcat+'&'+'page='+pageStart;
            request(categoryURL, function(error, response, html) {
                if(!error && response.statusCode == 200) {
                    resolve(html);
                }
            })
        }).then(function(html) {
            var $ = cheerio.load(html);
            pageEnd = crawlerCategoryEndPage($);
            categoryName = crawlerCategoryName($);
            responseJson[categoryName]= 1
            //step 2: loop from pageSecond to the pageEnd
            //fucking code
            pageStart = 2;
            var promisePages = [];
            for (p=pageStart; p<=pageEnd; p++) {
                var taskPage = new Promise(function(resolve, reject) {
                    var categoryURL = BASE_URL+'?'+'subcat='+subcat+'&'+'page='+p
                    responseJson[categoryName]++;
                    request(categoryURL, function(error, response, html) {
                        if(!error && response.statusCode == 200) {
                            resolve(html)
                        }
                    })
                }).then(function(html) {
                    var $ = cheerio.load(html);
                    pageEnd = crawlerCategoryEndPage($);
                    categoryName = crawlerCategoryName($);
                    responseJson[categoryName]++
                    //step 2: loop from pageSecond to the pageEnd
                });
                promisePages.push(taskPage);
            }

            Promise.all(promisePages).then(function(results) {
                console.log('--subdone');
            }, function(err) {
                console.log('sub error: '+err);
            });
            //end fucking code
        });
        promiseCategories.push(taskCategory);
    }
    

    Promise.all(promiseCategories).then(function(results) {
        writeOutput(JSON.stringify(responseJson));
    }, function(err) {
        writeOutput('error: '+err);
    });
}

request(BASE_URL, function(error, response, html) {
    if(!error && response.statusCode == 200) {
        crawler(html)
    }
})