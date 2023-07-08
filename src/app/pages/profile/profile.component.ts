import { Component, OnInit } from '@angular/core';
import { OperationsService } from '../../services/operations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { combineLatest, forkJoin, tap, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  nutritions = this.DataService.nutritions;
  personal: any = { Weight: 0, Energy: 0 };
  isProfilePage = true;
  Weight = new BehaviorSubject(0);
  WeightAction$ = this.Weight.asObservable();
  user: any = JSON.parse(localStorage.getItem('user') || '')
  targetCalculated = {
    trgtCarb: ((this.personal.Energy * this.nutritions.carbsFactorPerDayMin) /this.nutritions.CarbCalGM).toFixed(),
    trgtFat:((this.personal.Energy * this.nutritions.fatsFactorPerDayMin) /this.nutritions.fatCalGM).toFixed(),
    trgtPro: ((this.personal.Energy * this.nutritions.proteinFactorPerDayAvr) /this.nutritions.proteinCalGM).toFixed(),
  }

  constructor(
    private OperationsService: OperationsService,
    private Router: Router,
    private DataService: DataService,
    private ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.OperationsService.getTargetEnergy().subscribe((res) => {
      if (res) {
        this.personal = res;
        this.personal.Energy =
          370 + 21.6 * this.personal.Weight * this.nutritions.ActicityFactorAvr;
        this.Weight.next(res?.Weight);
        this.targetCalculated = {
          trgtCarb: ((this.personal.Energy * this.nutritions.carbsFactorPerDayMin) /this.nutritions.CarbCalGM).toFixed(),
          trgtFat:((this.personal.Energy * this.nutritions.fatsFactorPerDayMin) /this.nutritions.fatCalGM).toFixed(),
          trgtPro: ((this.personal.Energy * this.nutritions.proteinFactorPerDayAvr) /this.nutritions.proteinCalGM).toFixed(),
        }
      }
    });

    this.ActivatedRoute.snapshot.url[0].path != 'profile'
      ? (this.isProfilePage = false)
      : true;
  }

  changePersonal() {
    this.personal.Energy =
      370 + 21.6 * this.personal.Weight * this.nutritions.ActicityFactorAvr;
    // console.log(this.personal);
    this.OperationsService.changeTargetEnergy(this.personal).subscribe(
      (res) => {
        this.OperationsService.changeTargetEnergy(this.personal);
        this.Weight.next(this.personal.Weight);
        this.targetCalculated = {
          trgtCarb: ((this.personal.Energy * this.nutritions.carbsFactorPerDayMin) /this.nutritions.CarbCalGM).toFixed(),
          trgtFat:((this.personal.Energy * this.nutritions.fatsFactorPerDayMin) /this.nutritions.fatCalGM).toFixed(),
          trgtPro: ((this.personal.Energy * this.nutritions.proteinFactorPerDayAvr) /this.nutritions.proteinCalGM).toFixed(),
        }
      }
    );
  }
}