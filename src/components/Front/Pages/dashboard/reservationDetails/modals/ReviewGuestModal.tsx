import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { GuestReview, GuestReviewPayload } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontModal } from '../../../../Global/modal';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { ModalsState } from '../host';
import { Rating } from 'primereact/rating';
import { Element } from 'react-scroll';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    reservationId: string;
    guestReview?: GuestReview | null;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

const ReviewGuestModal: FC<Props> = ({ reservationId, guestReview, isVisible, setIsVisible }) => {
    const { reviewsStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: GuestReviewPayload = {
        overallRating: guestReview?.overallRating ?? undefined,
        followedRules: guestReview?.followedRules ?? undefined,
        cleanliness: guestReview?.cleanliness ?? undefined,
        overallReview: guestReview?.overallReview ?? '',
    };

    const validationSchema = Yup.object().shape({
        overallRating: Yup.number().required(UseLangMessage('Overall Rating', ValidationMessage.requiredFront)),
        followedRules: Yup.number().required(UseLangMessage('Followed house rules', ValidationMessage.requiredFront)),
        cleanliness: Yup.number().required(UseLangMessage('Cleanliness', ValidationMessage.requiredFront)),
        overallReview: Yup.string().required(UseLangMessage('Message', ValidationMessage.requiredFront)),
    });

    const reviewGuest = async (values: GuestReviewPayload, formikHelpers: FormikHelpers<GuestReviewPayload>) => {
        setErrors(null);
        try {
            await reviewsStore.reviewGuest(values, { reservationId });
            setSuccess('The review has been submitted successfully');
        } catch (e) {
        } finally {
            formikHelpers.resetForm();
        }
    };

    const hideModal = (props?: FormikProps<GuestReviewPayload>) => {
        setIsVisible((prevState) => ({ ...prevState, reviewGuest: false }));
        props?.resetForm();
    };

    const onHide = (props?: FormikProps<GuestReviewPayload>) => () => {
        if (!props?.isSubmitting) {
            setErrors(null);
            setSuccess(null);
            hideModal(props);
        }
    };

    useEffect(() => {
        if (errors?.length || success?.length) {
            scrollToElement('notificationScrollToElement', -100, 1000, 'reviewModal_content');
        }
    }, [errors, success]);

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={reviewGuest}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Review the Guest"
                        className="review-guest-modal"
                        position="center"
                        dismissableMask
                        id="reviewModal"
                        onHide={onHide(props)}
                        footer={
                            <ModalFooter<GuestReviewPayload>
                                formId="reviewForm"
                                primaryButtonText={'Send'}
                                closeModalHandler={onHide(props)}
                                isSubmitting={props.isSubmitting}
                                resetForm={props.resetForm}
                                saveButtonVisible={!success}
                                secondaryButtonText={success ? 'Close' : 'Cancel'}
                            />
                        }
                    >
                        <Form id="reviewForm">
                            <Element name="notificationScrollToElement" />
                            <FrontNotificationField alertType={AlertType.danger} message={errors} />
                            {!errors ? (
                                <FrontNotificationField alertType={AlertType.success} message={success} />
                            ) : null}
                            <div className="rating-control mb">
                                <div className="item">
                                    <label className="item-label required">Overall Rating</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.overallRating}
                                            name="overallRating"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">Cleanliness</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.cleanliness}
                                            name="cleanliness"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">Followed house rules</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.followedRules}
                                            name="followedRules"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-wrap">
                                    <FrontInput
                                        id="overallReview"
                                        name="overallReview"
                                        type={InputType.textarea}
                                        label="Message"
                                        required
                                        value={props.values.overallReview}
                                        onChange={props.handleChange}
                                        classWrapper="opaque-label"
                                    />
                                </div>
                            </div>
                        </Form>
                    </FrontModal>
                );
            }}
        </Formik>
    );
};

export default ReviewGuestModal;
