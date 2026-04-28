import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {settingsReducer} from './ngrx/settings.reducer';
import {SettingsEffects} from './ngrx/settings.effects';


@NgModule({
    imports: [
        StoreModule.forFeature('settingsState', settingsReducer),
        EffectsModule.forFeature([SettingsEffects])
    ],
    declarations: [],
    exports: [],
    providers: []
})
export class SettingsStateModule {
}
