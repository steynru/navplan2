import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs/operators';
import {SettingsActions} from './settings.actions';
import {LocalSettingsStorage} from '../../domain/service/local-settings-storage';


@Injectable()
export class SettingsEffects {
    constructor(private actions$: Actions) {
    }


    persistSettings$ = createEffect(() => this.actions$.pipe(
        ofType(SettingsActions.updateSettings),
        tap(action => LocalSettingsStorage.write(action.settings))
    ), {dispatch: false});
}
