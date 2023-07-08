import { Component, OnInit } from '@angular/core';
import { map, combineLatest } from 'rxjs';
import { OperationsService } from './../../services/operations.service';
import { DataService } from './../../services/data.service';

@Component({
  selector: 'app-sum',
  templateUrl: './sum.component.html',
  styleUrls: ['./sum.component.scss'],
})
export class SumComponent implements OnInit {
  // properties
  trgtEnr: any = 0;
  displayDetails = false;
  date = new Date();
  nutritions = this.DataService.nutritions;
  finsObj: any = {};
  targetObj: any = {};

  constructor(
    private OperationsService: OperationsService,
    private DataService: DataService
  ) {}

  ngOnInit(): void {}

  sumArray$ = this.OperationsService.sumArrayAction$.pipe(
    map((response: any) => response.map((elm: any) => elm))
  );

  finalSumObject$ = this.OperationsService.finalSumAction$.pipe(
    map((response: any) => response.map((elm: any) => elm))
  );

  percentageObjJoin$ = combineLatest([
    this.finalSumObject$,
    this.OperationsService.getTargetEnergy(),
  ]).subscribe({
    next: (res) => {
      res[1]?.Energy
        ? this.updatePercentageObj(res[0][0], res[1]?.Energy)
        : this.updatePercentageObj(res[0][0], 2000)
    },
    error: (err) => console.log('error in personal: ', err),
  });

  updatePercentageObj(finsObj: any, trgtEnr: any) {
    let obj = {
      enrgTrg: +trgtEnr.toFixed(),
      enrgPer: ((+finsObj.Energy * 100) / +trgtEnr).toFixed(),
      fatTarg: (
        (+trgtEnr * this.nutritions.fatsFactorPerDayMin) /
        this.nutritions.fatCalGM
      ).toFixed(),
      fatPerc: (
        (finsObj.Fat * this.nutritions.fatCalGM * 100) /
        (+trgtEnr * this.nutritions.fatsFactorPerDayMin)
      ).toFixed(),
      carbTarg: (
        (+trgtEnr * this.nutritions.carbsFactorPerDayMin) /
        this.nutritions.CarbCalGM
      ).toFixed(),
      carbPer: (
        (finsObj.Carbohydrate * this.nutritions.CarbCalGM * 100) /
        (+trgtEnr * this.nutritions.carbsFactorPerDayMin)
      ).toFixed(),
      proTrg: (
        (+trgtEnr * this.nutritions.proteinFactorPerDayAvr) /
        this.nutritions.proteinCalGM
      ).toFixed(),
      proPer: (
        (finsObj.Protein * this.nutritions.proteinCalGM * 100) /
        (+trgtEnr * this.nutritions.proteinFactorPerDayAvr)
      ).toFixed(),
    };
    this.targetObj = obj;
    // console.log('obj: ', obj);
  }

  // handle remove
  handleRemove(index: any) {
    this.OperationsService.handleRemove(index);
  }

  // handle change
  handleChange() {
    this.OperationsService.handleChange();
  }

  // handle clear
  handleClear() {
    this.OperationsService.handleClear();
  }

  toggleDetails() {
    this.displayDetails = !this.displayDetails;
  }
}
