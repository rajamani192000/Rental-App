import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'ngx-cam-home',
  templateUrl: './cam-home.component.html',
  styleUrls: ['./cam-home.component.scss']
})
export class CamHomeComponent implements OnInit {

  constructor(public location: Location) { }
  ngOnInit(): void {

    this.getdata();
  }

getdata(){

}
}
