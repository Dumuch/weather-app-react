import { FC } from 'react';
import { PropertyReview } from '../../../../../models/api';
import { concatString } from '../../../../../utils/helpers';
import Stayed from '../../../../../../public/assets/img/stayed.svg';
import Image from 'next/image';

interface Props {
    review: PropertyReview;
}

const ReviewCard: FC<Props> = ({ review }) => {
    return (
        <div className="item">
            <div className="textbox">
                <blockquote>
                    <p>{review.overallReview}</p>
                    <footer>
                        {concatString([
                            review.reservation?.guest?.firstName ?? '',
                            `${review.reservation?.guest?.lastName[0]}.` ?? '',
                        ])}
                    </footer>
                </blockquote>
            </div>
            <div className="stayed">
                <Image src={Stayed} alt="Stayed" /> at {review.reservation?.property?.name}
            </div>
        </div>
    );
};

export default ReviewCard;
