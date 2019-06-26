import {
  NgModule
} from '@angular/core';

import {
  SkyMediaQueryModule
} from '@skyux/core';

import {
  SkyCheckboxModule,
  SkyRadioModule
} from '@skyux/forms';

import {
  SkyGridModule
} from '@skyux/grids';

import {
  SkyI18nModule
} from '@skyux/i18n';

import {
  SkyIconModule,
  SkyTokensModule
} from '@skyux/indicators';

import {
  SkyToolbarModule
} from '@skyux/layout';

import {
  SkyListFiltersModule,
  SkyListModule,
  SkyListToolbarModule,
  SkyListSecondaryActionsModule,
  SkyListPagingModule
} from '@skyux/list-builder';

import {
  SkyListViewGridModule
} from '@skyux/list-builder-view-grids';

import {
  SkyFilterModule,
  SkySortModule,
  SkyPagingModule
} from '@skyux/lists';

import {
  SkySearchModule
} from '@skyux/lookup';

import {
  SkyModalModule
} from '@skyux/modals';

import {
  SkyDropdownModule
} from '@skyux/popovers';

import {
  SkyAppLinkModule
} from '@skyux/router';

@NgModule({
  exports: [
    SkyAppLinkModule,
    SkyCheckboxModule,
    SkyDropdownModule,
    SkyFilterModule,
    SkyGridModule,
    SkyI18nModule,
    SkyIconModule,
    SkyListFiltersModule,
    SkyListModule,
    SkyListPagingModule,
    SkyListSecondaryActionsModule,
    SkyListToolbarModule,
    SkyListViewGridModule,
    SkyMediaQueryModule,
    SkyModalModule,
    SkyPagingModule,
    SkyRadioModule,
    SkySearchModule,
    SkySortModule,
    SkyTokensModule,
    SkyToolbarModule
  ]
})
export class AppSkyModule { }
