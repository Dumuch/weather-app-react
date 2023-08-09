import React, { FunctionComponent } from 'react';
import ProfileSectionPaymentGuest from './guest';
import { useStores } from '../../../../../../store';
import { UserType } from '../../../../../../models/api';
import ProfileSectionPaymentHost from './host';

const ProfileSectionPayment: FunctionComponent = () => {
    const { userStore } = useStores();

    return (
        <>{userStore.activeType === UserType.guest ? <ProfileSectionPaymentGuest /> : <ProfileSectionPaymentHost />}</>
    );
};

export default ProfileSectionPayment;
