import { Property } from '../../../../../../models/api/property';

const PropertyItemTemplate = (item: Property) => {
    return (
        <div>
            <h3>Property: {item.name}</h3>
            <span>Rating: {item.overallRating ?? 0}</span>
        </div>
    );
};

export default PropertyItemTemplate;
