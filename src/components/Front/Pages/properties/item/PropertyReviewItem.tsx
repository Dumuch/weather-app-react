import { observer } from 'mobx-react-lite';
import { Avatar } from 'primereact/avatar';
import { Rating } from 'primereact/rating';
import { Skeleton } from 'primereact/skeleton';
import { FC } from 'react';
import { dateConfig } from '../../../../../config/date';
import { useStores } from '../../../../../store';
import { getFormatData } from '../../../../../utils/dateTime';
import { concatString } from '../../../../../utils/helpers';
import { FrontImage } from '../../../Global/image';

interface Props {
    userId: string;
    profilePicture: string;
    firstName: string;
    lastName: string;
    overallExperience: number;
    createdAt: string;
    overallReview: string;
}

const PropertyReviewItem: FC<Props> = observer(
    ({ userId, profilePicture, firstName, lastName, overallExperience, createdAt, overallReview }) => {
        const { reviewsStore } = useStores();

        return (
            <div className="pdd-review-block">
                <div className="user-name mb-half">
                    <Avatar shape="circle" className="review-avatar">
                        <FrontImage src={`${userId}/${profilePicture}`} identityId="users" width="auto" />
                    </Avatar>
                    <span>{concatString([firstName, lastName])}</span>
                </div>
                <div className="pdd-review-header mb">
                    <div className="rating">
                        {reviewsStore.reviewsByProperty.isFetched ? (
                            <>
                                <Rating className="stars" value={overallExperience} readOnly cancel={false} />
                                <div className="digit">{overallExperience}</div>
                            </>
                        ) : (
                            <Skeleton width="117px" height="23px" />
                        )}
                    </div>
                    <div className="review-date">
                        <span className="far fa-calendar-alt" />
                        {getFormatData(createdAt, dateConfig.formats.monthAndYear)}
                    </div>
                    <div className="published-date">
                        Published {getFormatData(createdAt, dateConfig.formats.dateOnlyDayAtBackend)}
                    </div>
                </div>
                <div className="textbox">
                    <p>{overallReview}</p>
                </div>
            </div>
        );
    }
);

export default PropertyReviewItem;
