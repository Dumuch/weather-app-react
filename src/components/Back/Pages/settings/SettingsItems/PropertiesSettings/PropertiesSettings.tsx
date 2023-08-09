import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import { PickList, PickListChangeParams } from 'primereact/picklist';
import { useEffect, useState } from 'react';
import { Property } from '../../../../../../models/api/property';
import { useStores } from '../../../../../../store';
import { SettingsFormikProps } from '../../SettingsSections';
import PropertyItemTemplate from './PropertyItemTemplate';

const PropertiesSettings = observer(() => {
    const { setFieldValue } = useFormikContext<SettingsFormikProps>();
    const { propertiesStore } = useStores();
    const [source, setSource] = useState<Property[]>([]);
    const [target, setTarget] = useState<Property[]>([]);

    useEffect(() => {
        propertiesStore.getAvailable();
        propertiesStore.getSelected();
    }, []);

    useEffect(() => {
        setSource(propertiesStore.availableProperties.items);
        setTarget(propertiesStore.selectedProperties.items);
    }, [propertiesStore.availableProperties.items, propertiesStore.selectedProperties.items]);

    const onChange = (event: PickListChangeParams) => {
        setSource(event.source);
        setTarget(event.target);
        const selectedIds = event.target.map((review: Property) => review.id);
        setFieldValue('homepage.selectedHomepageProperties', selectedIds);
    };
    return (
        <div className="grid form-group align-items-start">
            <label htmlFor="settings_homepage.selectedHomepageProperties" className="col-2">
                Popular Properties Section:
            </label>
            <div className="col-10">
                <PickList
                    source={source}
                    target={target}
                    showSourceControls={false}
                    showTargetControls={false}
                    itemTemplate={PropertyItemTemplate}
                    onChange={onChange}
                    sourceHeader="Available Properties"
                    targetHeader="Selected Properties"
                    filterBy="name, overallRating"
                    sourceFilterPlaceholder="Search available properties..."
                    targetFilterPlaceholder="Search selected properties..."
                    dataKey="id"
                />
            </div>
        </div>
    );
});

export default PropertiesSettings;
