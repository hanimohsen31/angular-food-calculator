import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { OperationsService } from '../../services/operations.service';

@Component({
  standalone: false,
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss'],
})
export class TargetComponent implements OnInit {
  // what the numbers were last worked out from is held by the service, which
  // keeps it in this browser and, for a signed in user, on their entry too, so
  // the page opens on the same body on every device instead of on an empty form
  // how much of the resting burn a day of living adds on top of it
  activities: any[] = [
    { label: 'Sedentary, little or no exercise', value: 1.2 },
    { label: 'Light, exercise one to three days a week', value: 1.375 },
    { label: 'Moderate, exercise three to five days a week', value: 1.55 },
    { label: 'Active, exercise six to seven days a week', value: 1.725 },
    { label: 'Very active, hard exercise or a physical job', value: 1.9 },
  ];

  // half a kg of body weight is around 3500 calories, so 500 a day is half a kg
  // a week either way. a goal aimed at what the weight is made of carries its
  // own macro split too, protein is what muscle is kept and built on
  goals: any[] = [
    { id: 'lose500', label: 'Lose half a kg a week', offset: -500, split: null },
    { id: 'lose250', label: 'Lose a quarter kg a week', offset: -250, split: null },
    { id: 'keep', label: 'Keep the weight', offset: 0, split: null },
    { id: 'gain250', label: 'Gain a quarter kg a week', offset: 250, split: null },
    { id: 'gain500', label: 'Gain half a kg a week', offset: 500, split: null },
    {
      id: 'loseFat',
      label: 'Lose fat, keep the muscle',
      offset: -400,
      split: { Fat: 0.25, Carbohydrate: 0.35, Protein: 0.4 },
    },
    {
      id: 'gainMuscle',
      label: 'Gain muscle',
      offset: 300,
      split: { Fat: 0.25, Carbohydrate: 0.45, Protein: 0.3 },
    },
    {
      id: 'recomp',
      label: 'Lose fat and gain muscle',
      offset: -150,
      split: { Fat: 0.25, Carbohydrate: 0.35, Protein: 0.4 },
    },
  ];

  // what the equation is worth answering for, anything outside of it is a typo
  // rather than a body
  limits: any = {
    Age: { min: 6, max: 120, label: 'Age', unit: 'years' },
    Weight: { min: 20, max: 500, label: 'Weight', unit: 'kg' },
    Height: { min: 50, max: 300, label: 'Height', unit: 'cm' },
  };

  bmr: number = 0;
  maintenance: number = 0;
  target: number = 0;
  applied: boolean = false;

  formData: any = new FormGroup({
    Gender: new FormControl('male'),
    Age: new FormControl(30),
    Weight: new FormControl(70),
    Height: new FormControl(170),
    Activity: new FormControl(1.375),
    Goal: new FormControl('keep'),
  });

  constructor(private OperationsService: OperationsService) {}

  ngOnInit(): void {
    // the body is followed rather than read once, a sign in on an open page
    // brings one down and the form is filled with it as it lands
    this.OperationsService.targetProfile$.subscribe({
      next: (profile: any) => this.restore(profile),
    });
    this.formData.valueChanges.subscribe(() => {
      // a changed number is a different day to plan, the old one is no longer
      // the one sitting on the calculator
      this.applied = false;
      this.calculate();
      this.store();
    });
  }

  // ------------------------------ the numbers ------------------------------
  isOutOfRange(key: string): boolean {
    let limit = this.limits[key];
    let number = +this.formData.value[key] || 0;
    return number < limit.min || number > limit.max;
  }

  // the first field that was typed out of its range, as a line to read
  get rangeError(): string {
    for (let key of ['Age', 'Weight', 'Height']) {
      if (this.isOutOfRange(key)) {
        let limit = this.limits[key];
        return `${limit.label} has to be between ${limit.min} and ${limit.max} ${limit.unit}`;
      }
    }
    return '';
  }

