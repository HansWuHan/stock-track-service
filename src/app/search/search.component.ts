import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],

})
export class SearchComponent{

   input : String;
  stockName : String;
   favoriteList = JSON.parse(localStorage.getItem("stockList")) === null ? [] : JSON.parse(localStorage.getItem("stockList"));

  canSubmit = false;
  errorInput;
  isSearch = false;
  constructor(private http: Http){
  }

  onSubmit() {
    if (this.input != null && this.input.trim() != ""){
      this.stockName = this.input.toUpperCase();
      this.isSearch = true;
    }
  }

  onClear() {
    this.stockName = null;
    this.input = null;
    this.canSubmit = false;
    this.errorInput = null;
    this.isSearch = false;
  }

  myControl: FormControl = new FormControl();
  filteredOptions;
  options =[];




  changePage(){
    this.isSearch = !this.isSearch;
  }

  modifyFavorite(event){
    console.log("modifyFavorite" + this.favoriteList)
    if (this.favoriteList.indexOf(event) == -1) {
      this.favoriteList.push(event);
      localStorage.setItem("stockList", JSON.stringify(this.favoriteList));
      this.favoriteList = this.favoriteList.slice();
    } else {
      this.favoriteList.splice(this.favoriteList.indexOf(event), 1);
      localStorage.setItem("stockList", JSON.stringify(this.favoriteList));
      this.favoriteList = this.favoriteList.slice();
    }
    console.log("main: " + this.favoriteList);
  }

  searchDetails(event){
    this.stockName = event;
    this.isSearch = true;
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges
    .startWith(null)
    .map(val => val ? this.filter(val) : this.options.slice());
  }

  filter(val) {
    return this.options.filter(option =>
      option['Symbol'].indexOf(val.toUpperCase()) === 0);
  }

  valuechange(inputValue) {
    if (this.input == null) return;
    if (this.input.trim() == "") {
      this.errorInput = 'has-error';
      return;
    }
    this.errorInput = null;
    this.canSubmit = true;
    this.input = inputValue.toUpperCase();
    let value = inputValue.toUpperCase();
    if (value.length == 0) {
      this.options = [];
    } else {
      this.http.get('http://Cs571hw7.us-west-1.elasticbeanstalk.com/auto?value=' + value)
      .subscribe(
        data => {
          this.options = JSON.parse(data['_body']);
          this.filteredOptions = this.myControl.valueChanges
          .startWith(null)
          .map(val => val ? this.filter(val) : this.options.slice());
        },
        err => {
          console.error(err)
        } //For Error Response
      );
    }
  }

}
