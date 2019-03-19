import {
  NgModule
} from '@angular/core';

import {
  SkyMediaQueryModule
} from '@skyux/core';

import {
  SkyCheckboxModule
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
  SkyListModule,
  SkyListToolbarModule,
  SkyListSecondaryActionsModule,
  SkyListFiltersModule,
  SkyListPagingModule
} from './public';

import {
  SkySortModule,
  SkyFilterModule,
  SkyPagingModule
} from '@skyux/lists';

import {
  SkySearchModule
} from '@skyux/lookup';

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
    SkyMediaQueryModule,
    SkyPagingModule,
    SkySearchModule,
    SkySortModule,
    SkyTokensModule,
    SkyToolbarModule
  ]
})
export class AppSkyModule { }
