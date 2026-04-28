import {combineLatest, Observable, Subscription} from 'rxjs';
import {Airspace} from '../../domain/model/airspace';
import {OlAirspace} from './ol-airspace';
import {OlVectorLayer} from '../../../base-map/view/ol-model/ol-vector-layer';
import {MapLayerVisibility} from '../../../flight-map/state/ngrx/map-layer-visibility';


export class OlAirspaceContainer {
    private readonly airspaceSubscription: Subscription;


    constructor(
        private readonly airspaceLayer: OlVectorLayer,
        airspace$: Observable<Airspace[]>,
        mapLayerVisibility$: Observable<MapLayerVisibility>
    ) {
        this.airspaceSubscription = combineLatest([airspace$, mapLayerVisibility$]).subscribe(([airspace, visibility]) => {
            this.clearFeatures();
            this.drawFeatures(airspace, visibility);
        });
    }


    public destroy() {
        this.airspaceSubscription.unsubscribe();
        this.clearFeatures();
    }


    private drawFeatures(airspaces: Airspace[], visibility: MapLayerVisibility) {
        if (airspaces) {
            airspaces
                .filter(airspace => this.isAirspaceCategoryVisible(airspace, visibility))
                .forEach(airspace => OlAirspace.draw(airspace, this.airspaceLayer));
        }
    }


    private clearFeatures() {
        this.airspaceLayer.clear();
    }


    private isAirspaceCategoryVisible(airspace: Airspace, visibility: MapLayerVisibility): boolean {
        const category = (airspace.category || '').toUpperCase();
        const name = (airspace.name || '').toUpperCase();

        if (this.isGliderAirspace(category, name)) {
            return visibility.airspaceGlider;
        }

        if (this.isRestrictedAirspace(category, name)) {
            return visibility.airspaceRestricted;
        }

        return visibility.airspaceCat;
    }


    private isGliderAirspace(category: string, name: string): boolean {
        return category === 'GLD' || name.includes('GLIDER') || name.includes('GLIDING');
    }


    private isRestrictedAirspace(category: string, name: string): boolean {
        return ['P', 'D', 'R', 'X'].includes(category)
            || name.includes('PROHIBITED')
            || name.includes('DANGER')
            || name.includes('RESTRICTED');
    }
}
