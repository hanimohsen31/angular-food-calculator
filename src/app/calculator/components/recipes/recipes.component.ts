import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FoodDataService } from '../../services/food-data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MEASURE_UNITS } from '../../services/constants';

@Component({
  standalone: false,
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss'],
})
export class RecipesComponent implements OnInit {
  // full food menu to pick items from
  foodList: any[] = [];
  filteredFoodList: any[] = [];
  searchTerm: string = '';
  matchesCount: number = 0;
  maxResults: number = 50;
  dropdownOpen: boolean = false;

  @ViewChild('foodDropdown') foodDropdown: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;

  // saved recipes
  recipesList: any[] = [];
  expandedKey: string = '';

  // the saved recipes are read one page at a time
  pageSize: number = 5;
  currentPage: number = 1;
  pagedRecipes: any[] = [];
  pageNumbers: number[] = [];

  // recipe under construction
  recipeItems: any[] = [];
  totals: any = this.emptyTotals();

  // edit / delete state
  editedRecipeKey: string = '';
  editedRecipeFoodID: string = '';
  // the recipe a copy was taken from, kept for the line above the builder
  copiedFromName: string = '';
  deletePopup: boolean = false;
  recipeToDelete: any = null;
  loading: boolean = false;

  measureUnits: string[] = MEASURE_UNITS;

  formData: any = new FormGroup({
    ShortFoodName: new FormControl('', [Validators.required]),
    Translation: new FormControl('', [Validators.required]),
    MeasureUnit: new FormControl('gm', [Validators.required]),
  });

  constructor(private FoodDataService: FoodDataService) {}

  ngOnInit(): void {
    this.getFoodData();
  }

