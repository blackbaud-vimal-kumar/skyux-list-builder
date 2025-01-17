import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/operator/distinctUntilChanged';

import 'rxjs/add/operator/take';

import 'rxjs/add/operator/takeUntil';

import {
  getValue
} from 'microedge-rxstate/dist/helpers';

import {
  ListSortFieldSelectorModel
} from '@skyux/list-builder-common';

import {
  SkySearchComponent
} from '@skyux/lookup';

import {
  ListToolbarModel,
  ListToolbarItemModel,
  ListToolbarSetTypeAction,
  ListState,
  ListStateDispatcher,
  ListSortLabelModel,
  ListFilterModel,
  ListPagingSetPageNumberAction
} from '../list/state';

import {
  SkyListFilterSummaryComponent,
  SkyListFilterInlineComponent
} from '../list-filters';

import {
  SkyListToolbarItemComponent
} from './list-toolbar-item.component';

import {
  SkyListToolbarSortComponent
} from './list-toolbar-sort.component';

import {
  SkyListToolbarViewActionsComponent
} from './list-toolbar-view-actions.component';

import {
  ListToolbarConfigSetSearchEnabledAction,
  ListToolbarConfigSetSortSelectorEnabledAction
} from './state/config/actions';
import {
  ListToolbarState,
  ListToolbarStateDispatcher,
  ListToolbarStateModel
} from './state';

let nextId = 0;

