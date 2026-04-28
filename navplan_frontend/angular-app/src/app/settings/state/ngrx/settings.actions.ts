import {createAction, props} from '@ngrx/store';
import {LocalSettingsState} from '../state-model/local-settings-state';


export class SettingsActions {
    public static readonly updateSettings = createAction(
        '[Settings Page] Update local settings',
        props<{ settings: LocalSettingsState }>()
    );
}
