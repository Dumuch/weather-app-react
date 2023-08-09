import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import ProfileSectionPaymentAddCardModal from './modals/modalAddCard';
import { useStores } from '../../../../../../store';
import ProfileSectionPaymentDeleteCardModal from './modals/modalDeleteCard';
import { FrontButton } from '../../../../Global/button';
import ProfileSectionPaymentUpdateCardModal from './modals/modalUpdateCard';

const ProfileSectionPaymentGuest = observer(() => {
    const { userStore } = useStores();
    const [openModal, setOpenModal] = useState(false);
    const [openModalDelete, setOpenModalDelete] = useState(false);

    const toggleModal = () => setOpenModal(!openModal);
    const toggleModalDelete = () => setOpenModalDelete(!openModalDelete);

    const card = userStore.stripeCard.data;

    useEffect(() => {
        userStore.getCard();
    }, []);

    return (
        <>
            <h3 className="h6-style color-black">Your Credit Card Info </h3>
            {userStore.user?.stripeCardId && userStore.user.stripeUserId ? (
                <>
                    <div className="credit-card-wrap">
                        <div className="credit-card">
                            <div className="card-type big text-right mb-half">{card?.brand}</div>
                            <div className="color-dark-grey">Card Number</div>
                            <div className="card-number mb-half">
                                <span>****</span>
                                <span>****</span>
                                <span>****</span>
                                <span>{card?.last4}</span>
                            </div>
                            <div className="color-dark-grey">Valid thru</div>
                            <div className="card-exp">
                                {card && (card.exp_month > 9 ? card.exp_month : `0${card.exp_month}`)}/
                                {card?.exp_year.toString().slice(card.exp_year.toString().length - 2)}
                            </div>
                        </div>
                        <div className="card-options">
                            <FrontButton className="tn-primary btn-sm" onClick={toggleModal}>
                                Update
                            </FrontButton>
                            <FrontButton className="btn-border btn-sm" onClick={toggleModalDelete}>
                                Delete
                            </FrontButton>
                        </div>
                    </div>

                    <ProfileSectionPaymentUpdateCardModal
                        tooltip={
                            <>
                                To update your current card’s expiration date, <br />
                                use the form below. If you would like to use a <br />
                                different payment method, please delete this <br />
                                payment method from your “Payment Info” <br />
                                tab and enter your new card details.
                            </>
                        }
                        isOpenModal={openModal}
                        closeModalHandler={toggleModal}
                    />
                    <ProfileSectionPaymentDeleteCardModal
                        isOpenModal={openModalDelete}
                        closeModalHandler={toggleModalDelete}
                    />
                </>
            ) : (
                <>
                    <div className="textbox color-dark-grey mb">
                        <p>No credit card registered.</p>
                    </div>

                    <a className="sp-link" data-toggle="modal" data-target="#card-modal" onClick={toggleModal}>
                        <span className="icon-first fas fa-plus"></span>Add new card
                    </a>

                    <ProfileSectionPaymentAddCardModal isOpenModal={openModal} closeModalHandler={toggleModal} />
                </>
            )}
        </>
    );
});

export default ProfileSectionPaymentGuest;
