import classnames from 'classnames';
import { FormikState } from 'formik';
import { observer } from 'mobx-react-lite';
import { FrontButton } from './button';

interface Props<T = any> {
    formId?: string;
    isSubmitting?: boolean;
    isLoading?: boolean;
    isCancelLoading?: boolean;
    success?: string | boolean | null;
    primaryButtonClassName?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    secondaryButtonClassName?: string;
    utilityButtonText?: string;
    utilityButtonClassName?: string;
    saveButtonVisible?: boolean;
    closeButtonVisible?: boolean;
    utilityButtonVisible?: boolean;
    closeModalHandler?: () => void;
    saveHandler?: () => void;
    utilityButtonHandler?: () => void;
    resetForm?: (nextState?: Partial<FormikState<T>> | undefined) => void;
}

const ModalFooter: <T>(props: Props<T>) => React.ReactElement | null = observer(
    ({
        formId = '',
        isSubmitting = false,
        isLoading = false,
        isCancelLoading = false,
        success = '',
        primaryButtonClassName = '',
        primaryButtonText = 'Submit',
        secondaryButtonClassName = '',
        secondaryButtonText = 'CANCEL',
        utilityButtonClassName = '',
        utilityButtonText = 'OK',
        saveButtonVisible = true,
        closeButtonVisible = true,
        utilityButtonVisible = false,
        closeModalHandler,
        saveHandler,
        utilityButtonHandler,
        resetForm,
    }) => {
        const onCloseClick = () => {
            closeModalHandler && closeModalHandler();
            resetForm && resetForm();
        };

        const onSaveClick = () => {
            saveHandler && saveHandler();
        };

        const onUtilityClick = () => {
            utilityButtonHandler && utilityButtonHandler();
        };

        return (
            <>
                {!success ? (
                    <>
                        {saveButtonVisible ? (
                            <FrontButton
                                className={classnames('btn-primary', primaryButtonClassName)}
                                type="submit"
                                onClick={onSaveClick}
                                form={formId}
                                loading={isSubmitting}
                            >
                                {primaryButtonText}
                            </FrontButton>
                        ) : null}
                        {utilityButtonVisible ? (
                            <FrontButton
                                className={classnames('btn-default', utilityButtonClassName)}
                                type="button"
                                onClick={onUtilityClick}
                                loading={isLoading}
                            >
                                {utilityButtonText}
                            </FrontButton>
                        ) : null}
                        {closeButtonVisible ? (
                            <FrontButton
                                className={classnames('btn-border', secondaryButtonClassName)}
                                type="reset"
                                onClick={onCloseClick}
                                disabled={isCancelLoading}
                            >
                                {secondaryButtonText}
                            </FrontButton>
                        ) : null}
                    </>
                ) : null}
            </>
        );
    }
);

export default ModalFooter;
