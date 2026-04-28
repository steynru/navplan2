import {TrafficState} from '../state-model/traffic-state';
import {TrafficActions} from './traffic.actions';
import {TrafficServiceStatus} from '../../domain/model/traffic-service-status';
import {TrafficPositionMerger} from '../../domain/service/traffic-position-merger';
import {TrafficMap} from '../../domain/model/traffic-map';
import {Extent3d} from '../../../geo-physics/domain/model/geometry/extent3d';
import {Altitude} from '../../../geo-physics/domain/model/geometry/altitude';
import {AltitudeUnit} from '../../../geo-physics/domain/model/geometry/altitude-unit';
import {AltitudeReference} from '../../../geo-physics/domain/model/geometry/altitude-reference';
import {JsDate} from '../../../system/domain/service/date/js-date';
import {createReducer, on} from '@ngrx/store';
import {BaseMapActions} from '../../../base-map/state/ngrx/base-map.actions';
import {SettingsActions} from '../../../settings/state/ngrx/settings.actions';
import {LocalSettingsStorage} from '../../../settings/domain/service/local-settings-storage';


export const initialTrafficState: TrafficState = {
    sessionId: Math.floor((Math.random() * 1000000000)).toString(),
    extent: undefined,
    isWatching: false,
    status: TrafficServiceStatus.OFF,
    trafficMap: new TrafficMap(new JsDate()),
    maxTrafficAgeSec: TrafficPositionMerger.TRAFFIC_MAX_AGE_SEC,
    maxTrafficAltitudeFt: LocalSettingsStorage.read().maxTrafficAltitudeFt
};


export const trafficReducer = createReducer(
    initialTrafficState,
    on(BaseMapActions.mapMovedDebounced, (state, action) => ({
        ...state,
        extent: new Extent3d(
            action.extent.minLon,
            action.extent.minLat,
            new Altitude(0, AltitudeUnit.FT, AltitudeReference.MSL), // TODO
            action.extent.maxLon,
            action.extent.maxLat,
            new Altitude(state.maxTrafficAltitudeFt, AltitudeUnit.FT, AltitudeReference.MSL),
        )
    })),
    on(SettingsActions.updateSettings, (state, action) => ({
        ...state,
        maxTrafficAltitudeFt: action.settings.maxTrafficAltitudeFt,
        extent: state.extent
            ? new Extent3d(
                state.extent.minLon,
                state.extent.minLat,
                state.extent.minAlt,
                state.extent.maxLon,
                state.extent.maxLat,
                new Altitude(action.settings.maxTrafficAltitudeFt, AltitudeUnit.FT, AltitudeReference.MSL)
            )
            : state.extent
    })),
    on(TrafficActions.startWatch, (state, action) => ({
        ...state,
        isWatching: true,
        status: TrafficServiceStatus.WAITING
    })),
    on(TrafficActions.stopWatch, (state, action) => ({
        ...state,
        isWatching: false,
        status: TrafficServiceStatus.OFF
    })),
    on(TrafficActions.readSuccess, (state, action) => {
        if (state.isWatching) {
            return {...state, trafficMap: action.newTrafficMap, status: TrafficServiceStatus.CURRENT};
        } else {
            return state;
        }
    }),
    on(TrafficActions.readError, (state) => {
        if (state.isWatching) {
            return { ...state, status: TrafficServiceStatus.ERROR };
        } else {
            return state;
        }
    }),
);
