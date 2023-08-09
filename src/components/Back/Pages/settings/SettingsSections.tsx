import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { observer } from 'mobx-react-lite';
import { confirmDialog } from 'primereact/confirmdialog';
import { IPanel } from '../../../../pages/manager/settings';
import { useStores } from '../../../../store';
import SavePanel from '../../dashboard/SavePanel';
import SettingsPanel from './SettingsPanel';
import { dialog } from '../../../../utils/confirmDialogConstants';

interface Props {
    panels: IPanel[];
}

export type SettingsFormikProps = Record<string, Record<string, any>>;

const SettingsSections: React.FC<Props> = observer(({ panels }) => {
    const { settingsStore, reviewsStore, propertiesStore } = useStores();

    const validationSchema = Yup.object().shape({
        general: Yup.object({
            hostServiceFee: Yup.number()
                .typeError('Fee must be number')
                .positive('Fee must be positive')
                .min(0, 'Fee is too small')
                .max(100, 'Fee is too large')
                .required('Value is required'),
            guestServiceFee: Yup.number()
                .typeError('Fee must be number')
                .positive('Fee must be positive')
                .min(0, 'Fee is too small')
                .max(100, 'Fee is too large')
                .required('Value is required'),
        }),
    });

    const onSubmit = (values: SettingsFormikProps) => {
        settingsStore.updateSettings(panels, values);
    };

    const onCancel = (formikProps: FormikProps<SettingsFormikProps>) => {
        confirmDialog({
            ...dialog.warn,
            accept: () => {
                reviewsStore.getAvailablePropertyReviews();
                reviewsStore.getSelectedPropertyReviews();
                propertiesStore.getAvailable();
                propertiesStore.getSelected();
                formikProps.setValues(settingsStore.initialValues);
            },
        });
    };

    React.useEffect(() => {
        settingsStore.getInitialValues(panels);
    }, []);
    return (
        <Formik
            initialValues={settingsStore.initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
        >
            {(props) => {
                return (
                    <Form>
                        <div className="grid p-5">
                            <div className="col-8">
                                {panels.map((panel) => (
                                    <div key={panel.section.value}>
                                        <h2>{panel.section.valueUI}</h2>
                                        <SettingsPanel settings={panel.settings} />
                                    </div>
                                ))}
                            </div>
                            <div className="col-4 pr-5 pl-5">
                                <h2>&nbsp;</h2>
                                <SavePanel
                                    timestamp={{
                                        createdAt: settingsStore.settings![0]?.createdAt || '',
                                        updatedAt: settingsStore.settings![0]?.updatedAt || '',
                                    }}
                                    inputsDisabled
                                    formikProps={props}
                                >
                                    <div className="controls-group-right">
                                        <SavePanel.CancelButton
                                            onClick={() => onCancel(props)}
                                            className="p-button-default"
                                        >
                                            Cancel
                                        </SavePanel.CancelButton>
                                        <SavePanel.SaveButton className="p-button-primary">
                                            <i className="pi pi-save pr-3"></i>
                                            Save
                                        </SavePanel.SaveButton>
                                    </div>
                                </SavePanel>
                            </div>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
});

export default SettingsSections;
