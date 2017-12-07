import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { FacebookService, LoginResponse, UIParams, UIResponse, InitParams } from 'ngx-facebook';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

declare var $: any;
@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  animations: [
    trigger('flyIn', [
      state('show', style({transform: 'translateX(0)'})),
      state('hide', style({transform: 'translateX(0)'})),
      transition('hide => show', [
        style({transform: 'translateX(-100%)'}),
        animate(500)
      ]),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(500)
      ])
    ])
  ]
})
export class DetailComponent implements OnChanges {




  @Input() input : String;
  @Input() favoriteList;
  @Input() isSearch;
  @Output() event= new EventEmitter();
  @Output() back = new EventEmitter();

  stockData = {};
  stockName : String;
  tabs = {"price" : 'active', "SMA":"", "EMA":"", "STOCH": "", "RSI":"", "ADX":"", "CCI":"", "BBANDS":"", "MACD":""};
  activeTab = "price";
  isReceived = {"price" : false, "SMA": false, "EMA":false, "STOCH": false, "RSI":false, "ADX":false, "CCI":false, "BBANDS":false, "MACD":false};
  hasError = {"price" : false, "SMA": false, "EMA":false, "STOCH": false, "RSI":false, "ADX":false, "CCI":false, "BBANDS":false, "MACD":false};

  isPrice = true;
  navs = {"current" : 'active', 'history' : "", 'news' : ""};
  isLoaded = false;
  isNewsLoaded = false;
  isError = false;
  isLiked = false;
  isUp = true;
  isCurrent = true;
  isHistory = false;
  isNews = false;

  img = "";
  chart = {};
  indicatorChart = {};
  history = {};
  news = [];
  state = "hide";


  constructor(private http: Http, private FB: FacebookService) {
    let initParams: InitParams = {
      appId: '1455523854516058',
      xfbml: true,
      version: 'v2.10'
    };

    FB.init(initParams);
  }

  like(){
    this.isLiked = !this.isLiked;
    this.event.emit(this.stockName);
  }

  goBack(){
    this.back.emit();
  }


  share(){
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let exportUrl = 'http://export.highcharts.com/';

    let chartOptions;
    if (this.isCurrent && this.isPrice) {
      chartOptions = JSON.stringify(this.chart);
    } else if (this.isCurrent && !this.isPrice) {
      chartOptions = JSON.stringify(this.indicatorChart);
    } else {
      chartOptions = JSON.stringify(this.history);
    }

    let dataString = {
      'async' : true,
      'type' : 'jpeg',
      'width' : 400,
      'options' : chartOptions
    }
    this.http.post(exportUrl, dataString, {
      headers: headers
    }).subscribe(
      (data) => {
          this.FB.ui({
            app_id:	'1455523854516058',
            method:	'feed',
            picture: exportUrl + data['_body']
          })
          .then((res: UIResponse) => {
            alert("Posted Successfully");
          })
          .catch((error: any) => alert("Not Posted"))
          ;
      }
    );
  }


  ngOnChanges(){
    if (this.favoriteList.indexOf(this.stockName) != -1) {
      this.isLiked = true;
    } else {
      this.isLiked = false;
    }

    if (this.input == null) {
      this.isLoaded = false;
      this.isNewsLoaded = false;
      this.isLiked = false;
      this.isError = false;
      for (let indicator in this.isReceived) {
        this.isReceived[indicator] = false;
      }
    }else if (this.input != null && this.stockName != this.input){
      this.stockName = this.input;
      this.search();
    }
  }

  search() {
    this.isLoaded = false;
    this.isNewsLoaded = false;
    this.isLiked = false;
    this.isError = false;
    this.stockData = {};
    this.news = [];
    this.tabs = {"price" : 'active', "SMA":"", "EMA":"", "STOCH": "", "RSI":"", "ADX":"", "CCI":"", "BBANDS":"", "MACD":""};
    this.activeTab = "price";
    this.navs = {"current" : 'active', 'history' : "", 'news' : ""};
    this.isCurrent = true;
    this.isHistory = false;
    this.isNews = false;
    for (let indicator in this.isReceived) {
      this.isReceived[indicator] = false;
      this.hasError[indicator] = false;
    }
    this.stockData["indicators"] = {};
    this.http.get('http://cs571hw7.us-west-1.elasticbeanstalk.com/price?stock=' + this.stockName)
    .subscribe(
      data => {
        if (this.favoriteList.indexOf(this.stockName) != -1) {
          this.isLiked = true;
        } else {
          this.isLiked = false;
        }
        this.stockData["price"] = JSON.parse(data['_body']);
        this.isUp = (this.stockData["price"]["info"]["change"] > 0);
        this.img = this.isUp ? "http://cs-server.usc.edu:45678/hw/hw6/images/Green_Arrow_Up.png" : "http://cs-server.usc.edu:45678/hw/hw6/images/Red_Arrow_Down.png";
        this.drawChart();
        this.historyChart();
        this.changeChart(this.activeTab);
        this.isReceived["price"] = true;
        this.isLoaded = true;
      },
      err => {
        this.isError = true;
        this.hasError['price'] = true;
        console.error(err)
      } //For Error Response
    );

    for (let name in this.isReceived) {
      this.http.get('http://cs571hw7.us-west-1.elasticbeanstalk.com/' + name + '?stock=' + this.stockName)
      .subscribe(
        data => {
          this.stockData["indicators"][name] = JSON.parse(data['_body']);
          this.isReceived[name] = true;
          this.changeChart(this.activeTab);
        },
        err => {
          this.hasError[name] = true;
          console.error(err)
        } //For Error Response
      );
    }

    this.http.get('http://cs571hw7.us-west-1.elasticbeanstalk.com/news?stock=' + this.stockName)
    .subscribe(
      data => {
        this.isNewsLoaded = true;
        this.news = JSON.parse(data['_body']);
      },
      err => {
        console.error(err)
      } //For Error Response
    );
  }


