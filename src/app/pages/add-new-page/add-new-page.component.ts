import { style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-new-page',
  template: '<app-add-new-food></app-add-new-food>',
  styles : []
})
export class AddNewPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
