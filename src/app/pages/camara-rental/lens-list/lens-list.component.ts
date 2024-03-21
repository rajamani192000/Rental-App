import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'ngx-lens-list',
  templateUrl: './lens-list.component.html',
  styleUrls: ['./lens-list.component.scss']
})
export class LensListComponent implements OnInit {

  constructor(public location: Location) { }

  ngOnInit(): void {
    this.getData();
  }
getData(){

}
}