  // Mifflin St Jeor, the resting burn of a body of this size and age
  calculate() {
    let value = this.formData.value;
    let weight = +value.Weight || 0;
    let height = +value.Height || 0;
    let age = +value.Age || 0;
    if (this.rangeError) {
      this.bmr = 0;
      this.maintenance = 0;
      this.target = 0;
      return;
    }
    let base = 10 * weight + 6.25 * height - 5 * age;
    this.bmr = Math.round(base + (value.Gender === 'female' ? -161 : 5));
    this.maintenance = Math.round(this.bmr * (+value.Activity || 1));
    // a deficit is never taken below the resting burn, eating under that is not
    // something this page should hand out
    this.target = Math.max(
      this.bmr,
      Math.round(this.maintenance + (+this.selectedGoal.offset || 0))
    );
  }

  get selectedGoal(): any {
    let id = this.formData.value.Goal;
    return this.goals.find((goal: any) => goal.id === id) || this.goals[2];
  }

  // a goal that says what the weight should be made of brings its own split,
  // the rest of them eat on the even one
  get activeSplit(): any {
    return this.selectedGoal.split || this.OperationsService.defaultMacroSplit;
  }

  // what the target calories allow of every macro, drawn from the same split
  // the calculator reads its own targets against
  get macros(): any[] {
    let split = this.activeSplit;
    let perGram = this.OperationsService.caloriesPerGram;
    return [
      { label: 'Fats', key: 'Fat' },
      { label: 'Carbs', key: 'Carbohydrate' },
      { label: 'Protein', key: 'Protein' },
    ].map((macro: any) => ({
      label: macro.label,
      percent: Math.round(split[macro.key] * 100),
      calories: Math.round(this.target * split[macro.key]),
      grams: Math.round((this.target * split[macro.key]) / perGram[macro.key]),
    }));
  }

  // the deficit or the surplus the goal asks for, as a plain number to read
  get goalOffset(): number {
    return this.target - this.maintenance;
  }

  get currentTarget(): number {
    return this.OperationsService.targetEnergy.getValue();
  }

  // ------------------------------ actions ------------------------------
  // the top of the range is held while the number is being typed, a number only
  // grows as digits are added to it so there is nothing to get in the way of
  capField(key: string) {
    let limit = this.limits[key];
    let number = +this.formData.value[key] || 0;
    if (number > limit.max) {
      this.formData.patchValue({ [key]: limit.max });
    }
  }

  // the bottom of it waits for the field to be left. 7 on the way to 70 is under
  // every minimum there is, pulling it up mid word would fight the typing
  clampField(key: string) {
    let limit = this.limits[key];
    let number = +this.formData.value[key] || 0;
    let clamped = Math.round(Math.min(Math.max(number, limit.min), limit.max));
    if (clamped !== number) {
      this.formData.patchValue({ [key]: clamped });
    }
  }

  // the calculator reads its target and its split from here, so this is the
  // same setting the target row of the table types into
  applyTarget() {
    if (this.target <= 0) {
      return;
    }
    this.OperationsService.handleTargetEnergyChange(this.target);
    this.OperationsService.handleMacroSplitChange({ ...this.activeSplit });
    this.applied = true;
  }

  reset() {
    this.formData.reset({
      Gender: 'male',
      Age: 30,
      Weight: 70,
      Height: 170,
      Activity: 1.375,
      Goal: 'keep',
    });
  }

  // ------------------------------ storage ------------------------------
  restore(profile: any) {
    if (!profile) {
      this.calculate();
      return;
    }
    let value = { ...profile };
    // a goal was kept as a number of calories before the body goals existed
    let known = this.goals.some((goal: any) => goal.id === value?.Goal);
    value.Goal = known ? value.Goal : 'keep';
    // what is typed is stored, and what is stored comes back around here. the
    // form is already on it, and taking it through the clamps again would pull
    // a 7 on its way to 70 up to a minimum while the number is still being typed
    if (this.sameAsForm(value)) {
      this.calculate();
      return;
    }
    this.formData.patchValue(value, { emitEvent: false });
    // a body that came from somewhere else is a different one to plan for, what
    // is on the calculator was worked out from the body that was here before
    this.applied = false;
    // a range can tighten between visits, what was stored is held to the one
    // in force now
    ['Age', 'Weight', 'Height'].map((key: string) => this.clampField(key));
    this.calculate();
  }

  // the body that came round is the one the form is already showing
  sameAsForm(value: any): boolean {
    let current = this.formData.value;
    return Object.keys(current).every(
      (key: string) => String(current[key]) === String(value?.[key])
    );
  }

  store() {
    this.OperationsService.handleTargetProfileChange(this.formData.value);
  }
}