  drawChart() {
    this.chart = {
      chart: {
        type: 'area',
        zoomType: 'x'
      },
      title: {
        text: this.stockData["price"]["info"]["symbol"] + " Stock Price and Volume"
      },
      subtitle: {
        useHTML: true,
        text: '<a href=" https://www.alphavantage.co/" style="color:blue;"  target="_blank">Source: Alpha Vantage </a>'
      },
      xAxis: {
        categories: this.stockData["price"]["dates"],
        tickInterval: 5,
        labels: {
          style: {
            fontSize:'8px'
          }
        }
      },
      yAxis: [{
        min : 0,
        title: {
          text: 'Stock Price'
        }
      }, {
        title: {
          text: 'Volume',
        },
        labels: {
          formatter: function () {
            return Math.round(this.value / 1000000) + 'M';
          }
        },
        opposite: true
      }],

      tooltip: {
        valueDecimals: 2,
      },

      plotOptions: {
        area: {
          marker: {
            enabled: false,
          },

          threshold: null
        }
      },
      series: [{
        name: "price",
        data: this.stockData["price"]["prices"],
      }, {
        name: 'Volume',
        type: 'column',
        yAxis: 1,
        data: this.stockData["price"]["volumes"],
        color: 'rgb(255, 0, 0)'
      }]
    };
  }

