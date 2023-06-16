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
    FoodID: new Date().toISOString().replaceAll("-","").replaceAll(":","").replaceAll(".","").slice(11,-1),
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
    // ------------
    // Water: 0,
    // DietaryFibre: 0,
    // Cholesterol: 0,
    // Sodium: 0,
    // Iodine: 0,
    // Potassium: 0,
    // Phosphorus: 0,
    // Calcium: 0,
    // Iron: 0,
    // Zinc: 0,
    // VitaminA: 0,
    // VitaminB6: 0,
    // VitaminB12: 0,
    // VitaminC: 0,
    // VitaminD: 0,
    // VitaminE: 0,
  };
  addNewFood() {
    this._DataService.addNewFood(this.formData).subscribe({
      next: (res) => this._Router.navigate(['calculator']),
      error: (err) => console.log(err),
    });
  }
}
