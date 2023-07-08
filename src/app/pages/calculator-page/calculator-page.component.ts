import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calculator-page',
  template: '<app-profile></app-profile><app-food-table></app-food-table><app-sum></app-sum>',
  styles: [],
})
export class CalculatorPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
