import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import FrontFileInput from '../../../../Global/fileInput';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../../store';
import { FrontButton } from '../../../../Global/button';
import { bytesToKb, isImageFile, setErrorsMessageFormik, UseLangMessage } from '../../../../../../utils/helpers';
import { FrontModal } from '../../../../Global/modal';
import merge from 'lodash.merge';
import * as Yup from 'yup';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { File } from '../../../../../../config/validate';

interface initialValuesInterface {
    profilePictureFile: File | null;
}

interface Props {
    isOpenModal: boolean;
    closeModalChangePhoto: () => void;
}

const ProfileSectionGeneralChangePhotoForm: FunctionComponent<Props> = observer(
    ({ isOpenModal, closeModalChangePhoto }) => {
        const [error, setError] = useState<string | null>(null);
        const { userStore } = useStores();

        const onSubmit = async (
            props: initialValuesInterface,
            formikHelpers: FormikHelpers<initialValuesInterface>
        ) => {
            try {
                await userStore.updateUser(merge(userStore.user, props));
                closeModal(formikHelpers)();
            } catch {}
            formikHelpers.setSubmitting(false);
        };

        const closeModal = (formikHelpers: FormikHelpers<initialValuesInterface>) =>
            function () {
                setError(null);
                formikHelpers.resetForm();
                closeModalChangePhoto();
            };

        const renderFooter = (props: FormikProps<initialValuesInterface>) => {
            return (
                <>
                    <FrontButton
                        className={'btn-primary'}
                        type={'submit'}
                        form={'changePhotoForm'}
                        loading={props.isSubmitting}
                    >
                        SAVE
                    </FrontButton>
                    <FrontButton className={'btn-border'} type={'submit'} onClick={closeModal(props)}>
                        CANCEL
                    </FrontButton>
                </>
            );
        };

        const initialValues: initialValuesInterface = {
            profilePictureFile: null,
        };

        const validationSchema = Yup.object().shape({
            profilePictureFile: Yup.mixed()
                .required(UseLangMessage('Profile Picture', ValidationMessage.requiredFront))
                .test('fileType', UseLangMessage('Profile Picture', ValidationMessage.isNotImage), (file?: File) => {
                    if (!file) {
                        return true;
                    }
                    return file && isImageFile(file);
                })
                .test(
                    'fileSize',
                    `${UseLangMessage('Profile Picture', ValidationMessage.exceed)} ${File.maxUploadUserImageKB} KB`,
                    (file?: File) => {
                        if (!file) {
                            return true;
                        }
                        return bytesToKb(file.size) <= File.maxUploadUserImageKB;
                    }
                ),
        });

        return (
            <>
                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validateOnChange={false}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                >
                    {(props) => {
                        setErrorsMessageFormik(props.errors, setError);
                        return (
                            <FrontModal
                                header={'Change your photo'}
                                visible={isOpenModal}
                                onHide={closeModal(props)}
                                footer={renderFooter(props)}
                                dismissableMask={true}
                                position={'top'}
                            >
                                <Form id={'changePhotoForm'}>
                                    {error && (
                                        <div className="alert alert-danger mb" role="alert">
                                            {error}
                                        </div>
                                    )}
                                    <div className="textbox mb">
                                        <p>Only .jpg, .jpeg, .gif and .png files are supported.</p>
                                    </div>
                                    <div className="form_status"></div>
                                    <div className="form-group">
                                        <div className="upload-control">
                                            <div className="input-wrap has-content">
                                                <FrontFileInput
                                                    label={'Photo'}
                                                    placeholder={'No File Selected'}
                                                    value={props.values.profilePictureFile}
                                                    name={'profilePictureFile'}
                                                    setValue={props.setFieldValue}
                                                    multiple={false}
                                                    buttonName={'SELECT FILE'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Form>
                            </FrontModal>
                        );
                    }}
                </Formik>
            </>
        );
    }
);
export default ProfileSectionGeneralChangePhotoForm;