@Component({
  selector: 'sky-list-toolbar',
  templateUrl: './list-toolbar.component.html',
  styleUrls: ['./list-toolbar.component.scss'],
  providers: [
    ListToolbarState,
    ListToolbarStateDispatcher,
    ListToolbarStateModel
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyListToolbarComponent implements OnInit, AfterContentInit, OnDestroy {
  @Input()
  public placeholder: string;

  @Input()
  public searchEnabled: boolean | Observable<boolean>;

  @ViewChild('searchComponent')
  public searchComponent: SkySearchComponent;

  @Input()
  public sortSelectorEnabled: boolean | Observable<boolean>;

  @Input()
  public toolbarType: string = 'standard';

  @Input()
  public searchText: string | Observable<string>;

  public get isFilterBarDisplayed(): boolean {
    return !this.isToolbarDisabled && this.hasInlineFilters && this.inlineFilterBarExpanded;
  }

  public get filterButtonAriaControls(): string {
    return this.isFilterBarDisplayed ? this.listFilterInlineId : undefined;
  }

  public sortSelectors: Observable<Array<any>>;
  public searchTextInput: Observable<string>;
  public view: Observable<string>;
  public leftTemplates: ListToolbarItemModel[];
  public centerTemplates: ListToolbarItemModel[];
  public rightTemplates: ListToolbarItemModel[];
  public type: Observable<string>;
  public isSearchEnabled: Observable<boolean>;
  public isToolbarDisabled: boolean = false;
  public isMultiselectEnabled: Observable<boolean>;
  public isSortSelectorEnabled: Observable<boolean>;
  public appliedFilters: Observable<Array<ListFilterModel>>;
  public hasAppliedFilters: Observable<boolean>;
  public showFilterSummary: boolean;
  public hasInlineFilters: boolean;
  public inlineFilterBarExpanded: boolean = false;
  public hasAdditionalToolbarSection = false;
  public hasViewActions = false;

  public filterButtonId: string = `sky-list-toolbar-filter-button-${++nextId}`;
  public listFilterInlineId: string = `sky-list-toolbar-filter-inline-${++nextId}`;

  @ContentChildren(SkyListToolbarItemComponent)
  private toolbarItems: QueryList<SkyListToolbarItemComponent>;

  @ContentChildren(SkyListToolbarSortComponent)
  private toolbarSorts: QueryList<SkyListToolbarSortComponent>;

  @ContentChildren(SkyListFilterSummaryComponent)
  private filterSummary: QueryList<SkyListFilterSummaryComponent>;

  @ContentChildren(SkyListFilterInlineComponent)
  private inlineFilter: QueryList<SkyListFilterInlineComponent>;

  @ContentChildren(SkyListToolbarViewActionsComponent)
  private viewActions: QueryList<SkyListToolbarViewActionsComponent>;

  @ViewChild('search')
  private searchTemplate: TemplateRef<any>;

  @ViewChild('sortSelector')
  private sortSelectorTemplate: TemplateRef<any>;

  @ViewChild('inlineFilterButton')
  private inlineFilterButtonTemplate: TemplateRef<any>;

  private customItemIds: string[] = [];
  private hasSortSelectors: boolean = false;
  private ngUnsubscribe = new Subject();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private state: ListState,
    private dispatcher: ListStateDispatcher,
    private toolbarState: ListToolbarState,
    public toolbarDispatcher: ListToolbarStateDispatcher
  ) { }

  public ngOnInit() {
    this.dispatcher.toolbarExists(true);

    getValue(this.searchText, (searchText: string) => {
      this.updateSearchText(searchText);
    });

    getValue(this.searchEnabled, (searchEnabled: boolean) => {
      this.toolbarDispatcher.next(
        new ListToolbarConfigSetSearchEnabledAction(
          searchEnabled === undefined ? true : searchEnabled
        )
      );
    });

    getValue(this.toolbarType, (type: string) => {
      this.dispatcher.next(new ListToolbarSetTypeAction(this.toolbarType));
    });

    getValue(this.sortSelectorEnabled, (sortSelectorEnabled: any) => {
      this.toolbarDispatcher.next(
        new ListToolbarConfigSetSortSelectorEnabledAction(
          sortSelectorEnabled === undefined ? true : sortSelectorEnabled
        )
      );
    });

    this.sortSelectors = this.getSortSelectors();

    // Initialize the sort toolbar item if necessary
    this.sortSelectors
      .takeUntil(this.ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe((currentSort) => {
        if (currentSort.length > 0 && !this.hasSortSelectors) {
          this.hasSortSelectors = true;
          this.dispatcher.toolbarAddItems(
            [
              new ListToolbarItemModel({
                id: 'sort-selector',
                template: this.sortSelectorTemplate,
                location: 'left'
              })
            ],
            2
          );
        } else if (currentSort.length < 1 && this.hasSortSelectors) {
          this.hasSortSelectors = false;
          this.dispatcher.toolbarRemoveItems([
            'sort-selector'
          ]);
        }
      });

    this.searchTextInput = this.state
      .takeUntil(this.ngUnsubscribe)
      .map(s => s.search.searchText)
      .distinctUntilChanged();

    this.view = this.state
      .takeUntil(this.ngUnsubscribe)
      .map(s => s.views.active)
      .distinctUntilChanged();

    this.watchTemplates();

    this.type = this.state
      .takeUntil(this.ngUnsubscribe)
      .map((state) => state.toolbar.type)
      .distinctUntilChanged();

    this.type
      .takeUntil(this.ngUnsubscribe)
      .subscribe((toolbarType) => {
        if (toolbarType === 'search') {
          this.dispatcher.toolbarRemoveItems(['search']);
        } else {
          this.dispatcher.toolbarAddItems(
            [
              new ListToolbarItemModel({
                id: 'search',
                template: this.searchTemplate,
                location: 'right'
              })
            ]
          );
        }
      });

    this.isSearchEnabled = this.toolbarState
      .takeUntil(this.ngUnsubscribe)
      .map(s => s.config)
      .distinctUntilChanged()
      .map(c => c.searchEnabled);

    this.state.map(s => s.toolbar)
      .takeUntil(this.ngUnsubscribe)
      .distinctUntilChanged()
      .map(c => c.disabled)
      .subscribe(isDisabled => this.isToolbarDisabled = isDisabled);

    this.isSortSelectorEnabled = this.toolbarState
      .takeUntil(this.ngUnsubscribe)
      .map(s => s.config)
      .distinctUntilChanged()
      .map(c => c.sortSelectorEnabled);

    this.isMultiselectEnabled = this.state
      .takeUntil(this.ngUnsubscribe)
      .map(s => s.toolbar)
      .distinctUntilChanged()
      .map(t => t.showMultiselectToolbar);

    this.hasAppliedFilters = this.state
      .takeUntil(this.ngUnsubscribe)
      .map(s => s.filters)
      .distinctUntilChanged()
      .map((filters) => {
        let activeFilters = filters.filter((f) => {
          return f.value !== '' &&
            f.value !== undefined &&
            f.value !== false &&
            f.value !== f.defaultValue;
        });
        return activeFilters.length > 0;
      });

    this.state
      .takeUntil(this.ngUnsubscribe)
      .subscribe((current: any) => {
        this.hasAdditionalToolbarSection = (current.toolbar.items.length > 0);
        this.changeDetector.detectChanges();
      });
  }

  public ngAfterContentInit() {
    // Inject custom toolbar items.
    this.toolbarItems.forEach((toolbarItem) => {
      this.dispatcher.toolbarAddItems(
        [
          new ListToolbarItemModel(toolbarItem)
        ],
        toolbarItem.index
      );

      this.customItemIds.push(toolbarItem.id);
    });

    this.toolbarItems.changes
      .takeUntil(this.ngUnsubscribe)
      .subscribe((newItems: QueryList<SkyListToolbarItemComponent>) => {
        newItems.forEach(item => {
          if (this.customItemIds.indexOf(item.id) < 0) {
            this.dispatcher.toolbarAddItems(
              [
                new ListToolbarItemModel(item)
              ],
              item.index
            );

            this.customItemIds.push(item.id);
          }
        });

        const itemsToRemove: string[] = [];

        this.customItemIds.forEach((itemId, index) => {
          if (!newItems.find(item => item.id === itemId)) {
            itemsToRemove.push(itemId);
            this.customItemIds.splice(index, 1);
          }
        });

        this.dispatcher.toolbarRemoveItems(itemsToRemove);
      });

    const sortModels = this.toolbarSorts.map(sort =>
      new ListSortLabelModel(
        {
          text: sort.label,
          fieldSelector: sort.field,
          fieldType: sort.type,
          global: true,
          descending: sort.descending
        }
      )
    );

    this.dispatcher.sortSetGlobal(sortModels);

    // Add inline filters.
    this.showFilterSummary = (this.filterSummary.length > 0);
    this.hasInlineFilters = (this.inlineFilter.length > 0);

    if (this.hasInlineFilters) {
      this.dispatcher.toolbarAddItems(
        [
          new ListToolbarItemModel({
            template: this.inlineFilterButtonTemplate,
            location: 'left'
          })
        ]
      );
    }

    // Check for view actions
    this.hasViewActions = (this.viewActions.length > 0);
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public setSort(sort: ListSortLabelModel): void {
    this.dispatcher.sortSetFieldSelectors(
      [{ fieldSelector: sort.fieldSelector, descending: sort.descending }]
    );
  }

  public inlineFilterButtonClick() {
    this.inlineFilterBarExpanded = !this.inlineFilterBarExpanded;
  }

  public updateSearchText(searchText: string) {
    this.state.take(1).subscribe((currentState) => {
      this.dispatcher.searchSetText(searchText);
      if (currentState.paging.pageNumber && currentState.paging.pageNumber !== 1) {
        this.dispatcher.next(
          new ListPagingSetPageNumberAction(Number(1))
        );
      }
    });
  }

  private itemIsInView(itemView: string, activeView: string) {
    return (itemView === undefined || itemView === activeView);
  }

  private getSortSelectors() {
    return Observable.combineLatest(
      this.state.map(s => s.sort.available).distinctUntilChanged(),
      this.state.map(s => s.sort.global).distinctUntilChanged(),
      this.state.map(s => s.sort.fieldSelectors).distinctUntilChanged(),
      (
        available: Array<ListSortLabelModel>,
        global: Array<ListSortLabelModel>,
        fieldSelectors: Array<ListSortFieldSelectorModel>
      ) => {

        // Get sorts that are in the global that are not in the available
        let sorts = global.filter(
          g => available.filter(a => a.fieldSelector === g.fieldSelector).length === 0
        );

        let resultSortSelectors = [...sorts, ...available].map(sortLabels => {
          let fs = fieldSelectors.filter(f => {
            return f.fieldSelector === sortLabels.fieldSelector
              && f.descending === sortLabels.descending;
          });
          let selected = false;
          if (fs.length > 0) {
            selected = true;
          }

          return {
            sort: sortLabels,
            selected: selected
          };
        });

        return resultSortSelectors;
      })
      .takeUntil(this.ngUnsubscribe);
  }

  private watchTemplates() {
    const templateStream = Observable.combineLatest(
      this.state.map(s => s.toolbar).distinctUntilChanged(),
      this.view.distinctUntilChanged(),
      (toolbar: ListToolbarModel, view: string) => {
        const items = toolbar.items.filter((i: ListToolbarItemModel) => {
          return this.itemIsInView(i.view, view);
        });

        const templates: any = {};

        items.forEach((item: ListToolbarItemModel) => {
          templates[item.location] = templates[item.location] || [];
          templates[item.location].push(item);
        });

        return templates;
      }
    )
      .takeUntil(this.ngUnsubscribe);

    templateStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe((value) => {
        this.leftTemplates = value.left;
        this.centerTemplates = value.center;
        this.rightTemplates = value.right;
        this.changeDetector.markForCheck();
      });
  }
}
