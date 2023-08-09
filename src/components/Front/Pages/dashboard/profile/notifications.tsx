import React, { FunctionComponent, useState } from 'react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { NotificationsType, UserType } from '../../../../../models/api';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../../../../store';
import { Dropdown } from 'primereact/dropdown';
import { FrontButton } from '../../../Global/button';
import { getNotificationsType } from '../../../../../utils/helpers';
import FrontSwitch from '../../../Global/switch';

interface initialValuesInterface {
    id: string;
    bidCanceled: boolean;
    bidPlaced: boolean;
    bidPlacedType: NotificationsType;
    newMessageReceived: boolean;
    newReservation: boolean;
    rateYourGuest: boolean;
    reservationCanceled: boolean;
    reservationConfirmation: boolean;
    reservationReminder: boolean;
    bidAcceptedType: NotificationsType;
    bidDeclinedType: NotificationsType;
    bidExpiredType: NotificationsType;
    bidExpired: boolean;
    reservationDeclined: boolean;
    reservationCanceledHost: boolean;
    rateYourStay: boolean;
}

interface Props {}

const ProfileSectionNotificationsForm: FunctionComponent<Props> = observer(() => {
    const [error, setError] = useState<string | null>(null);
    const [onlyRead, setOnlyRead] = useState(true);
    const { userStore } = useStores();
    const notifications = userStore.user?.userSetting;

    const resetForm = (props: FormikProps<initialValuesInterface>) =>
        function () {
            setOnlyRead(true);
            props.resetForm();
            setError(null);
        };
    const activeForm = () => setOnlyRead(false);

    const onSubmit = async (props: initialValuesInterface, formikHelpers: FormikHelpers<initialValuesInterface>) => {
        setError(null);

        if (error) {
            return;
        }
        const obUser = userStore.user;
        if (obUser) {
            await userStore.updateSettings(props).then(() => setOnlyRead(true));
        }

        formikHelpers.setSubmitting(false);
    };
    const initialValues: initialValuesInterface = {
        id: notifications?.id ?? '',
        bidCanceled: notifications?.bidCanceled ?? true,
        bidPlaced: notifications?.bidPlaced ?? true,
        bidPlacedType: notifications?.bidPlacedType ?? NotificationsType.email,
        newMessageReceived: notifications?.newMessageReceived ?? true,
        newReservation: notifications?.newReservation ?? true,
        rateYourGuest: notifications?.rateYourGuest ?? true,
        reservationCanceled: notifications?.reservationCanceled ?? true,
        reservationConfirmation: notifications?.reservationConfirmation ?? true,
        reservationReminder: notifications?.reservationReminder ?? true,
        bidAcceptedType: notifications?.bidAcceptedType ?? NotificationsType.email,
        bidDeclinedType: notifications?.bidDeclinedType ?? NotificationsType.email,
        bidExpiredType: notifications?.bidExpiredType ?? NotificationsType.email,
        bidExpired: notifications?.bidExpired ?? true,
        reservationDeclined: notifications?.reservationDeclined ?? true,
        reservationCanceledHost: notifications?.reservationCanceledHost ?? true,
        rateYourStay: notifications?.rateYourStay ?? true,
    };
    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize={true} validateOnChange={false}>
            {(props) => {
                return (
                    <>
                        {error && (
                            <div className="alert alert-danger mb" role="alert">
                                {error}
                            </div>
                        )}
                        <Form method="post" className={'mb-big'} id={'notificationForm'}>
                            {userStore.activeType === UserType.host ? (
                                <table className="table notifications-settings-table responsive-table">
                                    <thead>
                                        <tr>
                                            <th>Notification</th>
                                            <th>Status</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td data-th="Notification">Bid Placed</td>
                                            <td data-th="Status">
                                                <FrontSwitch
                                                    readonly={onlyRead}
                                                    value={props.values.bidPlaced}
                                                    setValue={props.handleChange}
                                                    name={'bidPlaced'}
                                                />
                                            </td>
                                            <td data-th="Type">
                                                <div className="form-group">
                                                    <Dropdown
                                                        disabled={onlyRead}
                                                        optionLabel="name"
                                                        optionValue="code"
                                                        value={props.values.bidPlacedType}
                                                        options={getNotificationsType()}
                                                        onChange={props.handleChange}
                                                        name="bidPlacedType"
                                                        className={'select-wrap'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Bid Cancelled</td>
                                            <td data-th="Status">
                                                <FrontSwitch
                                                    readonly={onlyRead}
                                                    value={props.values.bidCanceled}
                                                    setValue={props.handleChange}
                                                    name={'bidCanceled'}
                                                />
                                            </td>
                                            <td data-th="Type">System message center</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Reminder</td>
                                            <td data-th="Status">
                                                <FrontSwitch
                                                    readonly={onlyRead}
                                                    value={props.values.reservationReminder}
                                                    setValue={props.handleChange}
                                                    name={'reservationReminder'}
                                                />
                                            </td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">New Message Received</td>
                                            <td data-th="Status">
                                                <FrontSwitch
                                                    readonly={onlyRead}
                                                    value={props.values.newMessageReceived}
                                                    setValue={props.handleChange}
                                                    name={'newMessageReceived'}
                                                />
                                            </td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">New Reservation</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Confirmation</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Cancelled (by Guest)</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Rate Your Guest</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : (
                                <table className="table notifications-settings-table responsive-table">
                                    <thead>
                                        <tr>
                                            <th>Notification</th>
                                            <th>Status</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td data-th="Notification">Bid Accepted</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">
                                                <div className="form-group">
                                                    <Dropdown
                                                        disabled={onlyRead}
                                                        optionLabel="name"
                                                        optionValue="code"
                                                        value={props.values.bidAcceptedType}
                                                        options={getNotificationsType()}
                                                        onChange={props.handleChange}
                                                        name="bidAcceptedType"
                                                        className={'select-wrap'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Bid Declined</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">
                                                <div className="form-group">
                                                    <Dropdown
                                                        disabled={onlyRead}
                                                        optionLabel="name"
                                                        optionValue="code"
                                                        value={props.values.bidDeclinedType}
                                                        options={getNotificationsType([NotificationsType.sms])}
                                                        onChange={props.handleChange}
                                                        name="bidDeclinedType"
                                                        className={'select-wrap'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Bid Expired</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">
                                                <div className="form-group">
                                                    <Dropdown
                                                        disabled={onlyRead}
                                                        optionLabel="name"
                                                        optionValue="code"
                                                        value={props.values.bidExpiredType}
                                                        options={getNotificationsType([NotificationsType.sms])}
                                                        onChange={props.handleChange}
                                                        name="bidExpiredType"
                                                        className={'select-wrap'}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Reminder</td>
                                            <td data-th="Status">
                                                <FrontSwitch
                                                    readonly={onlyRead}
                                                    value={props.values.reservationConfirmation}
                                                    setValue={props.handleChange}
                                                    name={'reservationConfirmation'}
                                                />
                                            </td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">New Message Received</td>
                                            <td data-th="Status">
                                                <FrontSwitch
                                                    readonly={onlyRead}
                                                    value={props.values.newMessageReceived}
                                                    setValue={props.handleChange}
                                                    name={'newMessageReceived'}
                                                />
                                            </td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Confirmation</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Declined</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Reservation Cancelled (by Host)</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                        <tr>
                                            <td data-th="Notification">Rate Your Stay</td>
                                            <td data-th="Status">&nbsp;</td>
                                            <td data-th="Type">Email</td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </Form>
                        <div className="form-footer">
                            {onlyRead ? (
                                <FrontButton className={'btn-primary'} type={'button'} onClick={activeForm}>
                                    Edit information
                                </FrontButton>
                            ) : (
                                <>
                                    <div>
                                        <FrontButton
                                            className={'btn-primary'}
                                            type={'submit'}
                                            loading={props.isSubmitting}
                                            form="notificationForm"
                                        >
                                            SAVE CHANGES
                                        </FrontButton>
                                    </div>
                                    <div>
                                        <FrontButton
                                            className={'btn-border'}
                                            type={'button'}
                                            onClick={resetForm(props)}
                                        >
                                            CANCEL
                                        </FrontButton>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                );
            }}
        </Formik>
    );
});
export default ProfileSectionNotificationsForm;
