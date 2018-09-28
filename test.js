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

    // await new Promise((resolve) => ().then((response) => {
    //     console.log(response);
    //     resolve();
    // }).catch(error => reply(Boom.badRequest(error))));

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
                //     var taskPage = new Promise.resolve( 
                //                                 (request(categoryURL, function(error, response, html) {
                //                                     console.log('----p'+p+'--category'+subcat)
                //                                     if(!error && response.statusCode == 200) {
                //                                         var $ = cheerio.load(html);
                //                                         responseJson[categoryName]++;
                //                                         // console.log(responseJson);
                //                                     }
                //                                 })));
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
    // var $ = cheerio.load(html);
    // //category
    // categories = crawlerCategories($)

    // var promises = [];
    // for (i=1; i<=categories.length; i++) {
    // promises.push(new Promise(function(resolve, reject) {
    //     crawlerCategory(i)
    // }));
    // }
    // Promise.all(promises).then(function(results) {
    //     // all promises are fulfilled here
    //     // results is an array of all the responses, in order
    //     console.log('done------------');
    //     console.log(JSON.stringify(responseData));
    //     writeOutput(JSON.stringify(responseData));
    // }, function(err) {
    //     // one or more promises rejected, err is the first rejection reason
    //     console.log('error------------');
    //     console.log(JSON.stringify(responseData));
    //     writeOutput('error roi');
    // });


    // var files = [];
    // for (var i = 0; i < 30; ++i) {
    //     files.push(request(BASE_URL, function(error, response, html) {
    //         if(!error && response.statusCode == 200) {
    //             console.log('done '+i)
    //         }
    //     }))
    // }
    // Promise.all(files).then(function() {
    //     console.log("all the files were created");
    // });

//     Promise.map(urls, url => fetch(url))
//   .then(···)


//   // Using Promise.map:
// Promise.map(['1','2','3','4','5','6'], function(fileName) {
//     // Promise.map awaits for returned promises as well.
//     return new Promise fs.writeFile(fileName+'.del', 'data', function (err) {
//         if (err) throw err;
//         console.log('Saved!');
//       });
//     // return fs.readFileAsync(fileName);
// }).then(function() {
//     console.log("doneeee");
// });


var x1 = Promise.resolve(
    setTimeout(function(){console.log(`arg was => funky1`)}, 8500)
);
var x2 = Promise.resolve(
    setTimeout(function(){console.log(`arg was => funky2`)}, 8500)
);
var x3 = Promise.resolve(
    setTimeout(function(){console.log(`arg was => funky3`)}, 8500)
);
var promiseData = Promise.all([x1, x2, x3]);
promiseData
    .then(values => {
        const data = {};
        if (values !== null) {
            
        }

        console.log('doooneee')
    }).catch(err => {
        console.log('eerrroorrr')
    });
    console.log('finish')
}

// request(BASE_URL, function(error, response, html) {
//     if(!error && response.statusCode == 200) {
//         crawler(html)
//         // responseData = crawler(html)
//         // writeOutput(JSON.stringify(responseData))
//     }
// })

var x1 = new Promise(function(resolve, reject) {
    setTimeout(function() { 
      resolve('arg was => xfunky1');
    }, 2500);
  }).then(function(value) { 
    console.log(value);
// expected output: "foo"
});

var x2 = new Promise(function(resolve, reject) {
    setTimeout(function() { 
      resolve('arg was => xfunky2');
    }, 2500);
  }).then(function(value) { 
    console.log(value);
// expected output: "foo"
});


var promiseData = Promise.all([x1, x2]);
promiseData
    .then(values => {
        console.log('doooneee')
    }).catch(err => {
        console.log('eerrroorrr')
    });