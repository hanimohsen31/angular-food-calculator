import { Component, OnInit } from '@angular/core';
import { OperationsService } from '../../services/operations.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { combineLatest, forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  nutritions = this.DataService.nutritions;
  personal: any = { Weight: 0, Energy: 0 };

  constructor(
    private OperationsService: OperationsService,
    private Router: Router,
    private DataService: DataService
  ) {}

  ngOnInit(): void {
    this.OperationsService.getTargetEnergy().subscribe((res) => {
      if (res) {
        this.personal = res;
        this.personal.Energy =
          370 + 21.6 * this.personal.Weight * this.nutritions.ActicityFactorAvr;
      }
    });
  }

  changePersonal() {
    this.personal.Energy =
      370 + 21.6 * this.personal.Weight * this.nutritions.ActicityFactorAvr;
    console.log(this.personal);
    this.OperationsService.changeTargetEnergy(this.personal).subscribe(
      (res) => {
        this.OperationsService.changeTargetEnergy(this.personal);
        this.Router.navigate(['calculator']);
      }
    );
  }
}
