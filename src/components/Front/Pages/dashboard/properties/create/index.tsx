import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useStores } from '../../../../../../store';
import DashboardPropertiesCreateSectionStep1 from './step1';
import DashboardPropertiesCreateSectionStep2 from './step2';
import { PropertyCreate } from '../../../../../../models/api/property';
import { useRouter } from 'next/router';
import { FrontRoutesList } from '../../../FrontRoutesList';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { FrontButton } from '../../../../Global/button';

const DashboardPropertiesCreateSection = observer(() => {
    const router = useRouter();
    const { propertiesStore, userStore } = useStores();
    const [error, setError] = useState<string | null>(null);
    const [newProperty, setNewProperty] = useState<PropertyCreate | any>(null);
    const [stepForm, setStepForm] = useState(1);

    const submitForm1 = (values: object) => {
        setStepForm(2);
        setNewProperty({ newProperty, ...values });
    };

    const submitForm2 = async (values: object) => {
        try {
            const property = await propertiesStore.create({ ...newProperty, ...values } as PropertyCreate, true);
            userStore.isFetched = false;
            userStore.properties.isFetched = false;
            if (property) await router.replace(`${FrontRoutesList.DashboardProperties}/${property?.id}?tabIndex=5`);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
        }
    };

    const toPrevStep = () => setStepForm((prevState) => prevState - 1);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">Add Property</h2>
                <div className="buttons-group width0 align-items-center">
                    <div className="step-counter h6-style">Step {stepForm} of 2</div>
                </div>
            </div>
            <FrontNotificationField alertType={AlertType.danger} message={error} />
            <DashboardPropertiesCreateSectionStep1
                style={{ display: stepForm === 1 ? 'block' : 'none' }}
                setObProperty={submitForm1}
            />
            <DashboardPropertiesCreateSectionStep2
                style={{ display: stepForm === 2 ? 'block' : 'none' }}
                setObProperty={submitForm2}
                previousStep={toPrevStep}
            />
        </div>
    );
});

export default DashboardPropertiesCreateSection;
