import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import {
  SkyMediaBreakpoints,
  SkyMediaQueryService
} from '@skyux/core';

import {
  MockSkyMediaQueryService
} from '@skyux/core/testing';

import {
  SkyListViewGridModule
} from '@skyux/list-builder-view-grids';

import {
  expect
} from '@skyux-sdk/testing';

import {
  ListViewSwitcherFixtureComponent
} from './fixtures/list-view-switcher.component.fixture';

import {
  ListViewSwitcherSecondaryViewFixtureComponent
} from './fixtures/list-view-switcher-secondary-view.component.fixture';

import {
  ListViewSwitcherOnlyGridFixtureComponent
} from './fixtures/list-view-switcher-only-grid.component.fixture';

import {
  ListViewSwitcherOnlyCustomFixtureComponent
} from './fixtures/list-view-switcher-only-custom.component.fixture';

import {
  ListViewSwitcherExtraCustomFixtureComponent
} from './fixtures/list-view-switcher-extra-custom.component.fixture';

import {
  SkyListModule
} from '../list';

import {
  ListState,
  ListStateDispatcher
} from '../list/state';

import {
  SkyListToolbarModule
} from '../list-toolbar';

import {
  SkyListViewSwitcherModule
} from './list-view-switcher.module';

describe('List View Switcher Component', () => {
  let state: ListState,
    dispatcher: ListStateDispatcher,
    nativeElement: HTMLElement,
    mockMediaQueryService: MockSkyMediaQueryService;

  describe('multi-view', () => {

    let fixture: ComponentFixture<ListViewSwitcherFixtureComponent>,
      component: ListViewSwitcherFixtureComponent;

    beforeEach(() => {
      dispatcher = new ListStateDispatcher();
      state = new ListState(dispatcher);
      mockMediaQueryService = new MockSkyMediaQueryService();

      TestBed.configureTestingModule({
        declarations: [
          ListViewSwitcherFixtureComponent,
          ListViewSwitcherSecondaryViewFixtureComponent
        ],
        imports: [
          SkyListModule,
          SkyListToolbarModule,
          SkyListViewGridModule,
          SkyListViewSwitcherModule
        ],
        providers: [
          { provide: ListState, useValue: state },
          { provide: ListStateDispatcher, useValue: dispatcher },
          { provide: SkyMediaQueryService, useValue: mockMediaQueryService }
        ]
      });

      fixture = TestBed.createComponent(ListViewSwitcherFixtureComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
    });

    describe('normal view', () => {

      it('should show the view switcher if more than one view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-radio-group'))
          .not.toBeUndefined();
      }));

      it('should set the default radio button for a grid correctly', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const gridRadio: HTMLElement = <HTMLElement>nativeElement
          .querySelector('sky-list-view-switcher sky-radio[ng-reflect-icon="table"]');
        expect(gridRadio).not.toBeNull();
        expect(gridRadio.querySelector('i.fa-table')).not.toBeNull();
      }));

      it('should set the custom radio button correctly', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const gridRadio: HTMLElement = <HTMLElement>nativeElement
          .querySelector('sky-list-view-switcher sky-radio[ng-reflect-icon="gavel"]');
        expect(gridRadio).not.toBeNull();
        expect(gridRadio.querySelector('i.fa-gavel')).not.toBeNull();
      }));

      it('should set the list to the default view', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          component.gridView.active.subscribe(activeState => {
            expect(activeState).toBeFalsy();
          });
          component.secondaryView.active.subscribe(activeState => {
            expect(activeState).toBeTruthy();
          });
        });
      }));

      it('should switch to the grid view correctly', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          (<HTMLElement>nativeElement
            .querySelector('sky-list-view-switcher sky-radio[ng-reflect-icon="table"]'))
            .click();
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            component.gridView.active.subscribe(activeState => {
              expect(activeState).toBeTruthy();
            });
            component.secondaryView.active.subscribe(activeState => {
              expect(activeState).toBeFalsy();
            });
          });
        });
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

    describe('mobile view', () => {

      beforeEach(() => {
        mockMediaQueryService.fire(SkyMediaBreakpoints.xs);
      });

      it('should show the view switcher if more than one view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-dropdown'))
          .not.toBeUndefined();
      }));

      it('should set the dropdown button for a grid correctly', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        (<HTMLElement>document.querySelector('sky-list-view-switcher .sky-dropdown-button'))
          .click();
        fixture.detectChanges();
        tick();
        const gridDropdownButton: HTMLElement =
          <HTMLElement>nativeElement
            .querySelector('sky-list-view-switcher sky-dropdown-item sky-icon[ng-reflect-icon="table"]');
        expect(gridDropdownButton).not.toBeNull();
        expect(gridDropdownButton.querySelector('i.fa-table')).not.toBeNull();
      }));

      it('should set the custom dropdown button correctly', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        (<HTMLElement>document.querySelector('sky-list-view-switcher .sky-dropdown-button'))
          .click();
        fixture.detectChanges();
        tick();
        const customDropdownButton: HTMLElement =
          <HTMLElement>nativeElement
            .querySelector('sky-list-view-switcher sky-dropdown-item sky-icon[ng-reflect-icon="gavel"]');
        expect(customDropdownButton).not.toBeNull();
        expect(customDropdownButton.querySelector('i.fa-gavel')).not.toBeNull();
      }));

      it('should set the list to the default view', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          component.gridView.active.subscribe(activeState => {
            expect(activeState).toBeFalsy();
          });
          component.secondaryView.active.subscribe(activeState => {
            expect(activeState).toBeTruthy();
          });
        });
      }));

      it('should switch to the grid view correctly', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          (<HTMLElement>document.querySelector('sky-list-view-switcher .sky-dropdown-button'))
            .click();
          fixture.detectChanges();
          fixture.whenStable().then(() => {
            (<HTMLElement>nativeElement
              .querySelectorAll('sky-list-view-switcher sky-dropdown-item button')[0])
              .click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              component.gridView.active.subscribe(activeState => {
                expect(activeState).toBeTruthy();
              });
              component.secondaryView.active.subscribe(activeState => {
                expect(activeState).toBeFalsy();
              });
            });
          });
        });
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

  });

  describe('grid only', () => {

    let fixture: ComponentFixture<ListViewSwitcherOnlyGridFixtureComponent>;

    beforeEach(() => {
      dispatcher = new ListStateDispatcher();
      state = new ListState(dispatcher);
      mockMediaQueryService = new MockSkyMediaQueryService();

      TestBed.configureTestingModule({
        declarations: [
          ListViewSwitcherOnlyGridFixtureComponent,
          ListViewSwitcherSecondaryViewFixtureComponent
        ],
        imports: [
          SkyListModule,
          SkyListToolbarModule,
          SkyListViewGridModule,
          SkyListViewSwitcherModule
        ],
        providers: [
          { provide: ListState, useValue: state },
          { provide: ListStateDispatcher, useValue: dispatcher },
          { provide: SkyMediaQueryService, useValue: mockMediaQueryService }
        ]
      });

      fixture = TestBed.createComponent(ListViewSwitcherOnlyGridFixtureComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
    });

    describe('normal view', () => {

      it('should not show the view switcher if only a default view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-radio-group'))
          .toBeNull();
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

    describe('mobile view', () => {

      beforeEach(() => {
        mockMediaQueryService.fire(SkyMediaBreakpoints.xs);
      });

      it('should not show the view switcher if only a default view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-dropdown'))
          .toBeNull();
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

  });

  describe('custom only', () => {

    let fixture: ComponentFixture<ListViewSwitcherOnlyCustomFixtureComponent>;

    beforeEach(() => {
      dispatcher = new ListStateDispatcher();
      state = new ListState(dispatcher);
      mockMediaQueryService = new MockSkyMediaQueryService();

      TestBed.configureTestingModule({
        declarations: [
          ListViewSwitcherOnlyCustomFixtureComponent,
          ListViewSwitcherSecondaryViewFixtureComponent
        ],
        imports: [
          SkyListModule,
          SkyListToolbarModule,
          SkyListViewGridModule,
          SkyListViewSwitcherModule
        ],
        providers: [
          { provide: ListState, useValue: state },
          { provide: ListStateDispatcher, useValue: dispatcher },
          { provide: SkyMediaQueryService, useValue: mockMediaQueryService }
        ]
      });

      fixture = TestBed.createComponent(ListViewSwitcherOnlyCustomFixtureComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
    });

    describe('normal view', () => {

      it('should not show the view switcher if only one custom view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-radio-group'))
          .toBeNull();
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

    describe('mobile view', () => {

      beforeEach(() => {
        mockMediaQueryService.fire(SkyMediaBreakpoints.xs);
      });

      it('should not show the view switcher if only a default view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-dropdown'))
          .toBeNull();
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

  });

  describe('custom only with extra declaration', () => {

    let fixture: ComponentFixture<ListViewSwitcherExtraCustomFixtureComponent>;

    beforeEach(() => {
      dispatcher = new ListStateDispatcher();
      state = new ListState(dispatcher);
      mockMediaQueryService = new MockSkyMediaQueryService();

      TestBed.configureTestingModule({
        declarations: [
          ListViewSwitcherExtraCustomFixtureComponent,
          ListViewSwitcherSecondaryViewFixtureComponent
        ],
        imports: [
          SkyListModule,
          SkyListToolbarModule,
          SkyListViewGridModule,
          SkyListViewSwitcherModule
        ],
        providers: [
          { provide: ListState, useValue: state },
          { provide: ListStateDispatcher, useValue: dispatcher },
          { provide: SkyMediaQueryService, useValue: mockMediaQueryService }
        ]
      });

      fixture = TestBed.createComponent(ListViewSwitcherExtraCustomFixtureComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
    });

    describe('normal view', () => {

      it('should not show the view switcher if only one view and an extra custom declaration exists',
        fakeAsync(() => {
          fixture.detectChanges();
          tick();
          expect(nativeElement.querySelector('sky-list-view-switcher sky-radio-group'))
            .toBeNull();
        }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

    describe('mobile view', () => {

      beforeEach(() => {
        mockMediaQueryService.fire(SkyMediaBreakpoints.xs);
      });

      it('should not show the view switcher if only a default view exists', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(nativeElement.querySelector('sky-list-view-switcher sky-dropdown'))
          .toBeNull();
      }));

      it('should be accessible', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(nativeElement).toBeAccessible();
        });
      }));

    });

  });

});
