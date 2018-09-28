var fs = require('fs');//write output file
var request = require('request');//request http
var cheerio = require('cheerio');//cheerio
var Promise = require("bluebird");//promise all
var HOME_URL = 'https://www.bankmega.com';
var BASE_URL = HOME_URL + '/promolainnya.php';
var categories = []
var pageOfCategory = {}
var subcatOfCategory = {}
var linkOfCategory = {}
var cellOfCategory = {}
function crawlerCategories($) {
    return $('#subcatpromo div img').map(function(index) {
        var categoryName = $(this).attr('title');
        subcatOfCategory[categoryName] = index+1;
        return categoryName;
    }).get();
}

function crawlerCategoryEndPage($) {
    return $('.page_promo_lain').eq(1).attr('title').match(/\d+/g).map(Number).pop();
}

function crawlerCategoryName($) {
    return $('#subcatselected img').attr('title')
}

function crawlerCellLinks($) {
    return $('#promolain li a').map(function() {
        var subURL = $(this).attr('href');
        return subURL.includes('http')?subURL:HOME_URL + '/' + subURL;
    }).get();
}

function crawlerCellDetail($) {
    cellJson = {}
    imageLink = $('.keteranganinside img').attr('src')||"";
    cellJson['image'] = imageLink.includes('http')||imageLink=="" ? imageLink : HOME_URL + imageLink;
    cellJson['title'] = $('.titleinside h3').text()||"";
    cellJson['period'] = $('.periode b').text()||"";
    cellJson['area'] = $('.area b').text()||"";
    return cellJson
}


function writeOutput(data) {
    fs.writeFile('solution.json', data, function (err) {
        if (err) throw err;
        console.log('Finished!');
      });
}

function getData(html) {
    console.time('runTime');
    var $ = cheerio.load(html);
    //get all category
    categories = crawlerCategories($)

    var promiseCategories = [];
    for (i=1; i<=categories.length; i++) {
        var subcat = i;
        var taskCategory = new Promise(function(resolve, reject) {
            var pageEnd = 1;
            //STEP 1: get data from pageStart=1 then find the value of pageEnd of each Category
            var pageStart = 1;
            var categoryURL = BASE_URL+'?'+'subcat='+subcat+'&'+'page='+pageStart;
            request(categoryURL,function(error, response, html) {
                if(!error && response.statusCode == 200) {
                    resolve(html);
                }
                resolve();
            })
        });
        taskCategory.then(function(html) {
            var $ = cheerio.load(html);
            pageEnd = crawlerCategoryEndPage($);
            categoryName = crawlerCategoryName($);
            //save pageEnd of each category to "pageOfCategory"
            pageOfCategory[categoryName] = pageEnd;
        });
        promiseCategories.push(taskCategory);
    }

    return Promise.all(promiseCategories).then(function(results) {
        //start fetching link of cell
        getDataCells();
    }, function(err) {
        console.log('getData Error: '+err);
    });
}

function getDataCells() {
    //STEP 2: loop all pages in each category to get the detail URL of cells
    var promisePages = [];
    categories.forEach(function(category){
        pageStart = 1;
        pageEnd = pageOfCategory[category];
        subcat = subcatOfCategory[category];
        linkOfCategory[category] = [];
        for (p=pageStart; p<=pageEnd; p++) {
            var taskPage = new Promise(function(resolve, reject) {
                var categoryURL = BASE_URL+'?subcat='+subcat+'&page='+p;
                
                request(categoryURL, function(error, response, html) {
                    if(!error && response.statusCode == 200) {
                        resolve(html)
                    }
                    resolve('')
                })
            });
            taskPage.then(function(html) {
                    var $ = cheerio.load(html);
                    cellLink = crawlerCellLinks($);
                linkOfCategory[category] = linkOfCategory[category].concat(cellLink);
            });
            promisePages.push(taskPage);
        }
    });
    return Promise.all(promisePages).then(function(results) {
        //start fetching info of cell
        getDataCellInfos();
    }, function(err) {
        console.log('getDataCells Error: '+err);
    });
}

function getDataCellInfos(){
    //STEP 3: loop all link groupby category
    var promiseCells = [];
    categories.forEach(function(category){
        cellOfCategory[category] = [];
        linkOfCategory[category].forEach(function(linkCell) {
                var taskCell = new Promise(function(resolve, reject) {
                    request(linkCell, function(error, response, html) {
                        if(!error && response.statusCode == 200) {
                            resolve(html)
                        }
                        resolve('');
                    });
                });
                taskCell.then(function(html) {
                    var $ = cheerio.load(html);
                    cellOfCategory[category].push(
                        {
                            ...crawlerCellDetail($),
                            'url':linkCell
                        });
                });
                promiseCells.push(taskCell);
            });
        });
    return Promise.all(promiseCells).then(function(results) {
        console.timeEnd('runTime');
        writeOutput(JSON.stringify(cellOfCategory));
    }, function(err) {
        console.log('getDataCellInfos Error: '+err);
    });
}

request(BASE_URL,function(error, response, html) {
    if(!error && response.statusCode == 200) {
        getData(html);
    }
})