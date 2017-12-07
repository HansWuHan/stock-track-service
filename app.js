var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require("request")
var parser = require('xml2js').Parser();
var moment = require('moment');
var indicators = ["SMA", "EMA", "STOCH", "RSI", "ADX", "CCI", "BBANDS", "MACD"];
var sleep = require('sleep');
let apiKey = ['KF6XB4IM7ANJQWMT', '5SP4Y7ZR1B8XUDBR', 'ZG26P7LYCXJIWKQN'];

var app = express();

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

app.get('/test', function (req, res) {
  res.send("test");
});

app.get('/', function (req, res) {
  console.log("get" + req.query.stock);

  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+ req.query.stock + "&outputsize=full&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    var data;
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        data = modifyStockData(body);
        getIndicators(req.query.stock, data["num"], function(response) {
          data["indicators"] = response;
          res.send(data);
          console.log("archive " + req.query.stock + " data");
        });
      }
    }
  });
});

app.get('/price', function (req, res) {
  console.log("get " + req.query.stock + " price");
  var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol="+ req.query.stock + "&outputsize=full&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    var data;
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        data = modifyStockData(body);
        res.send(data);
        console.log("archive " + req.query.stock + " price");
      }
    }
  });
});

app.get('/SMA', function (req, res) {
  console.log("get " + req.query.stock + " SMA");
  var url = "https://www.alphavantage.co/query?function=SMA&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "SMA", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " SMA");
      }
    }
  });
});


app.get('/EMA', function (req, res) {
  console.log("get " + req.query.stock + " EMA");
  var url = "https://www.alphavantage.co/query?function=EMA&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "EMA", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " EMA");
      }
    }
  });
});

app.get('/RSI', function (req, res) {
  console.log("get " + req.query.stock + " EMA");
  var url = "https://www.alphavantage.co/query?function=RSI&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "RSI", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " RSI");
      }
    }
  });
});

app.get('/ADX', function (req, res) {
  console.log("get " + req.query.stock + " ADX");
  var url = "https://www.alphavantage.co/query?function=ADX&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "ADX", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " ADX");
      }
    }
  });
});

app.get('/CCI', function (req, res) {
  console.log("get " + req.query.stock + " CCI");
  var url = "https://www.alphavantage.co/query?function=CCI&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "CCI", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " CCI");
      }
    }
  });
});

app.get('/BBANDS', function (req, res) {
  console.log("get " + req.query.stock + " BBANDS");
  var url = "https://www.alphavantage.co/query?function=BBANDS&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "BBANDS", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " BBANDS");
      }
    }
  });
});

app.get('/MACD', function (req, res) {
  console.log("get " + req.query.stock + " MACD");
  var url = "https://www.alphavantage.co/query?function=MACD&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "MACD", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " MACD");
      }
    }
  });
});

app.get('/STOCH', function (req, res) {
  console.log("get " + req.query.stock + " STOCH");
  var url = "https://www.alphavantage.co/query?function=STOCH&symbol=" +  req.query.stock + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if(body["Meta Data"] == null) res.status(400).send();
      else {
        let data = modifyIndicator(body, "STOCH", req.query.stock);
        res.send(data);
        console.log("archive " + req.query.stock + " STOCH");
      }
    }
  });
});





app.get('/news', function(req, res){
  console.log("getNews");
  var url = "https://seekingalpha.com/api/sa/combined/" + req.query.stock +".xml";
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      parser.parseString(body, function(err, resp){
        let newsNum = 0;
        let newsSet = resp["rss"]["channel"][0]["item"];
        let filteredNewsSet = [];
        for (let news in newsSet){
          if (newsNum == 5) break;
          if (newsSet[news]["link"][0][25] == 'a') {
            filteredNewsSet.push({'title' : newsSet[news]['title'][0], 'link' : newsSet[news]["link"][0], 'author' : newsSet[news]['sa:author_name'][0], 'date' : (newsSet[news]['pubDate'][0]).substring(0, (newsSet[news]['pubDate'][0]).length - 5) + "EST"});
            newsNum++;
          }
        }
        console.log("archive " + req.query.stock + " news");
        res.send(filteredNewsSet);
      });
    }
  });
});

app.get('/refresh', function(req, res){

  var stockList = JSON.parse(req.query.stock);
  console.log("refresh " + stockList);
  getRefreshs(stockList, function(response) {
    res.send(response);
    console.log("refresh " + stockList + " completed");
  });

});

