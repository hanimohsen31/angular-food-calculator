import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-calculator',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class CalculatorComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