  changeChart(name) {
    if(this.activeTab == name) return;

    for (var tab in this.tabs) {
      this.tabs[tab] = "";
    }
    this.tabs[name] = "active";
    this.activeTab = name;
    if (name == "price") {
      this.isPrice = true;
      return;
    }

    this.isPrice = false;
    this.isNews = false;
    if (!this.isReceived[this.activeTab] || !this.isLoaded) return;
    this.indicatorChart = {};
    var title = "";
    switch (name) {
      case "SMA" :
        title = "Simple Moving Average (SMA)";
        break;
      case "EMA" :
        title = "Exponetial Moving Average (EMA)";
        break;
      case "STOCH" :
        title = "Stochastic Oscillator (STOCH)";
        break;
      case "RSI" :
        title = "Relative Strength Index (RSI)";
        break;
      case "ADX" :
        title = "Average Directional movement indeX (ADX)";
        break;
      case "CCI" :
        title = "Commodity Channel Index (CCI)";
        break;
      case "BBANDS" :
        title = "Bolliger Bands (BBANDS)";
        break;
      case "MACD" :
        title = "Moving Average Convergence/Divergence (MACD)";
    };

    if (name == 'SMA' || name == 'EMA' || name == 'RSI' || name == 'ADX'
      || name == 'CCI') {
      this.indicatorChart = {
        chart: {
          type: 'line',
          zoomType: 'x'
        },
        title: {
          text: title
        },
        subtitle: {
          useHTML: true,
          text: '<a href=" https://www.alphavantage.co/" style="color:blue;"  target="_blank">Source: Alpha Vantage </a>'
        },
        xAxis: {
          categories: this.stockData["price"]["dates"],
          tickInterval: 5,
          labels: {
            style: {
              fontSize:'8px'
            }
          }
        },
        yAxis: {
          title: {
            text: name
          }
        },
        series: [{
          name: this.stockName + " " + name,
          data: this.stockData["indicators"][name]
        }]
      };
    } else if (name == "STOCH") {
      this.indicatorChart = {
        chart: {
          type: 'line',
          zoomType: 'x'
        },
        title: {
          text: title
        },
        subtitle: {
          useHTML: true,
          text: '<a href=" https://www.alphavantage.co/" style="color:blue;"  target="_blank">Source: Alpha Vantage </a>'
        },
        xAxis: {
          categories: this.stockData["price"]["dates"],
          tickInterval: 5,
          labels: {
            style: {
              fontSize:'8px'
            }
          }
        },
        yAxis: {
          title: {
            text: name
          }
        },
        series: [{
          name: this.stockName +" SlowK",
          data: this.stockData["indicators"][name]['SlowK']
        }, {
          name: this.stockName + " SlowD",
          data: this.stockData["indicators"][name]['SlowD']
        }]
      };
    } else if (name == "BBANDS"){
      this.indicatorChart = {
        chart: {
          type: 'line',
          zoomType: 'x'
        },
        title: {
          text: title
        },
        subtitle: {
          useHTML: true,
          text: '<a href=" https://www.alphavantage.co/" style="color:blue;"  target="_blank">Source: Alpha Vantage </a>'
        },
        xAxis: {
          categories: this.stockData["price"]["dates"],
          tickInterval: 5,
          labels: {
            style: {
              fontSize:'8px'
            }
          }
        },
        yAxis: {
          title: {
            text: name
          }
        },
        series: [{
          name: this.stockName +" RealMiddleBand",
          data: this.stockData["indicators"][name]['RealMiddleBand']
        }, {
          name: this.stockName + " RealLowerBand",
          data: this.stockData["indicators"][name]['RealLowerBand']
        }, {
          name: this.stockName + " RealUpperBand",
          data: this.stockData["indicators"][name]['RealUpperBand']
        }]
      };
    } else if (name == "MACD") {
      this.indicatorChart = {
        chart: {
          type: 'line',
          zoomType: 'x'
        },
        title: {
          text: title
        },
        subtitle: {
          useHTML: true,
          text: '<a href=" https://www.alphavantage.co/" style="color:blue;"  target="_blank">Source: Alpha Vantage </a>'
        },
        xAxis: {
          categories: this.stockData["price"]["dates"],
          tickInterval: 5,
          labels: {
            style: {
              fontSize:'8px'
            }
          }
        },
        yAxis: {
          title: {
            text: name
          }
        },
        series: [{
          name: this.stockName +" MACD",
          data: this.stockData["indicators"][name]['MACD']
        }, {
          name: this.stockName + " MACD_Signal",
          data: this.stockData["indicators"][name]['MACD_Signal']
        }, {
          name: this.stockName + " MACD_Hist",
          data: this.stockData["indicators"][name]['MACD_Hist']
        }]
      };
    }
  }


  drawCurrent() {
    for (var nav in this.navs) {
      this.navs[nav] = "";
      this.navs["current"] = "active";
    }
    this.isCurrent = true;
    this.isNews = false;
    this.isHistory = false;
  }

  drawHistory() {
    for (var nav in this.navs) {
      this.navs[nav] = "";
      this.navs["history"] = "active";
    }
    this.isCurrent = false;
    this.isNews = false;
    this.isHistory = true;
    if (this.stockData["price"] == null) return;
    this.historyChart();
  }

  historyChart(){
    this.history = {
      chart: {
        type: 'area',
        zoomType: 'x'
      },
      title: {
        text: this.stockData["price"]["info"]["symbol"] + " Stock Price and Volume"
      },
      subtitle: {
        useHTML: true,
        text: '<a href=" https://www.alphavantage.co/" style="color:blue;"  target="_blank">Source: Alpha Vantage </a>'
      },
      rangeSelector: {

        buttons: [{
          type: 'week',
          count: 1,
          text: '1w'
        }, {
          type: 'month',
          count: 1,
          text: '1m'
        },{
          type: 'month',
          count: 3,
          text: '3m'
        }, {
          type: 'month',
          count: 6,
          text: '6m'
        }, {
          type: 'ytd',
          count: 1,
          text: 'YTD'
        },{
          type: 'year',
          count: 1,
          text: '1y'
        }, {
          type: 'all',
          text: 'All'
        }],
        selected: 0
      },
      xAxis: {
        tickInterval: 5,
        labels: {
          style: {
            fontSize:'8px'
          }
        },
        crosshairs: false
      },
      yAxis: [{
        min : 0,
        title: {
          text: 'Stock Value'
        },
        opposite: true
      }],
      tooltip: {
        shared: true,
        split: false,
        xDateFormat: '%A, %b %e, %Y',
        valueDecimals: 2,
        crosshairs: false
      },
      plotOptions: {
        area: {
          marker: {
            enabled: false,
          },

          threshold: null
        }
      },
      series: [{
        name: this.stockName,
        data: this.stockData["price"]["full"],
      }]
    };
  }

  drawNews(){
    for (var nav in this.navs) {
      this.navs[nav] = "";
      this.navs["news"] = "active";
    }
    this.isCurrent = false;
    this.isNews = true;
    this.isHistory = false;
  }

  numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
    return x;
  }
}
