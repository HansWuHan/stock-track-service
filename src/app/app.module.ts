import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import {MatAutocompleteModule, MatInputModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { DetailComponent } from './detail/detail.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { OrderModule } from 'ngx-order-pipe';
import { FacebookModule } from 'ngx-facebook';

declare var require: any;
export function highchartsFactory() {
//return require('highcharts');
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  const ex = require('highcharts/modules/exporting');
  const st = require('highcharts/modules/stock');

  dd(hc);
  ex(hc);
  st(hc);
  return hc;
}

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    DetailComponent,
    FavoriteComponent
  ],
  imports: [
    BrowserModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    ChartModule,
    CommonModule,
    OrderModule,
    BrowserAnimationsModule,
    FacebookModule.forRoot()
  ],
  providers: [{ provide: HighchartsStatic, useFactory: highchartsFactory }],
  bootstrap: [AppComponent]
})
export class AppModule { }
