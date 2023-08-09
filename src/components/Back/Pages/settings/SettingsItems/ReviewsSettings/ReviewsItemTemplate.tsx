import { dateConfig } from '../../../../../../config/date';
import { PropertyReview } from '../../../../../../models/api';
import { getFormatData } from '../../../../../../utils/dateTime';
import { concatString } from '../../../../../../utils/helpers';

const ReviewsItemTemplate = (item: PropertyReview) => {
    return (
        <div>
            <h3>Property: {item.reservation?.property?.name}</h3>
            <span>
                Guest:{' '}
                {concatString([item.reservation?.guest?.firstName ?? '', item.reservation?.guest?.lastName ?? ''])}
            </span>
            <br />
            <span>Created At: {getFormatData(item.createdAt, dateConfig.formats.date)}</span>
            <p>{item.overallReview}</p>
        </div>
    );
};

export default ReviewsItemTemplate;
