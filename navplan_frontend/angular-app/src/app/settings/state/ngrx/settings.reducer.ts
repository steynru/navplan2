import {createReducer, on} from '@ngrx/store';
import {LocalSettingsState} from '../state-model/local-settings-state';
import {SettingsActions} from './settings.actions';
import {LocalSettingsStorage} from '../../domain/service/local-settings-storage';


export const initialSettingsState: LocalSettingsState = LocalSettingsStorage.read();


export const settingsReducer = createReducer(
    initialSettingsState,
    on(SettingsActions.updateSettings, (state, action) => ({
        ...state,
        ...action.settings
    }))
);
