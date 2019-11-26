'use strict'

const SitemapGenerator = require('sitemap-generator');

const fs = require('fs-extra')
const zipFolder = require('zip-a-folder');




var count = 0;
var seconds = 0;
var lastURL = '';



var countDom = document.querySelector("#count")
var lastDom = document.querySelector("#last")
var rateDom = document.querySelector("#rate")
var formDom = document.querySelector("#form")
var timeDom = document.querySelector("#time")
var resumenDom = document.querySelector("#resumen")
var path = document.querySelector("#path")



var generator = false;
setInterval(function(){
    lastDom.innerHTML = lastURL;
    
    countDom.innerHTML = formatNumber(count) + " URLS";
}, 500);
setInterval(function(){
    
    let r = count / seconds;
    if (!r) r = 0;
    
    seconds++;
    rateDom.innerHTML = r.toFixed(2)+" URL/s"
    timeDom.innerHTML = hhmmss(seconds);
    
},1000);

document.querySelector("#start").onclick = function(){
    this.classList.add('is-loading');
    
    start();
}

document.querySelector("#down").onclick = function(){
    this.classList.add("is-loading");
    if (fs.existsSync("./files.zip")){
        fs.unlinkSync("./files.zip");
            download();
    }else{
        download();
    }

   
    
}
var download = function(){
    zipFolder.zipFolder('./sitemap/', './files.zip', function (err) {
        if (err) {
            console.log('Something went wrong!', err);
        } else {
            document.location.href = './files.zip';
            document.querySelector("#down").classList.remove("is-loading");
        }
    });
}
document.querySelector("#cancel").onclick = function(){
    if(confirm('Are you sure?')){
        generator.stop();
        startAgain();
    }
}
document.querySelector("#newSitemap").onclick = function(){
    if(confirm('Are you sure?\nPlease first download your files')){
        startAgain();
    }
}

var startAgain = function(){
    document.querySelector("#start").classList.remove('is-loading');
    document.querySelector("#form").classList.remove('is-hide');
    document.querySelector("#message").classList.remove('is-hide');
    document.querySelector("#progress").classList.add('is-hide');
    document.querySelector("#download").classList.add('is-hide');
}
if (localStorage.getItem('lastURL')){
    document.querySelector("#url").value = localStorage.getItem('lastURL');
}
var formatNumber = function(n){
    const formatter = new Intl.NumberFormat('en-US', {
        
        minimumFractionDigits: 0
    })
    return formatter.format(n);
}

function pad(num) {
    return ("0" + num).slice(-2);
}
function hhmmss(secs) {
    var minutes = Math.floor(secs / 60);
    secs = secs % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}

var start = function(){
    let folder = './sitemap/';
    if (fs.existsSync(folder)) {
        
        fs.remove(folder).then( () => {
        
            fs.mkdirSync(folder)
        });
    }else{
        fs.mkdirSync(folder)
    }

    seconds = 0;
    count = 0;
    let url = document.querySelector("#url").value;
    localStorage.setItem('lastURL',url);
    document.querySelector("#form").classList.add('is-hide');
    document.querySelector("#message").classList.add('is-hide');
    document.querySelector("#progress").classList.remove('is-hide');
    generator = SitemapGenerator(url, {
        maxDepth: 0,
        filepath:folder+"sitemap.xml",
        maxEntriesPerFile: 40000,
        stripQuerystring: true,
        maxConcurrency:6,
        lastMod: true,
        priorityMap: [1.0, 0.8, 0.6, 0.4, 0.2, 0],
        userAgent: 'Sitemap/Generator MacOS <1.0.1>'
    });
    generator.start();

    // register event listeners
    generator.on('done', () => {
        // sitemaps created
        //alert("Finalized");
        document.querySelector("#progress").classList.add('is-hide');
        document.querySelector("#download").classList.remove('is-hide');
        resumenDom.innerHTML = formatNumber(count) + " URLS in " + hhmmss(seconds);
    });

    generator.on('add', (url) => {
        count++;
        //console.log(url);
        lastURL = url;
        
    });


}




