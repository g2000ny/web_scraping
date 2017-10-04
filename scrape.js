
const axios = require('axios');
const config = require('./config.json');
const cheerio = require('cheerio');
const fs = require('fs');
const moment = require('moment');
const os = require('os');

var ScrapeService = (function(){

  return {
    populate : function(url){
      urlToLoad = (url != undefined) ? url : config.url;
      
      this.getContent(urlToLoad)
      .then(
        function(response){
          let data = [], data_eachline = "";
          if (response.status === 200) {

            var $ = cheerio.load(response.data);
            $('table.tablehead > tbody > tr').each(function(i, element){
              if (i > 0) {
                $(element).find('td').each(function(i, element){
                  let eachColumnData = i!=1 ? element.children[0].data : element.children[0].children[0].data;                  
                  data_eachline = data_eachline + eachColumnData + ","
                })
                if (data_eachline.length >0){
                  data_eachline = data_eachline.substr(0, data_eachline.length-1);
                }
                data.push(data_eachline);
                data_eachline = "";
              }
            });
          }
        
          return this.outputToFile(data);;
        }.bind(this)
        ,function(err){ console.log(err);}
      )
    }
    , outputToFile : function(data){
      if (data != null){  // data is an array 
        let filePrefix = config.file_prefix;  
        let formatStr = 'X';
        let dateTime = moment().format(formatStr);
        let fileName = `${filePrefix}_${dateTime}.csv`;
        let currDirectory = __dirname; 
        let wholeFile = `${currDirectory}\\output\\${fileName}`

        var file = fs.createWriteStream(wholeFile);
        file.on('error', function(err){
          console.log(err);
        });
        data.forEach(function(line){
          file.write(line + os.EOL); 
        })
        file.end();
      }  // end if (data != null) 
    } 
    // get content by xmlHttpRequest 
    , getContent : function(url){
      var config = {
        'url' : url
        ,'method' : 'GET'
      }
      return axios(config);
    }
  }
})();

module.exports = ScrapeService;