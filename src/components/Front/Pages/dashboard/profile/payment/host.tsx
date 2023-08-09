import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { StripeAccountStatusType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { FrontButton } from '../../../../Global/button';
import ModalFooter from '../../../../Global/modalFooter';
import { FrontModal } from '../../../../Global/modal';

const ProfileSectionPaymentHost = observer(() => {
    const { userStore, globalStore } = useStores();
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const pushOrCreateStripeAccount = () => {
        globalStore.setLoading(true);
        userStore.createStripeAccount().finally(() => {
            globalStore.setLoading(false);
        });
    };

    const link = (linkTitle: string) => {
        return (
            <button
                onClick={pushOrCreateStripeAccount}
                className={'button-to-link'}
                type={'button'}
                disabled={globalStore.isLoading}
            >
                {linkTitle}
            </button>
        );
    };

    const message = () => {
        switch (userStore.user?.stripeAccountStatus) {
            case StripeAccountStatusType.noCreated:
                return <p>For your properties to accept bids and bookings, create a {link('Stripe Account.')}</p>;
            case StripeAccountStatusType.inProgress:
                return (
                    <p>
                        Your connected account has not been verified. Please complete the registration process in{' '}
                        {link('Stripe.')}
                    </p>
                );
            case StripeAccountStatusType.completed:
                return (
                    <p>
                        Your Stripe connected account is created and verified. All your properties are available for
                        bidding and booking. <br /> You can manage your payment information in {link('Stripe Account.')}
                    </p>
                );
            case StripeAccountStatusType.error:
                return (
                    <>
                        <p>The error has occurred. Visit {link('Stripe')} to find out more.</p>
                        <p>
                            Click the &apos;Fetch Stripe Account&apos; button to update your connected account status
                            after correcting the error in order to make your properties available to bid and book.
                        </p>
                        <p>
                            As a last resort, you can remove the link between your connected account and BidBookStay by
                            clicking on the &apos;Delete Stripe Account&apos; button and create a new Stripe account.
                            You will have access to your old account, but new payments will appear on the new Stripe
                            account.
                        </p>
                    </>
                );
            default:
                return <p>For your properties to accept bids and bookings, create a {link('Stripe Account.')}</p>;
        }
    };

    const onDelete = async () => {
        setLoadingDelete(true);
        await userStore.deleteStripeAccount();
        setLoadingDelete(false);
        setIsVisible(false);
    };

    const toggleModal = () => setIsVisible((prevState) => !prevState);

    const onFetch = async () => {
        setLoadingFetch(true);
        await userStore.fetchStripeAccount();
        setLoadingFetch(false);
    };

    return (
        <>
            <div className="textbox color-dark-grey">
                {message()}{' '}
                {userStore.user?.stripeAccountStatus === StripeAccountStatusType.error ? (
                    <div className={'d-flex flex-wrap'}>
                        <FrontButton className={'btn-primary btn-sm mr-2'} onClick={onFetch} loading={loadingFetch}>
                            Fetch Stripe Account
                        </FrontButton>
                        <FrontButton className={'btn-primary btn-sm'} onClick={toggleModal} loading={loadingDelete}>
                            Delete Stripe Account
                        </FrontButton>
                    </div>
                ) : null}
            </div>

            <FrontModal
                visible={isVisible}
                header="Delete Stripe Account"
                position="center"
                footer={
                    <ModalFooter
                        primaryButtonText="Delete"
                        closeModalHandler={toggleModal}
                        saveHandler={onDelete}
                        isSubmitting={loadingDelete}
                    />
                }
                dismissableMask
                onHide={toggleModal}
            >
                <p>Are you sure you want to delete Stripe Account?</p>
            </FrontModal>
        </>
    );
});

export default ProfileSectionPaymentHost;
