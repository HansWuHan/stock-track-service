import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  animations: [
    trigger('flyIn', [
      state('show', style({transform: 'translateX(0)'})),
      state('hide', style({transform: 'translateX(0)'})),
      transition('hide => show', [
        style({transform: 'translateX(100%)'}),
        animate(500)
      ])
    ])
  ]
})
export class FavoriteComponent implements OnChanges{

  @Input() favoriteList : Array<string>;
  @Input() isSearch;
  @Input() loadStock;
  @Output() event= new EventEmitter();
  @Output() forward= new EventEmitter();
  @Output() searchDetails= new EventEmitter();
  localFavoriteList;
  selectedValue = "Default";
  isDescending = "false";
  isAuto = false;
  likedStocks = [];
  state = "hide";
  timer;

  constructor(private http: Http) {
  }



  ngOnChanges(changes: any){
    this.state = this.isSearch ? 'hide' : 'show';
    console.log("table " + this.likedStocks);
    if (this.favoriteList.length == 0) {
      this.likedStocks = [];
    }
    if (this.localFavoriteList != this.favoriteList) {
      this.localFavoriteList = this.favoriteList;
      this.refresh();
    }

  }

  ngOnInit(){
    this.localFavoriteList = this.favoriteList;
  }
  render(){
    $('#refresh-toggle').bootstrapToggle();
    $('#refresh-toggle').change(
      () => {
        if ($('#refresh-toggle').prop('checked') == this.isAuto) return;
        this.isAuto = $('#refresh-toggle').prop('checked');
        this.setTimer(this.isAuto);
      }
    )
  }

  setTimer(auto){
    if (auto == false) {
      clearInterval(this.timer);
      return;
    }
    this.timer = setInterval(()=>{

      this.refresh();
    },5000)
  }

  refresh(){
    console.log("refresh");
    this.http.get('http://cs571hw7.us-west-1.elasticbeanstalk.com/refresh?stock=' + JSON.stringify(this.favoriteList))
    .subscribe(
      data => {
        this.likedStocks = JSON.parse(data['_body']);
        console.log(this.likedStocks);
      },
      err => {
        console.error(err)
      } //For Error Response
    );
  }

  search(name){
    this.searchDetails.emit(name);
  }
  goForward(){
    this.forward.emit();
  }

  removeFromList(name) {
    delete this.likedStocks[name];
    console.log("remove " + name);
    this.event.emit(name);
  }

  numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
    return x;
  }

}