app.get('/auto', function(req, res){
  console.log("get autocomplete " + req.query.value);
  var url = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=" + req.query.value;
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        res.send(body);
    }
  });
});


var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Node listening at http://%s:%s', host, port);
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});

function modifyStockData(body){
  var data = {};
  data["info"] = {};
  data["info"]['symbol'] = body["Meta Data"]["2. Symbol"];
  var newDate = moment(body["Meta Data"]["3. Last Refreshed"]).format("YYYY-MM-DD");
  data["info"]['lastPrice'] = (body["Time Series (Daily)"][newDate]['4. close'] - 0).toFixed(2);
  var num = 0;
  for (var time in body["Time Series (Daily)"]) {
    num++;
    if (num == 2) {
      var lastDate = moment(time).format("YYYY-MM-DD");
      break;
    }
  }

  var dataArray = stockDataToArray(body["Time Series (Daily)"], newDate);
  data["dates"] = dataArray["dates"];
  data["prices"] = dataArray["prices"];
  data["volumes"] = dataArray["volumes"];
  data["full"] = dataArray["full"];
  data["num"] = dataArray["num"];

  data["info"]["change"] = (body["Time Series (Daily)"][newDate]['4. close'] - body["Time Series (Daily)"][lastDate]['4. close']).toFixed(2);
  data["info"]["changePercent"] = (data["info"]["change"] / body["Time Series (Daily)"][lastDate]['4. close'] * 100).toFixed(2);

  if (moment(body["Meta Data"]["3. Last Refreshed"]).get("hour") == 0)
    var timeStamp = moment(body["Meta Data"]["3. Last Refreshed"]).set("hour", 16).format("YYYY-MM-DD HH:mm:ss [EST]");
  else
    var timeStamp = moment(body["Meta Data"]["3. Last Refreshed"]).format("YYYY-MM-DD HH:mm:ss [EST]");
  data["info"]['timeStamp'] = timeStamp;

  data["info"]['open'] = (body["Time Series (Daily)"][newDate]['1. open'] - 0).toFixed(2);
  data["info"]['close'] = (body["Time Series (Daily)"][newDate]['4. close'] - 0).toFixed(2);
  data["info"]['range'] = (body["Time Series (Daily)"][newDate]['3. low'] - 0).toFixed(2) + " - " + (body["Time Series (Daily)"][newDate]['2. high'] - 0).toFixed(2);
  data["info"]['volume'] = body["Time Series (Daily)"][newDate]['5. volume'];
  return data;
}

function stockDataToArray(body, newDate) {
  var dateSet = [];
  var priceSet = [];
  var volumeSet = [];
  var fullSet = [];
  var num = 0;
  let endDate = moment(newDate).subtract(0.5, 'years');
  for (var time in body) {
    if (endDate > new Date(time)) break;
    num++;
    dateSet.push(moment(time).format("MM/DD"));
    priceSet.push((body[time]['4. close'] - 0).toFixed(2) - 0);
    volumeSet.push(body[time]['5. volume'] - 0);
  }
  let n = 0;
  for (var time in body) {
    n++;
    fullSet.push([Date.UTC(moment(time).get('year'),moment(time).get('month'), moment(time).get('date')),(body[time]['4. close'] - 0).toFixed(2) - 0]);
    if (n == 1000) break;
  }

  return {"num" : num, "dates" : dateSet.reverse(), "prices" : priceSet.reverse(), "volumes" : volumeSet.reverse(), "full" : fullSet.reverse()};
}

