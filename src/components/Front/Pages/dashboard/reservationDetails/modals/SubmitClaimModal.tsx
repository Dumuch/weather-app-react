import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { DictionaryCode, ReservationClaimForm, UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontModal } from '../../../../Global/modal';
import { File as FileValidation } from '../../../../../../config/validate';
import { ModalsState } from '../host';
import { scrollToElement, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { FrontDropdown } from '../../../../Global/dropdown';
import FrontUploadFiles from '../../../../Global/uploadFiles';
import { FileUpload } from 'primereact/fileupload';
import bytes from 'bytes';
import { FrontFloatLabel } from '../../../../Global/floatLabel';
import { Element } from 'react-scroll';
import ModalFooter from '../../../../Global/modalFooter';

interface Props {
    reservationId: string;
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<ModalsState>>;
}

const SubmitClaimModal: FC<Props> = ({ reservationId, isVisible, setIsVisible }) => {
    const { reservationsStore, dictionaryStore } = useStores();
    const [errors, setErrors] = useState<string | null>('');
    const [success, setSuccess] = useState<string | null>('');
    const frontUploadFilesRef = useRef<FileUpload>(null);
    const initialValues: ReservationClaimForm = {
        reason: '',
        claimAmount: null,
        messageBody: '',
        photos: null,
    };
    const claimReasons = dictionaryStore.getDictionary(DictionaryCode.claimReasons);

    const validationSchema = Yup.object().shape({
        reason: Yup.string().required(UseLangMessage('Reason', ValidationMessage.requiredFront)),
        claimAmount: Yup.number()
            .typeError(
                UseLangMessage('Claim Amount', ValidationMessage.noLess).replace('{%replaceNumber%}', '1 dollar')
            )
            .required(UseLangMessage('Claim Amount', ValidationMessage.requiredFront)),
        photos: Yup.mixed().test({
            message: `You cannot upload more than ${bytes(bytes(`${FileValidation.maxUploadFilesKB}KB`), {
                unitSeparator: ' ',
            })}`,
            test: (value) => {
                let totalSize = 0;
                Object.values(value as File[]).forEach((file) => {
                    totalSize += file.size;
                });
                return totalSize < bytes(`${FileValidation.maxUploadFilesKB}KB`);
            },
        }),
        messageBody: Yup.string().required(UseLangMessage('Message', ValidationMessage.requiredFront)),
    });

    const uploadFiles = (files: File[], props: FormikProps<ReservationClaimForm>) => {
        props.setFieldValue('photos', files);
    };

    const handlerErrorFileUpload = (file: File | null, props: FormikProps<ReservationClaimForm>) => {
        if (file && file.size > bytes(`${FileValidation.maxUploadFileKB}KB`)) {
            props.setErrors({ ...props.errors, photos: `Max file size ${FileValidation.maxUploadFileKB} KB` });
        } else {
            setErrors(null);
        }
    };

    const sendClaim = async (values: ReservationClaimForm, formikHelpers: FormikHelpers<ReservationClaimForm>) => {
        setErrors(null);
        setSuccess(null);
        try {
            await reservationsStore.submitClaim(reservationId, values);
            frontUploadFilesRef.current?.clear();
            formikHelpers.resetForm();
            await reservationsStore.get(reservationId, UserType.host);
            setSuccess('The claim request has been submitted successfully');
        } catch (e) {
        } finally {
            formikHelpers.setSubmitting(false);
        }
    };

    const hideModal = (props?: FormikProps<ReservationClaimForm>) => {
        setIsVisible((prevState) => ({ ...prevState, submitClaim: false }));
        props?.resetForm();
    };

    const onHide = (props?: FormikProps<ReservationClaimForm>) => () => {
        if (!props?.isSubmitting) {
            setErrors(null);
            setSuccess(null);
            hideModal(props);
        }
    };

    useEffect(() => {
        dictionaryStore.fetchList();
    }, [dictionaryStore, dictionaryStore.isLoading]);

    useEffect(() => {
        if (errors?.length || success?.length) {
            scrollToElement('notificationScrollToElement', -100, 1000, 'claimModal_content');
        }
    }, [errors, success]);
    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={sendClaim}
            validationSchema={validationSchema}
            validateOnChange={false}
        >
            {(props) => {
                setErrorsMessageFormik(props.errors, setErrors);
                return (
                    <FrontModal
                        visible={isVisible}
                        header="Submit Claim"
                        className="sumbit-claim-modal"
                        position="center"
                        dismissableMask
                        onHide={onHide(props)}
                        id="claimModal"
                        footer={
                            <ModalFooter<ReservationClaimForm>
                                formId="claimForm"
                                primaryButtonText={'Send'}
                                closeModalHandler={onHide(props)}
                                isSubmitting={props.isSubmitting}
                                resetForm={props.resetForm}
                                success={success}
                            />
                        }
                    >
                        {success ? (
                            <FrontNotificationField alertType={AlertType.success} message={success} />
                        ) : (
                            <>
                                <Element name="notificationScrollToElement" />
                                <FrontNotificationField alertType={AlertType.danger} message={errors} />
                                <Form className="form-wrap" id="claimForm">
                                    <div className="row mb">
                                        <div className="col-sm-6 mb-xs">
                                            <div className="form-group">
                                                <FrontDropdown
                                                    id="reason"
                                                    name="reason"
                                                    value={props.values.reason}
                                                    options={claimReasons}
                                                    optionValue="fullName"
                                                    optionLabel="fullName"
                                                    label="Reason"
                                                    handlerDropdown={props.handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-6 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    label={'Claim Amount'}
                                                    value={props.values.claimAmount ?? ''}
                                                    name={'claimAmount'}
                                                    onChange={props.handleChange}
                                                    type={InputType.currency}
                                                    required={true}
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb">
                                        <div className="col-sm-12 mb-xs">
                                            <div className="form-group">
                                                <FrontInput
                                                    id="messageBody"
                                                    name="messageBody"
                                                    type={InputType.textarea}
                                                    label="Message"
                                                    value={props.values.messageBody}
                                                    onChange={props.handleChange}
                                                    classWrapper="opaque-label"
                                                    required={true}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="h5-style mb-half">Photos</h4>
                                    <div className="textbox mb">
                                        <p>Please upload photo evidence for reason of claim.</p>
                                    </div>
                                    <div className="images-control mb-big">
                                        <FrontUploadFiles
                                            name={'photos[]'}
                                            frontUploadFilesRef={frontUploadFilesRef}
                                            setValue={(e) => uploadFiles(e, props)}
                                            customUpload={false}
                                            isResetCounter
                                            setErrorFile={(file) => handlerErrorFileUpload(file, props)}
                                            maxFileSizeKB={FileValidation.maxUploadFileKB}
                                            maxUploadFilesKB={FileValidation.maxUploadFilesKB}
                                        />
                                    </div>
                                </Form>
                            </>
                        )}
                    </FrontModal>
                );
            }}
        </Formik>
    );
};

export default SubmitClaimModal;
