import { Component, OnInit } from '@angular/core';
import { FoodDataService } from 'src/app/shared/services/food-data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MEASURE_UNITS } from 'src/app/shared/constants';

@Component({
  selector: 'app-add-new-food',
  templateUrl: './add-new-food.component.html',
})
export class AddNewFoodComponent implements OnInit {
  formDataCopy: any = {};
  measureUnits: string[] = MEASURE_UNITS;
  formData: any = new FormGroup({
    ShortFoodName: new FormControl('', [Validators.required]),
    Translation: new FormControl('', [Validators.required]),
    Measure: new FormControl(0, [Validators.required]),
    MeasureUnit: new FormControl('gm', [Validators.required]),
    Quantity: new FormControl(1),
    Energy: new FormControl(0, [Validators.required]),
    Carbohydrate: new FormControl(0, [Validators.required]),
    Fat: new FormControl(0, [Validators.required]),
    Protein: new FormControl(0, [Validators.required]),
  });

  constructor(private FoodDataService: FoodDataService) {}
  ngOnInit(): void {}

  onSubmit() {
    if (this.formData.valid) {
      this.addNewFood(this.formData.value);
    } else {
      alert('Data not valid');
    }
  }

  // a bare reset would leave the unit empty, which is not one of the options
  resetForm() {
    this.formData.reset({
      ShortFoodName: '',
      Translation: '',
      Measure: 0,
      MeasureUnit: this.measureUnits[0],
      Quantity: 1,
      Energy: 0,
      Carbohydrate: 0,
      Fat: 0,
      Protein: 0,
    });
  }

  addNewFood(formdata: any) {
    this.FoodDataService.addNewFood(formdata).subscribe({
      next: (res) => this.resetForm(),
      error: (err) => console.log(err),
    });
  }
}
