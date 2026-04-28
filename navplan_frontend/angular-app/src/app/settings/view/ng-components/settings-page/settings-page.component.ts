import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {MessageActions} from '../../../../message/state/ngrx/message.actions';
import {Message} from '../../../../message/domain/model/message';
import {UnitSettingsComponent} from '../../../../geo-physics/view/ng-components/unit-settings/unit-settings.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {getSettingsState} from '../../../state/ngrx/settings.selectors';
import {take} from 'rxjs/operators';
import {SettingsActions} from '../../../state/ngrx/settings.actions';
import {LocalSettingsState} from '../../../state/state-model/local-settings-state';


@Component({
    selector: 'app-settings-page',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        UnitSettingsComponent
    ],
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {
    settingsForm: FormGroup;

    constructor(private appStore: Store<any>) {
    }


    ngOnInit() {
        this.initFormValues();
    }


    onSubmit() {
        if (this.settingsForm.valid) {
            this.updateSettings();
            this.appStore.dispatch(
                MessageActions.showMessage({message: Message.success('Settings successfully saved!')})
            );
        }
    }


    onCancelClicked() {
        this.initFormValues();
    }


    getBsValidClass(ctrlName: string): string {
        const ctrl = this.settingsForm.controls[ctrlName];
        if (!ctrl.dirty) {
            return '';
        } else if (ctrl.valid) {
            return 'is-valid';
        } else {
            return 'is-invalid';
        }
    }


    private initFormValues() {
        this.appStore.select(getSettingsState).pipe(take(1)).subscribe(settings => {
            this.settingsForm = new FormGroup({
                magneticVariationDeg: new FormControl(
                    settings.magneticVariationDeg,
                    [Validators.required, Validators.min(-30), Validators.max(30)]
                ),
                maxTrafficAltitudeFt: new FormControl(
                    settings.maxTrafficAltitudeFt,
                    [Validators.required, Validators.min(0)]
                ),
                reserveTimeMin: new FormControl(
                    settings.reserveTimeMin,
                    [Validators.required, Validators.min(0)]
                )
            });
        });
    }


    private updateSettings() {
        const formValues = this.settingsForm.value;
        const settings: LocalSettingsState = {
            magneticVariationDeg: Number(formValues.magneticVariationDeg),
            maxTrafficAltitudeFt: Number(formValues.maxTrafficAltitudeFt),
            reserveTimeMin: Number(formValues.reserveTimeMin)
        };

        this.appStore.dispatch(SettingsActions.updateSettings({settings}));
    }
}
