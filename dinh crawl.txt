var fs = require('fs');//write output file
var request = require('request');//request http
var cheerio = require('cheerio');//cheerio
var Promise = require("bluebird");//promise all
var responseData = 'bello YellCaMap'
var BASE_URL = 'https://www.bankmega.com/promolainnya.php'
var taskCategories = []
// ?subcat=1&page=5
// BASE_URL+'?'+'subcat='+1+'&'+'page='+1, 
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

function crawlerCategory(subcat) {
    var pageEnd = 1;
    //step 1: get data from pageStart=1 then find the value of pageEnd
    var pageStart = 1;
    var categoryURL = BASE_URL+'?'+'subcat='+subcat+'&'+'page='+pageStart;

    request(categoryURL, function(error, response, html) {
        if(!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            pageEnd = crawlerCategoryEndPage($);
            categoryName = crawlerCategoryName($);
            console.log('categoryName_'+categoryName+'__pageEnd_'+pageEnd);
            responseJson[categoryName]= 1
    //step 2: loop from pageSecond to the pageEnd
            // var taskPages = []
            // pageStart = 2;
            // for (p=pageStart; p<=pageEnd; p++) {
            //     var categoryURL = BASE_URL+'?'+'subcat='+subcat+'&'+'page='+p
            //     console.log('--p'+p+'--category'+subcat)
            //     responseJson[categoryName]++;

            //                                 request(categoryURL, function(error, response, html) {
            //                                     console.log('----p'+p+'--category'+subcat)
            //                                     if(!error && response.statusCode == 200) {
            //                                         var $ = cheerio.load(html);
            //                                         responseJson[categoryName]++;
            //                                         // console.log(responseJson);
            //                                     }
            //                                 });
            //     taskPages.push(taskPage);
            // };
            // Promise.all(taskPages).then(function(){
            //     console.log('done1em_'+subcat);
            // });
        }
    })
    

   
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
            console.log('categoryName_'+categoryName+'__pageEnd_'+pageEnd);
            responseJson[categoryName]= 1
            //step 2: loop from pageSecond to the pageEnd
            //fucking code
            pageStart = 2;
            var promisePages = [];
            for (p=pageStart; p<=pageEnd; p++) {
                var taskPage = new Promise(function(resolve, reject) {
                    var categoryURL = BASE_URL+'?'+'subcat='+subcat+'&'+'page='+p
                    console.log('--p'+p+'--category'+subcat)
                    responseJson[categoryName]++;
                    request(categoryURL, function(error, response, html) {
                        // console.log('----p'+p+'--category'+subcat)
                        if(!error && response.statusCode == 200) {
                            resolve(html)
                        }
                    })
                }).then(function(html) {
                    var $ = cheerio.load(html);
                    pageEnd = crawlerCategoryEndPage($);
                    categoryName = crawlerCategoryName($);
                    console.log('categoryName_'+categoryName+'__pageEnd_'+pageEnd);
                    responseJson[categoryName]++
                    //step 2: loop from pageSecond to the pageEnd
                });
                promisePages.push(taskPage);
            }
            
        
            Promise.all(promisePages).then(function(results) {
                // all promises are fulfilled here
                // results is an array of all the responses, in order
                console.log('--subdone');
                console.log(JSON.stringify(responseJson));
                // writeOutput(JSON.stringify(responseJson));
            }, function(err) {
                // one or more promises rejected, err is the first rejection reason
                console.log('error------------'+err);
                console.log(JSON.stringify(responseJson));
                // writeOutput('error roi');
            });
            //end fucking code
        });
        promiseCategories.push(taskCategory);
    }
    

    Promise.all(promiseCategories).then(function(results) {
        // all promises are fulfilled here
        // results is an array of all the responses, in order
        console.log('done------------');
        console.log(JSON.stringify(responseJson));
        writeOutput(JSON.stringify(responseJson));
    }, function(err) {
        // one or more promises rejected, err is the first rejection reason
        console.log('error------------'+err);
        console.log(JSON.stringify(responseJson));
        writeOutput('error roi');
    });
}

request(BASE_URL, function(error, response, html) {
    if(!error && response.statusCode == 200) {
        crawler(html)
        // responseData = crawler(html)
        // writeOutput(JSON.stringify(responseData))
    }
})