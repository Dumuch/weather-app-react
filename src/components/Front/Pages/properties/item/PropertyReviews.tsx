import { observer } from 'mobx-react-lite';
import { FC, useEffect, useState } from 'react';
import { Element } from 'react-scroll';
import { PropertyReview } from '../../../../../models/api';
import { useStores } from '../../../../../store';
import { scrollToElement } from '../../../../../utils/helpers';
import FrontPagination from '../../../Global/pagination';
import paginatorTemplate from './PaginatorTemplate';
import PropertyReviewItem from './PropertyReviewItem';

interface Props {
    propertyId: string;
    averageRating: number | null;
    initialReviews: PropertyReview[];
    initialCount: number;
}

const PropertyReviews: FC<Props> = observer(({ propertyId, averageRating, initialReviews, initialCount }) => {
    const { reviewsStore } = useStores();

    const [currentPage, setCurrentPage] = useState(1);
    const [coldStartCount, setColdStartCount] = useState(1);
    const [reviewList, setReviewList] = useState<PropertyReview[]>(initialReviews);
    const [reviewCount, setReviewCount] = useState(initialCount);

    useEffect(() => {
        if (coldStartCount === 1) {
            setColdStartCount((prevState) => prevState - 1);
            (async () => {
                await reviewsStore.getReviewsByProperty(propertyId, { page: currentPage });
                setReviewList(reviewsStore.reviewsByProperty.items);
                setReviewCount(reviewsStore.reviewsByProperty.count);
            })();
            return;
        } else {
            scrollToElement('scrollTo', -200);
            (async () => {
                await reviewsStore.getReviewsByProperty(propertyId, { page: currentPage });
                setReviewList(reviewsStore.reviewsByProperty.items);
                setReviewCount(reviewsStore.reviewsByProperty.count);
            })();
        }
    }, [currentPage]);

    return (
        <>
            <h3 className="h5-style mb-half">
                {reviewCount} Review{reviewCount === 1 ? '' : 's'}
            </h3>
            <div className="pdd-average-score mb">
                {averageRating && averageRating > 0 ? (
                    <>
                        <span className="fas fa-star" />
                        <span className="score h5-style">{averageRating.toFixed(1)}</span>
                    </>
                ) : null}
            </div>
            <Element name="scrollTo" />
            <div className="pdd-reviews-listing mb-big">
                {reviewList.map((review) => (
                    <PropertyReviewItem
                        key={review.id}
                        userId={review.reservation?.guestId ?? ''}
                        profilePicture={review.reservation?.guest?.profilePicture ?? ''}
                        firstName={review.reservation?.guest?.firstName ?? ''}
                        lastName={review.reservation?.guest?.lastName ?? ''}
                        createdAt={review.createdAt}
                        overallExperience={review.overallRating ?? 0}
                        overallReview={review.overallReview ?? ''}
                    />
                ))}
            </div>
            {reviewCount > 5 ? (
                <FrontPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalRecords={reviewCount}
                    rowsPerPage={5}
                    customPaginatorTemplate={paginatorTemplate}
                    useCustomChangePage
                />
            ) : null}
        </>
    );
});

export default PropertyReviews;
