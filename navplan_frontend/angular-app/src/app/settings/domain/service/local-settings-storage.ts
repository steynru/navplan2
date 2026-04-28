import {LocalSettingsState} from '../../state/state-model/local-settings-state';


export class LocalSettingsStorage {
    public static readonly STORAGE_KEY = 'navplan.localSettings';
    public static readonly DEFAULT_SETTINGS: LocalSettingsState = {
        magneticVariationDeg: 3,
        maxTrafficAltitudeFt: 15000,
        reserveTimeMin: 45
    };


    public static read(): LocalSettingsState {
        if (!this.isStorageAvailable()) {
            return {...this.DEFAULT_SETTINGS};
        }

        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            if (!json) {
                return {...this.DEFAULT_SETTINGS};
            }

            return {
                ...this.DEFAULT_SETTINGS,
                ...JSON.parse(json)
            };
        } catch {
            return {...this.DEFAULT_SETTINGS};
        }
    }


    public static write(settings: LocalSettingsState): void {
        if (!this.isStorageAvailable()) {
            return;
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    }


    private static isStorageAvailable(): boolean {
        return typeof localStorage !== 'undefined';
    }
}
