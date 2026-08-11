import { Component, OnInit } from '@angular/core';
import { OperationsService } from 'src/app/shared/services/operations.service';

@Component({
  selector: 'app-sum',
  templateUrl: './sum.component.html',
  styleUrls: ['./sum.component.scss'],
})
export class SumComponent implements OnInit {
  // properties
  targetObj: any = {};
  targetEnergy: number = 0;
  addedFoodList: any = [];
  sumResult: any = {};
  clearPopup: boolean = false;
  savePopup: boolean = false;
  saving: boolean = false;
  saveError: string = '';
  date = new Date();
  curruntDate: any = '';

  constructor(private OperationsService: OperationsService) {}

  ngOnInit() {
    this.getUserAddedFoodList();
    this.observeAddedFoodList();
    this.observeSumResult();
    this.observeTarget();
  }

  getUserAddedFoodList() {
    // a guest has no entry on the server, the list lives in this browser
    this.OperationsService.loadAddedFoodList();
  }

  // scaled nutrient value for the quantity typed on a row
  scale(item: any, key: string) {
    return this.OperationsService.scale(item, key);
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

  observeTarget() {
    this.OperationsService.targetEnergy$.subscribe({
      next: (res: number) => {
        this.targetEnergy = res;
      },
    });
    this.OperationsService.targetResult$.subscribe({
      next: (res: any) => {
        this.targetObj = res;
      },
    });
  }

  // handle change of the calorie target typed on the target row
  handleTargetChange() {
    this.OperationsService.handleTargetEnergyChange(this.targetEnergy);
  }

  // handle remove from food added list
  handleRemove(index: any) {
    this.OperationsService.handleRemove(index);
  }

  // the sums and the targets follow the quantity while it is being typed
  handleInput() {
    this.OperationsService.handleInput();
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

  // a guest has no entry to track days under, the day is only summed here
  get isGuest(): boolean {
    return this.OperationsService.isGuest;
  }

  // the day is stored as the totals of the table together with the targets
  // they are read against, which is what the tracking page draws
  saveData() {
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.saveError = '';
    let data = { ...this.sumResult, ...this.targetObj };
    this.OperationsService.saveUserTrackingData(data).subscribe({
      next: () => {
        this.saving = false;
        this.savePopup = false;
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Saving this day failed, try again.';
      },
    });
  }

  toggleClearPopup() {
    this.clearPopup = !this.clearPopup;
  }

  toggleSavePopup() {
    this.savePopup = !this.savePopup;
    this.saveError = '';
    let date = this.OperationsService.getNowDateString();
    this.curruntDate = this.OperationsService.dateFormater(date);
  }
}
