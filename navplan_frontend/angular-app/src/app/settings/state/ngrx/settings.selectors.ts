import {createFeatureSelector, createSelector} from '@ngrx/store';
import {LocalSettingsState} from '../state-model/local-settings-state';


export const getSettingsState = createFeatureSelector<LocalSettingsState>('settingsState');
export const getMagneticVariationDeg = createSelector(getSettingsState, state => state.magneticVariationDeg);
export const getMaxTrafficAltitudeFt = createSelector(getSettingsState, state => state.maxTrafficAltitudeFt);
export const getReserveTimeMin = createSelector(getSettingsState, state => state.reserveTimeMin);