  // ------------------------------ data ------------------------------
  getFoodData() {
    this.loading = true;
    this.FoodDataService.getFoodData().subscribe({
      next: (res) => {
        // keep the firebase key on every row, it is needed to update / delete
        let array = Object.entries(res || {}).map(([key, value]: any) => ({
          ...value,
          FoodKey: key,
        }));
        // plain food items feed the picker, recipes feed the saved list
        this.foodList = array.filter((elm: any) => !elm.isRecipe);
        this.recipesList = array
          .filter((elm: any) => elm.isRecipe)
          .map((elm: any) => this.normalizeRecipe(elm))
          .sort((a: any, b: any) => (a.ShortFoodName || '').localeCompare(b.ShortFoodName || ''));
        this.applyFilter();
        // a save or a delete can leave the page being read past the last recipe
        this.applyPaging();
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  // recipes saved before quantities moved to gm kept the item quantity as a
  // number of measures, they are converted once on load so the screen and the
  // totals both speak in gm
  normalizeRecipe(recipe: any) {
    if (recipe?.QuantityBasis === 'unit') {
      return recipe;
    }
    return {
      ...recipe,
      QuantityBasis: 'unit',
      RecipeItems: (recipe?.RecipeItems || []).map((item: any) => ({
        ...item,
        Quantity: (+item.Quantity || 0) * (+item.Measure || 0),
      })),
    };
  }

  // ------------------------------ picker ------------------------------
  applyFilter() {
    let term = this.searchTerm.trim().toLowerCase();
    // no search term shows the whole menu, the list is capped for performance
    let matches = term
      ? this.foodList.filter(
          (elm: any) =>
            (elm.ShortFoodName || '').toLowerCase().includes(term) ||
            (elm.Translation || '').includes(term),
        )
      : this.foodList;
    this.matchesCount = matches.length;
    this.filteredFoodList = matches.slice(0, this.maxResults);
  }

  toggleDropdown() {
    this.dropdownOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown() {
    this.dropdownOpen = true;
    this.applyFilter();
    // the search input only exists once the dropdown is rendered
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  // closing the menu drops the search with it, so it opens on the whole menu
  // again next time rather than on whatever was typed before
  closeDropdown() {
    this.dropdownOpen = false;
    this.clearSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilter();
  }

  // close the dropdown on a click anywhere outside of it
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    if (this.dropdownOpen && !this.foodDropdown?.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDropdown();
  }

  // quantity already picked for a food, shown as a badge inside the dropdown
  getPickedQuantity(food: any) {
    let existed = this.recipeItems.find((elm: any) => elm.FoodKey === food.FoodKey);
    return existed ? +existed.Quantity : 0;
  }

  // ------------------------------ items ------------------------------
  handleAddItem(food: any) {
    let existed = this.recipeItems.find((elm: any) => elm.FoodKey === food.FoodKey);
    // quantities are in the measure unit itself, one click is one full measure
    let step = +food.Measure || 0;
    if (existed) {
      existed.Quantity = +existed.Quantity + step;
    } else {
      this.recipeItems.push({
        FoodKey: food.FoodKey,
        FoodID: food.FoodID || '',
        ShortFoodName: food.ShortFoodName || '',
        Translation: food.Translation || '',
        Measure: +food.Measure || 0,
        MeasureUnit: food.MeasureUnit || 'gm',
        Quantity: step,
        Energy: +food.Energy || 0,
        Carbohydrate: +food.Carbohydrate || 0,
        Fat: +food.Fat || 0,
        Protein: +food.Protein || 0,
        Sugars: +food.Sugars || 0,
      });
    }
    // the dropdown stays open so several items can be picked in a row
    this.calculateTotals();
  }

  handleRemoveItem(index: number) {
    this.recipeItems.splice(index, 1);
    this.calculateTotals();
  }

  // the totals follow the quantity as it is typed. the number itself is left
  // alone until the field is left, a half typed field is not one to correct
  handleQuantityInput() {
    this.calculateTotals();
  }

  handleQuantityChange(item: any) {
    item.Quantity = +item.Quantity > 0 ? +item.Quantity : 0;
    this.calculateTotals();
  }

  // nutrient values are stored per the item Measure, the typed quantity is an
  // amount in that same unit, so a value is scaled down to a single unit first
  unitFactor(item: any) {
    let measure = +item?.Measure || 0;
    let quantity = +item?.Quantity || 0;
    return measure > 0 ? quantity / measure : 0;
  }

  scale(item: any, key: string) {
    return (+item?.[key] || 0) * this.unitFactor(item);
  }

  calculateTotals() {
    let totals = this.emptyTotals();
    this.recipeItems.map((item: any) => {
      totals.Measure += +item.Quantity || 0;
      totals.Energy += this.scale(item, 'Energy');
      totals.Carbohydrate += this.scale(item, 'Carbohydrate');
      totals.Fat += this.scale(item, 'Fat');
      totals.Protein += this.scale(item, 'Protein');
      totals.Sugars += this.scale(item, 'Sugars');
    });
    this.totals = totals;
  }

  emptyTotals() {
    return {
      Measure: 0,
      Energy: 0,
      Carbohydrate: 0,
      Fat: 0,
      Protein: 0,
      Sugars: 0,
    };
  }

  // ------------------------------ save ------------------------------
  onSubmit() {
    if (!this.formData.valid) {
      alert('Recipe name and translation are required');
      return;
    }
    if (!this.recipeItems.length) {
      alert('Add at least one item to the recipe');
      return;
    }
    let recipe = this.buildRecipe();
    let request = this.editedRecipeKey
      ? this.FoodDataService.updateRecipe(this.editedRecipeKey, recipe)
      : this.FoodDataService.addNewRecipe(recipe);
    this.loading = true;
    request.subscribe({
      next: () => {
        this.resetBuilder();
        this.getFoodData();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        alert('Could not save the recipe');
      },
    });
  }

  // a recipe is stored as a normal food item, so it shows up in the food table,
  // plus the RecipeItems it was built from, so it stays editable
  buildRecipe() {
    let value = this.formData.value;
    return {
      ShortFoodName: value.ShortFoodName,
      Translation: value.Translation,
      MeasureUnit: value.MeasureUnit,
      Measure: this.round(this.totals.Measure),
      Quantity: 1,
      Energy: this.round(this.totals.Energy),
      Carbohydrate: this.round(this.totals.Carbohydrate),
      Fat: this.round(this.totals.Fat),
      Protein: this.round(this.totals.Protein),
      Sugars: this.round(this.totals.Sugars),
      Equavlint: '',
      EquavlintMeasure: 0,
      EquavlintMeasureUnit: '',
      FoodID: this.editedRecipeFoodID || `R-${new Date().getTime()}`,
      isRecipe: true,
      QuantityBasis: 'unit',
      RecipeItems: this.recipeItems,
    };
  }

  round(value: number) {
    return Math.round((+value || 0) * 100) / 100;
  }

  // ------------------------------ edit ------------------------------
  get builderTitle(): string {
    if (this.copiedFromName) {
      return 'Edit a Copy';
    }
    return this.editedRecipeKey ? 'Edit Recipe' : 'Add New Recipe';
  }

  editRecipe(recipe: any) {
    this.copiedFromName = '';
    this.editedRecipeKey = recipe.FoodKey;
    this.editedRecipeFoodID = recipe.FoodID || '';
    this.formData.patchValue({
      ShortFoodName: recipe.ShortFoodName,
      Translation: recipe.Translation,
      MeasureUnit: recipe.MeasureUnit || 'gm',
    });
    // deep copy so cancelling an edit does not touch the saved list
    this.recipeItems = (recipe.RecipeItems || []).map((elm: any) => ({
      ...elm,
    }));
    this.calculateTotals();
    this.clearSearch();
    this.closeDropdown();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // the same items land in the builder, but nothing is tied to the recipe they
  // came from, so saving adds a second recipe and leaves the original alone
  copyRecipe(recipe: any) {
    this.editRecipe(recipe);
    this.editedRecipeKey = '';
    this.editedRecipeFoodID = '';
    this.copiedFromName = recipe.ShortFoodName || '';
    this.formData.patchValue({
      ShortFoodName: `${recipe.ShortFoodName || ''} copy`,
      Translation: `${recipe.Translation || ''} Ù†Ø³Ø®Ø©`,
    });
  }

  resetBuilder() {
    this.formData.reset({ ShortFoodName: '', Translation: '', MeasureUnit: 'gm' });
    this.recipeItems = [];
    this.editedRecipeKey = '';
    this.editedRecipeFoodID = '';
    this.copiedFromName = '';
    this.calculateTotals();
    this.clearSearch();
    this.closeDropdown();
  }

  // ------------------------------ delete ------------------------------
  toggleDeletePopup(recipe: any = null) {
    this.recipeToDelete = recipe;
    this.deletePopup = !this.deletePopup;
  }

  handleDelete() {
    let key = this.recipeToDelete?.FoodKey;
    if (!key) {
      return;
    }
    this.loading = true;
    this.FoodDataService.deleteRecipe(key).subscribe({
      next: () => {
        if (this.editedRecipeKey === key) {
          this.resetBuilder();
        }
        this.toggleDeletePopup();
        this.getFoodData();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        alert('Could not delete the recipe');
      },
    });
  }

  // ------------------------------ list ------------------------------
  toggleExpand(recipe: any) {
    this.expandedKey = this.expandedKey === recipe.FoodKey ? '' : recipe.FoodKey;
  }

  // ------------------------------ paging ------------------------------
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.recipesList.length / this.pageSize));
  }

  // the first recipe shown on this page, counted from one for the reader
  get rangeStart(): number {
    return this.recipesList.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.recipesList.length);
  }

  applyPaging() {
    let total = this.totalPages;
    this.currentPage = Math.min(Math.max(this.currentPage, 1), total);
    let start = (this.currentPage - 1) * this.pageSize;
    this.pagedRecipes = this.recipesList.slice(start, start + this.pageSize);
    this.buildPageNumbers(total);
  }

  // a narrow screen only has room for a short run of page buttons
  compactPager: boolean = window.matchMedia('(max-width: 767px)').matches;

  @HostListener('window:resize')
  handleResize() {
    let compact = window.matchMedia('(max-width: 767px)').matches;
    if (compact != this.compactPager) {
      this.compactPager = compact;
      this.applyPaging();
    }
  }

  // at most five page buttons, kept around the page being read
  buildPageNumbers(total: number) {
    let width = this.compactPager ? 3 : 5;
    let start = Math.max(1, this.currentPage - Math.floor(width / 2));
    let end = Math.min(total, start + width - 1);
    start = Math.max(1, end - width + 1);
    this.pageNumbers = [];
    for (let page = start; page <= end; page++) {
      this.pageNumbers.push(page);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page == this.currentPage) {
      return;
    }
    this.currentPage = page;
    // the opened recipe is left behind on the page it belongs to
    this.expandedKey = '';
    this.applyPaging();
  }

  handlePageSizeChange() {
    this.pageSize = +this.pageSize || 5;
    this.currentPage = 1;
    this.expandedKey = '';
    this.applyPaging();
  }
}
