import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-new-food',
  templateUrl: './add-new-food.component.html',
})
export class AddNewFoodComponent implements OnInit {
  formDataCopy: any = {};
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

  constructor(private DataService: DataService) {}
  ngOnInit(): void {}

  onSubmit() {
    if (this.formData.valid) {
      console.log(this.formData.value);
      this.addNewFood(this.formData.value);
    } else {
      alert('Data not valid');
    }
  }

  resetForm() {
    this.formData.reset();
  }

  addNewFood(formdata: any) {
    this.DataService.addNewFood(formdata).subscribe({
      next: (res) => {
        this.resetForm();
      },
      error: (err) => console.log(err),
    });
  }
}
