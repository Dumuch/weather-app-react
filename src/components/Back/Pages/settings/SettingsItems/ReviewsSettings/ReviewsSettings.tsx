import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import { PickList, PickListChangeParams } from 'primereact/picklist';
import { useEffect, useState } from 'react';
import { PropertyReview } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { SettingsFormikProps } from '../../SettingsSections';
import ReviewsItemTemplate from './ReviewsItemTemplate';

const ReviewsSettings = observer(() => {
    const { setFieldValue } = useFormikContext<SettingsFormikProps>();
    const { reviewsStore } = useStores();
    const [source, setSource] = useState<PropertyReview[]>([]);
    const [target, setTarget] = useState<PropertyReview[]>([]);

    useEffect(() => {
        reviewsStore.getAvailablePropertyReviews();
        reviewsStore.getSelectedPropertyReviews();
    }, []);

    useEffect(() => {
        setSource(reviewsStore.availablePropertyReviews.items);
        setTarget(reviewsStore.selectedPropertyReviews.items);
    }, [reviewsStore.availablePropertyReviews.items, reviewsStore.selectedPropertyReviews.items]);

    const onChange = (event: PickListChangeParams) => {
        setSource(event.source);
        setTarget(event.target);
        const selectedIds = event.target.map((review: PropertyReview) => review.id);
        setFieldValue('homepage.selectedHomepageReviews', selectedIds);
    };
    return (
        <div className="grid form-group align-items-start">
            <label htmlFor="settings_homepage.selectedHomepageReviews" className="col-2">
                Recent Reviews Section:
            </label>
            <div className="col-10">
                <PickList
                    source={source}
                    target={target}
                    showSourceControls={false}
                    showTargetControls={false}
                    itemTemplate={ReviewsItemTemplate}
                    onChange={onChange}
                    filterBy="overallReview,reservation.property.name,reservation.guest.firstName,reservation.guest.lastName"
                    sourceFilterPlaceholder="Search available reviews..."
                    targetFilterPlaceholder="Search selected reviews..."
                    sourceHeader="Available Reviews"
                    targetHeader="Selected Reviews"
                    dataKey="id"
                />
            </div>
        </div>
    );
});

export default ReviewsSettings;