function modifyIndicator(body, indicator, name) {
  var data = {};
  var newDate = moment(body["Meta Data"]["3. Last Refreshed"]).format("YYYY-MM-DD");
  let endDate = moment(newDate).subtract(0.5, 'years');

  if (indicator == 'SMA' || indicator == 'EMA' || indicator == 'RSI' || indicator == 'ADX'
    || indicator == 'CCI') {
    var values = [];
    var i = 0;
    for (var date in body["Technical Analysis: " + indicator]) {
      if (endDate > new Date(date)) break;
      i++;
      values.push(body["Technical Analysis: " + indicator][date][indicator] - 0);
    }
    data = values.reverse();
  } else if (indicator == 'STOCH') {
    var SlowD = [];
    var SlowK = [];
    var i = 0;
    for (var date in body["Technical Analysis: " + indicator]) {
      if (endDate > new Date(date)) break;
      i++;
      SlowD.push(body["Technical Analysis: " + indicator][date]['SlowD'] - 0);
      SlowK.push(body["Technical Analysis: " + indicator][date]['SlowK'] - 0);
    }
    data = {};
    data["SlowD"] = SlowD.reverse();
    data["SlowK"] = SlowK.reverse();
  } else if (indicator == 'BBANDS') {
    var RealMiddleBand = [];
    var RealLowerBand = [];
    var RealUpperBand = [];
    var i = 0;
    for (var date in body["Technical Analysis: " + indicator]) {
      if (endDate > new Date(date)) break;
      i++;
      RealMiddleBand.push(body["Technical Analysis: " + indicator][date]['Real Middle Band'] - 0);
      RealLowerBand.push(body["Technical Analysis: " + indicator][date]['Real Lower Band'] - 0);
      RealUpperBand.push(body["Technical Analysis: " + indicator][date]['Real Upper Band'] - 0);
    }
    data = {};
    data["RealMiddleBand"] = RealMiddleBand.reverse();
    data["RealLowerBand"] = RealLowerBand.reverse();
    data["RealUpperBand"] = RealUpperBand.reverse();
  } else if (indicator == 'MACD') {
    var MACD = [];
    var MACD_Signal = [];
    var MACD_Hist = [];
    var i = 0;
    for (var date in body["Technical Analysis: " + indicator]) {
      if (endDate > new Date(date)) break;
      i++;
      MACD.push(body["Technical Analysis: " + indicator][date]['MACD'] - 0);
      MACD_Signal.push(body["Technical Analysis: " + indicator][date]['MACD_Signal'] - 0);
      MACD_Hist.push(body["Technical Analysis: " + indicator][date]['MACD_Hist'] - 0);
    }
    data = {};
    data["MACD"] = MACD.reverse();
    data["MACD_Signal"] = MACD_Signal.reverse();
    data["MACD_Hist"] = MACD_Hist.reverse();
  }

  console.log("archive " + name+ " " + indicator);
  return data;
}

function getIndicator(indicator, name, num, passValue) {
  var url = "https://www.alphavantage.co/query?function=" + indicator + "&symbol=" +  name + "&interval=daily&time_period=10&series_type=open&apikey=5SP4Y7ZR1B8XUDBR";
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      return passValue(modifyIndicator(body, indicator, name, num));
    }
  });
}

function getIndicators(name, num, callback) {
  let data = {};
  var i = 0;
  for (let indicator in indicators){
    getIndicator(indicators[indicator], name, num, function(response){

      data[indicators[indicator]] = response;
      i++;
      if (i == 8) {
        return callback(data);
      }
    });

  }
}

function getRefreshs(stockList, callback) {
  let stocksData = [];
  let i = 0;
  for (let stock in stockList) {
    var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + stockList[stock] + "&apikey=5SP4Y7ZR1B8XUDBR";
    request({ url: url, json: true }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let lastPrice;
        let j = 0;
        for (let date in body["Time Series (Daily)"]) {
          j++;
          if (j == 2) {
            lastPrice = body["Time Series (Daily)"][date]["4. close"] - 0;
            break;
          }
        }
        getRefresh(stockList[stock], lastPrice, function(response){
          stocksData.push(response);
          i++;
          if (i == stockList.length) {
            return callback(stocksData);
          }
        });
      }
    });
  }
}

function getRefresh(name, lastPrice, callback) {
  let url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + name + "&interval=1min&apikey=5SP4Y7ZR1B8XUDBR";
  let info = {};
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      info["symbol"] = name;
      for (let date in body["Time Series (1min)"]) {
          info["price"] = body["Time Series (1min)"][date]["4. close"] - 0;
          info["volume"] = body["Time Series (1min)"][date]["5. volume"] - 0;
          break;
      }
      info["change"] = (info["price"] - lastPrice).toFixed(2) - 0;
      info["changePercent"] = ((info["price"] - lastPrice) / lastPrice * 100).toFixed(2) - 0;
      info["price"] = (info["price"] - 0).toFixed(2) - 0;
      return callback(info);
    }
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

module.exports = app;
