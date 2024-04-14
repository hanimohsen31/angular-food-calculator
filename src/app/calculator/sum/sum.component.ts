import { Component, OnInit } from '@angular/core';
import { OperationsService } from 'src/app/shared/services/operations.service';
import { FoodDataService } from 'src/app/shared/services/food-data.service';

@Component({
  selector: 'app-sum',
  templateUrl: './sum.component.html',
  styleUrls: ['./sum.component.scss'],
})
export class SumComponent implements OnInit {
  // properties
  targetObj: any = {};
  addedFoodList: any = [];
  sumResult: any = {};
  clearPopup: boolean = false;
  savePopup: boolean = false;
  date = new Date();
  curruntDate: any = '';

  constructor(
    private FoodDataService: FoodDataService,
    private OperationsService: OperationsService
  ) {}

  ngOnInit() {
    this.getUserAddedFoodList();
    this.observeAddedFoodList();
    this.observeSumResult();
  }

  getUserAddedFoodList() {
    this.FoodDataService.getUserAddedFoodList().subscribe({
      next: (res: any) =>
        res
          ? (this.OperationsService.addedFoodList.next(res),
            this.OperationsService.calculateSumResult())
          : this.OperationsService.addedFoodList.next([]),
    });
  }

  observeAddedFoodList() {
    this.OperationsService.addedFoodList$.subscribe({
      next: (res: any) => {
        this.addedFoodList = res;
      },
    });
  }

  observeSumResult() {
    this.OperationsService.sumResult$.subscribe({
      next: (res: any) => {
        this.sumResult = res;
      },
    });
  }

  // handle remove from food added list
  handleRemove(index: any) {
    this.OperationsService.handleRemove(index);
  }

  // handle change food added list
  handleChange() {
    this.OperationsService.handleChange();
  }

  // handle clear food added list
  handleClear() {
    this.clearPopup = !this.clearPopup;
    this.OperationsService.handleClear();
  }

  saveData() {}

  toggleClearPopup() {
    this.clearPopup = !this.clearPopup;
  }

  toggleSavePopup() {
    this.savePopup = !this.savePopup;
    let date = this.OperationsService.getNowDateString();
    this.curruntDate = this.OperationsService.dateFormater(date);
  }
}
