import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import { Property } from '../../../../../models/api/property';
import PropertyDetails from './PropertyDetails';
import PropertySidebar from './PropertySidebar';
import { FindAndCountAll, PropertyReview } from '../../../../../models/api';

interface Props {
    property: Property;
    reviews: FindAndCountAll<PropertyReview[]>;
    serviceFee: string;
}

const PropertyItemSection: FunctionComponent<Props> = observer(({ property, reviews, serviceFee }) => {
    return (
        <>
            <div className="bbs-panels-wrap container">
                <PropertyDetails property={property} reviews={reviews} />
                <PropertySidebar property={property} serviceFee={serviceFee} />
            </div>
        </>
    );
});
export default PropertyItemSection;
