import { useFormikContext } from 'formik';
import { FormField } from '../../../Form/form-field';
import { SettingsFormikProps } from '../SettingsSections';
import React from 'react';

const GuestServiceFees: React.FC = () => {
    const { values } = useFormikContext<SettingsFormikProps>();
    return (
        <div className="grid form-group align-items-center">
            <label htmlFor="settings_general.guestServiceFee" className="col-2 form-control-required">
                Guest Service Fee (%):
            </label>
            <FormField
                type="text"
                value={values.general?.guestServiceFee ?? ''}
                className="col-10"
                formName="settings"
                field="general.guestServiceFee"
            />
        </div>
    );
};

export default GuestServiceFees;
