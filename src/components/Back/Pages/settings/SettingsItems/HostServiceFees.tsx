import { useFormikContext } from 'formik';
import { FormField } from '../../../Form/form-field';
import { SettingsFormikProps } from '../SettingsSections';
import React from 'react';

const HostServiceFees: React.FC = () => {
    const { values } = useFormikContext<SettingsFormikProps>();
    return (
        <div className="grid form-group align-items-center">
            <label htmlFor="settings_general.hostServiceFee" className="col-2 form-control-required">
                Host Service Fee (%):
            </label>
            <FormField
                type="text"
                value={values.general?.hostServiceFee ?? ''}
                className="col-10"
                formName="settings"
                field="general.hostServiceFee"
            />
        </div>
    );
};

export default HostServiceFees;
