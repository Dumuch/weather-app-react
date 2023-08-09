import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { PropertyReview, PropertyReviewPayload } from '../../../../../../models/api';
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
    propertyReview?: PropertyReview | null;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

const ReviewPropertyModal: FC<Props> = ({ reservationId, propertyReview, isVisible, setIsVisible }) => {
    const { reviewsStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const initialValues: PropertyReviewPayload = {
        overallExperience: propertyReview?.overallExperience ?? undefined,
        responseTime: propertyReview?.responseTime ?? undefined,
        availabilityDuringStay: propertyReview?.availabilityDuringStay ?? undefined,
        overallRating: propertyReview?.overallRating ?? undefined,
        cleanliness: propertyReview?.cleanliness ?? undefined,
        propertyIsAdvertised: propertyReview?.propertyIsAdvertised ?? undefined,
        checkInProcess: propertyReview?.checkInProcess ?? undefined,
        location: propertyReview?.location ?? undefined,
        recommendProperty: propertyReview?.recommendProperty ?? undefined,
        overallReview: propertyReview?.overallReview ?? '',
    };

    const validationSchema = Yup.object().shape({
        overallExperience: Yup.number().required(UseLangMessage('Overall Experience', ValidationMessage.requiredFront)),
        responseTime: Yup.number().required(
            UseLangMessage('Response Time/Communication', ValidationMessage.requiredFront)
        ),
        availabilityDuringStay: Yup.number().required(
            UseLangMessage('Availability/Host Accessibility During Stay', ValidationMessage.requiredFront)
        ),
        overallRating: Yup.number().required(UseLangMessage('Overall Rating', ValidationMessage.requiredFront)),
        cleanliness: Yup.number().required(UseLangMessage('Cleanliness', ValidationMessage.requiredFront)),
        propertyIsAdvertised: Yup.number().required(
            UseLangMessage('Property is as advertised', ValidationMessage.requiredFront)
        ),
        checkInProcess: Yup.number().required(UseLangMessage('Check-in Process', ValidationMessage.requiredFront)),
        location: Yup.number().required(UseLangMessage('Location', ValidationMessage.requiredFront)),
        recommendProperty: Yup.number().required(
            UseLangMessage('Would you recommend this property?', ValidationMessage.requiredFront)
        ),
        overallReview: Yup.string().required(UseLangMessage('Message', ValidationMessage.requiredFront)),
    });

    const reviewProperty = async (
        values: PropertyReviewPayload,
        formikHelpers: FormikHelpers<PropertyReviewPayload>
    ) => {
        setErrors(null);
        try {
            await reviewsStore.reviewProperty(values, { reservationId });
            setSuccess('The review has been submitted successfully');
        } catch (e) {
        } finally {
            formikHelpers.resetForm();
        }
    };

    const hideModal = (props?: FormikProps<PropertyReviewPayload>) => {
        setIsVisible((prevState) => ({ ...prevState, reviewProperty: false }));
        props?.resetForm();
    };

    const onHide = (props?: FormikProps<PropertyReviewPayload>) => () => {
        if (!props?.isSubmitting) {
            setSuccess(null);
            setErrors(null);
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
            onSubmit={reviewProperty}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Host and Property Review"
                        className="review-property-modal"
                        position="center"
                        dismissableMask
                        id="reviewModal"
                        onHide={onHide(props)}
                        footer={
                            <ModalFooter<PropertyReviewPayload>
                                formId="reviewForm"
                                closeModalHandler={onHide(props)}
                                primaryButtonText={'Send'}
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
                                <h4 className="h6-style subtitle color-black">Host Review</h4>
                                <div className="item">
                                    <label className="item-label required">Overall Experience</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.overallExperience}
                                            name="overallExperience"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">Response Time/Communication</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.responseTime}
                                            name="responseTime"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">
                                        Availability/Host Accessibility During Stay
                                    </label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.availabilityDuringStay}
                                            name="availabilityDuringStay"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <h4 className="h6-style subtitle color-black">Property Review</h4>
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
                                    <label className="item-label required">Property is as advertised</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.propertyIsAdvertised}
                                            name="propertyIsAdvertised"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">Check-in Process</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.checkInProcess}
                                            name="checkInProcess"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">Location</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.location}
                                            name="location"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                                <div className="item">
                                    <label className="item-label required">Would you recommend this property?</label>
                                    <div className="control">
                                        <Rating
                                            value={props.values.recommendProperty}
                                            name="recommendProperty"
                                            onChange={props.handleChange}
                                            cancel={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <h4 className="h6-style mb-half color-black">Overall Feedback</h4>
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

export default ReviewPropertyModal;
