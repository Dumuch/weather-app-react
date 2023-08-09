import { FC } from 'react';
import { PropertyReview } from '../../../../../models/api';
import ReviewCard from './ReviewCard';

interface Props {
    recentReviews: PropertyReview[];
}

const RecentReviews: FC<Props> = ({ recentReviews }) => {
    return (
        <section className="content-section bg-color-light-grey">
            <div className="container">
                <h2 className="h4-style text-center">Recent Reviews</h2>
                <div className="items-listing three-cols reviews-listing">
                    <div className="inner-wrap">
                        {recentReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RecentReviews;
