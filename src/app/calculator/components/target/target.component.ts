import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { OperationsService } from '../../services/operations.service';
import {
  CALORIES_PER_GRAM,
  FAT_PER_KG,
  MacroPlan,
  PROTEIN_PER_KG,
  macroTargets,
  macroTargetsFromSplit,
} from '../../services/macro-calculator';

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

  // the equations the resting burn can be read off. the first two work off the
  // whole body, the last two off what is left of it once the fat is taken out,
  // which is closer for a body that is known to be lean or to carry a lot
  formulas: any[] = [
    {
      id: 'mifflin',
      label: 'Mifflin St Jeor',
      note: 'The usual one, and the closest for most bodies.',
      needsBodyFat: false,
    },
    {
      id: 'harris',
      label: 'Harris Benedict, revised',
      note: 'The older equation, it tends to read a little higher.',
      needsBodyFat: false,
    },
    {
      id: 'katch',
      label: 'Katch McArdle',
      note: 'Works off lean mass, so it needs a body fat percentage.',
      needsBodyFat: true,
    },
    {
      id: 'cunningham',
      label: 'Cunningham',
      note: 'Lean mass again, aimed at a trained body. It reads highest.',
      needsBodyFat: true,
    },
  ];

  // how much of the resting burn a day of living adds on top of it
  activities: any[] = [
    { label: 'Sedentary, little or no exercise', value: 1.2 },
    { label: 'Light, exercise one to three days a week', value: 1.375 },
    { label: 'Moderate, exercise three to five days a week', value: 1.55 },
    { label: 'Active, exercise six to seven days a week', value: 1.725 },
    { label: 'Very active, hard exercise or a physical job', value: 1.9 },
    { label: 'Athlete, training twice a day', value: 2.1 },
    { label: 'A multiplier of my own', value: 0 },
  ];

  // half a kg of body weight is around 3500 calories, so 500 a day is half a kg
  // a week either way. the percentage goals move with the body instead of with
  // a flat number, a fifth off a small day is a much gentler cut than 500
  // calories is.
  //
  // every goal also says how much protein and fat the body it is planned for
  // should be eating, in grams for every kg of it. a deficit is where protein
  // matters most, it is what keeps the weight coming off fat rather than off
  // muscle, so the cuts ask for more of it than a maintained day does
  goals: any[] = [
    { id: 'lose500', label: 'Lose half a kg a week', offset: -500, proteinPerKg: 2.2, fatPerKg: 0.8 },
    { id: 'lose250', label: 'Lose a quarter kg a week', offset: -250, proteinPerKg: 2.1, fatPerKg: 0.8 },
    { id: 'keep', label: 'Keep the weight', offset: 0, proteinPerKg: 1.8, fatPerKg: 0.9 },
    { id: 'gain250', label: 'Gain a quarter kg a week', offset: 250, proteinPerKg: 2.0, fatPerKg: 0.9 },
    { id: 'gain500', label: 'Gain half a kg a week', offset: 500, proteinPerKg: 2.0, fatPerKg: 0.9 },
    { id: 'cut10', label: 'A gentle cut, ten percent under', percent: -0.1, proteinPerKg: 2.1, fatPerKg: 0.8 },
    { id: 'cut20', label: 'A steady cut, twenty percent under', percent: -0.2, proteinPerKg: 2.2, fatPerKg: 0.8 },
    { id: 'bulk10', label: 'A lean bulk, ten percent over', percent: 0.1, proteinPerKg: 2.0, fatPerKg: 0.9 },
    { id: 'loseFat', label: 'Lose fat, keep the muscle', offset: -400, proteinPerKg: 2.2, fatPerKg: 0.8 },
    { id: 'gainMuscle', label: 'Gain muscle', offset: 300, proteinPerKg: 2.0, fatPerKg: 0.9 },
    { id: 'recomp', label: 'Lose fat and gain muscle', offset: -150, proteinPerKg: 2.2, fatPerKg: 0.8 },
    {
      id: 'custom',
      label: 'A number of my own',
      offset: 0,
      proteinPerKg: PROTEIN_PER_KG.default,
      fatPerKg: FAT_PER_KG.default,
      custom: true,
    },
  ];

  // how the calories are cut up once there is a number of them. the first two
  // take the protein and the fat off body weight and leave the carbs whatever
  // the day has left, which is the way round that answers what a body needs.
  // the third is there for a split that is asked for as percentages
  macroMethods: any[] = [
    { id: 'goal', label: 'From body weight, at the grams the goal asks for' },
    { id: 'perKg', label: 'From body weight, at grams per kg of my own' },
    { id: 'custom', label: 'Percentages of my own' },
  ];

  // what the equation is worth answering for, anything outside of it is a typo
  // rather than a body
  limits: any = {
    Age: { min: 6, max: 120, label: 'Age', unit: 'years' },
    Weight: { min: 20, max: 500, label: 'Weight', unit: 'kg' },
    Height: { min: 50, max: 300, label: 'Height', unit: 'cm' },
    BodyFat: { min: 3, max: 70, label: 'Body fat', unit: '%' },
  };

  bmr: number = 0;
  maintenance: number = 0;
  target: number = 0;
  applied: boolean = false;

  // the grams the target comes out as, worked out once whenever a number on the
  // form changes rather than on every read of it
  plan: MacroPlan = macroTargets({ weight: 0, calories: 0 });

  formData: any = new FormGroup({
    Gender: new FormControl('male'),
    Age: new FormControl(30),
    Weight: new FormControl(70),
    Height: new FormControl(170),
    BodyFat: new FormControl(20),
    Formula: new FormControl('mifflin'),
    Activity: new FormControl(1.375),
    ActivityCustom: new FormControl(1.4),
    Goal: new FormControl('keep'),
    GoalCustom: new FormControl(-500),
    MacroMethod: new FormControl('goal'),
    SplitProtein: new FormControl(20),
    SplitFat: new FormControl(30),
    SplitCarbs: new FormControl(50),
    ProteinPerKg: new FormControl(2.0),
    FatPerKg: new FormControl(0.8),
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

  // ------------------------------ the fields ------------------------------
  // the fields that have to be filled in for the equation that is selected. the
  // body fat one only counts when the equation is one that reads lean mass
  get activeFields(): string[] {
    let fields = ['Age', 'Weight', 'Height'];
    return this.selectedFormula.needsBodyFat ? [...fields, 'BodyFat'] : fields;
  }

  isOutOfRange(key: string): boolean {
    let limit = this.limits[key];
    let number = +this.formData.value[key] || 0;
    return number < limit.min || number > limit.max;
  }

  // the first field that was typed out of its range, as a line to read
  get rangeError(): string {
    for (let key of this.activeFields) {
      if (this.isOutOfRange(key)) {
        let limit = this.limits[key];
        return `${limit.label} has to be between ${limit.min} and ${limit.max} ${limit.unit}`;
      }
    }
    return '';
  }

  get selectedFormula(): any {
    let id = this.formData.value.Formula;
    return this.formulas.find((formula: any) => formula.id === id) || this.formulas[0];
  }

  get selectedActivity(): any {
    let value = +this.formData.value.Activity;
    return this.activities.find((activity: any) => activity.value === value) || this.activities[1];
  }

  get selectedGoal(): any {
    let id = this.formData.value.Goal;
    return this.goals.find((goal: any) => goal.id === id) || this.goals[2];
  }

  get isCustomActivity(): boolean {
    return +this.formData.value.Activity === 0;
  }

  // what the resting burn is multiplied by, the level that was picked or the
  // one that was typed in its place
  get activityMultiplier(): number {
    if (!this.isCustomActivity) {
      return +this.formData.value.Activity || 1;
    }
    let typed = +this.formData.value.ActivityCustom || 0;
    return Math.min(Math.max(typed, 1), 3);
  }

  // ------------------------------ the numbers ------------------------------
  // what is left of the body once the fat is taken off it, which is what the
  // last two equations are worked out from
  get leanMass(): number {
    let weight = +this.formData.value.Weight || 0;
    let fat = +this.formData.value.BodyFat || 0;
    return weight * (1 - fat / 100);
  }

  calculate() {
    let value = this.formData.value;
    let weight = +value.Weight || 0;
    let height = +value.Height || 0;
    let age = +value.Age || 0;
    if (this.rangeError) {
      this.bmr = 0;
      this.maintenance = 0;
      this.target = 0;
      this.plan = macroTargets({ weight: 0, calories: 0 });
      return;
    }
    let female = value.Gender === 'female';
    let lean = this.leanMass;
    let base = 0;
    switch (this.selectedFormula.id) {
      case 'harris':
        base = female
          ? 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
          : 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
        break;
      case 'katch':
        base = 370 + 21.6 * lean;
        break;
      case 'cunningham':
        base = 500 + 22 * lean;
        break;
      default:
        base = 10 * weight + 6.25 * height - 5 * age + (female ? -161 : 5);
    }
    this.bmr = Math.round(base);
    this.maintenance = Math.round(this.bmr * this.activityMultiplier);
    // a deficit is never taken below the resting burn, eating under that is not
    // something this page should hand out
    this.target = Math.max(this.bmr, Math.round(this.maintenance + this.goalOffset));
    // the calories are settled, the grams follow from them
    this.plan = this.buildPlan();
  }

  // the day in grams. the protein and the fat come off body weight and the
  // carbohydrates take what the target has left, unless the split itself was
  // the thing that was asked for, in which case it is read the other way round
  buildPlan(): MacroPlan {
    let value = this.formData.value;
    let weight = +value.Weight || 0;
    if (this.macroMethod === 'custom') {
      return macroTargetsFromSplit(
        this.target,
        {
          Fat: +value.SplitFat || 0,
          Carbohydrate: +value.SplitCarbs || 0,
          Protein: +value.SplitProtein || 0,
        },
        weight
      );
    }
    let perKg = this.activePerKg;
    return macroTargets({
      weight: weight,
      calories: this.target,
      proteinPerKg: perKg.Protein,
      fatPerKg: perKg.Fat,
    });
  }

  // the deficit or the surplus the goal asks for. a flat number, a share of the
  // maintenance burn, or whatever was typed
  get goalOffset(): number {
    let goal = this.selectedGoal;
    if (goal.custom) {
      let typed = Math.round(+this.formData.value.GoalCustom || 0);
      return Math.min(Math.max(typed, -1500), 1500);
    }
    if (goal.percent) {
      return Math.round(this.maintenance * goal.percent);
    }
    return +goal.offset || 0;
  }

  // what the target actually came out at against the maintenance burn, which is
  // not the offset that was asked for when the deficit hit the resting floor
  get appliedOffset(): number {
    return this.target - this.maintenance;
  }

  get isFloored(): boolean {
    return this.target > 0 && this.appliedOffset > this.goalOffset;
  }

  // ------------------------------ the split ------------------------------
  get macroMethod(): string {
    return this.formData.value.MacroMethod || 'goal';
  }

  get customSplitTotal(): number {
    let value = this.formData.value;
    return (+value.SplitProtein || 0) + (+value.SplitFat || 0) + (+value.SplitCarbs || 0);
  }

  // the grams per kg the protein and the fat are being taken off, the goal's own
  // or the ones that were typed in their place
  get activePerKg(): any {
    let value = this.formData.value;
    if (this.macroMethod === 'perKg') {
      return { Protein: +value.ProteinPerKg || 0, Fat: +value.FatPerKg || 0 };
    }
    let goal = this.selectedGoal;
    return {
      Protein: +goal.proteinPerKg || PROTEIN_PER_KG.default,
      Fat: +goal.fatPerKg || FAT_PER_KG.default,
    };
  }

  // the protein and the fat that were asked for do not fit inside the target,
  // so the numbers below are what the day was cut up into instead
  get perKgOverflow(): boolean {
    return this.plan.constrained;
  }

  // the split the calculator reads its own rows against. it is what the grams
  // came out as rather than something the grams were worked out from
  get activeSplit(): any {
    let split = this.plan.split;
    let usable = ['Protein', 'Fat', 'Carbohydrate'].every((key: string) => split[key] > 0);
    return usable ? { ...split } : { ...this.OperationsService.defaultMacroSplit };
  }

  // what the target calories come out as of every macro
  get macros(): any[] {
    let plan = this.plan;
    let weight = +this.formData.value.Weight || 0;
    return [
      { label: 'Fats', key: 'Fat' },
      { label: 'Carbs', key: 'Carbohydrate' },
      { label: 'Protein', key: 'Protein' },
    ].map((macro: any) => ({
      label: macro.label,
      key: macro.key,
      percent: plan.percent[macro.key],
      calories: Math.round(plan.calories[macro.key]),
      grams: plan.grams[macro.key],
      // every macro carries the line that says where its own number came from
      method: this.macroMethodLine(macro.key, weight),
    }));
  }

  // the sum behind one macro row. the protein and the fat are grams a kg taken
  // off the body, the carbohydrates are the calories the other two left behind
  macroMethodLine(key: string, weight: number): string {
    let plan = this.plan;
    let grams = plan.grams[key];
    let calories = Math.round(plan.calories[key]);
    if (this.macroMethod === 'custom') {
      return `${plan.percent[key]}% of ${plan.targetCalories} kcal = ${calories} kcal, ÷ ${CALORIES_PER_GRAM[key]} kcal a gram`;
    }
    if (key === 'Carbohydrate') {
      let spent = Math.round(plan.calories.Protein + plan.calories.Fat);
      return `${plan.targetCalories} kcal − ${Math.round(plan.calories.Protein)} kcal of protein − ${Math.round(plan.calories.Fat)} kcal of fat = ${plan.targetCalories - spent} kcal, ÷ 4 kcal a gram`;
    }
    let perKg = Math.round(plan.appliedPerKg[key] * 100) / 100;
    return `${perKg} gm/kg × ${weight} kg = ${grams} gm, × ${CALORIES_PER_GRAM[key]} kcal a gram = ${calories} kcal`;
  }

  // the three grams together against the number they were cut out of. whole
  // grams rarely land on it exactly, this says how far off they came out
  get macroTotalCalories(): number {
    return Math.round(this.plan.totalCalories);
  }

  get macroCalorieDrift(): number {
    return this.macroTotalCalories - this.plan.targetCalories;
  }

  // ------------------------------ how each number was reached ------------------
  // the equation with this body written into it, so the number above it can be
  // followed rather than taken on trust
  get bmrMethod(): string {
    let value = this.formData.value;
    let weight = +value.Weight || 0;
    let height = +value.Height || 0;
    let age = +value.Age || 0;
    let female = value.Gender === 'female';
    let lean = Math.round(this.leanMass * 10) / 10;
    switch (this.selectedFormula.id) {
      case 'harris':
        return female
          ? `447.593 + 9.247 × ${weight} kg + 3.098 × ${height} cm − 4.33 × ${age} years`
          : `88.362 + 13.397 × ${weight} kg + 4.799 × ${height} cm − 5.677 × ${age} years`;
      case 'katch':
        return `370 + 21.6 × ${lean} kg of lean mass`;
      case 'cunningham':
        return `500 + 22 × ${lean} kg of lean mass`;
      default:
        return `10 × ${weight} kg + 6.25 × ${height} cm − 5 × ${age} years ${female ? '− 161' : '+ 5'}`;
    }
  }

  // the lean mass line, only worth showing while an equation is reading it
  get leanMethod(): string {
    if (!this.selectedFormula.needsBodyFat) {
      return '';
    }
    let weight = +this.formData.value.Weight || 0;
    let fat = +this.formData.value.BodyFat || 0;
    let lean = Math.round(this.leanMass * 10) / 10;
    return `${weight} kg − ${fat}% body fat = ${lean} kg`;
  }

  get maintenanceMethod(): string {
    let label = this.isCustomActivity ? 'a multiplier of your own' : this.selectedActivity.label;
    return `${this.bmr} kcal × ${this.activityMultiplier} (${label.toLowerCase()})`;
  }

  get goalMethod(): string {
    let goal = this.selectedGoal;
    if (goal.custom) {
      return `${this.goalOffset} kcal a day, typed by hand`;
    }
    if (goal.percent) {
      return `${Math.round(goal.percent * 100)}% of the ${this.maintenance} kcal maintenance burn`;
    }
    if (!goal.offset) {
      return 'nothing added or taken off the maintenance burn';
    }
    let weekly = Math.abs(goal.offset * 7);
    return `${goal.offset > 0 ? '+' : ''}${goal.offset} kcal a day, around ${weekly} kcal a week, near ${Math.round((weekly / 7700) * 100) / 100} kg`;
  }

  get targetMethod(): string {
    if (this.isFloored) {
      return `the deficit would have gone under the ${this.bmr} kcal resting burn, so it is held there`;
    }
    return `${this.maintenance} kcal maintenance ${this.goalOffset < 0 ? '−' : '+'} ${Math.abs(this.goalOffset)} kcal for the goal`;
  }

  // the line above the macro rows that says how the split itself was arrived at
  get splitMethod(): string {
    if (this.macroMethod === 'custom') {
      let total = this.customSplitTotal;
      return total === 100
        ? 'the percentages typed below'
        : `the percentages typed below, which add to ${total}, so they are read as shares of that`;
    }
    let perKg = this.activePerKg;
    let source =
      this.macroMethod === 'perKg'
        ? 'the grams per kg typed beside the goal'
        : `${this.selectedGoal.label.toLowerCase()} asks for`;
    return `${source} ${perKg.Protein} gm/kg of protein and ${perKg.Fat} gm/kg of fat off body weight, the carbs take the calories those two leave behind`;
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
    this.formData.reset({ ...this.OperationsService.defaultTargetProfile });
  }

  // ------------------------------ storage ------------------------------
  restore(profile: any) {
    if (!profile) {
      this.calculate();
      return;
    }
    let value = { ...this.OperationsService.defaultTargetProfile, ...profile };
    // a goal was kept as a number of calories before the body goals existed
    let known = this.goals.some((goal: any) => goal.id === value?.Goal);
    value.Goal = known ? value.Goal : 'keep';
    // the same for the two settings that were not there before either, a body
    // stored without them is read on the ones it was worked out under
    let formula = this.formulas.some((entry: any) => entry.id === value?.Formula);
    value.Formula = formula ? value.Formula : 'mifflin';
    let method = this.macroMethods.some((entry: any) => entry.id === value?.MacroMethod);
    value.MacroMethod = method ? value.MacroMethod : 'goal';
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
    this.activeFields.map((key: string) => this.clampField(key));
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
