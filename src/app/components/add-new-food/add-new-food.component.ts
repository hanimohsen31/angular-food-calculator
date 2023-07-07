import { Component, OnInit } from '@angular/core';
import { DataService } from './../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-new-food',
  templateUrl: './add-new-food.component.html',
  styles: [''],
})
export class AddNewFoodComponent implements OnInit {
  constructor(private _DataService: DataService, private _Router: Router) {}

  ngOnInit(): void {}

  formData = {
    FoodID: new Date()
      .toISOString()
      .replaceAll('-', '')
      .replaceAll(':', '')
      .replaceAll('.', '')
      .slice(11, -1),
    ShortFoodName: '',
    Translation: '',
    Measure: 0,
    MeasureUnit: 'gm',
    Quantity: 1,
    Energy: 0,
    Carbohydrate: 0,
    Fat: 0,
    Protein: 0,
    Sugars: 0,
    Equavlint: '1item/00gm',
    EquavlintMeasure: 0,
    EquavlintMeasureUnit: '1 item',
  };
  addNewFood() {
    this._DataService.addNewFood(this.formData).subscribe({
      next: (res) => this._Router.navigate(['calculator']),
      error: (err) => console.log(err),
    });
  }
}
