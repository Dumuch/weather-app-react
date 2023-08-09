import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { validBidStatusesFor } from '../../../../../../config/app';
import { dateConfig } from '../../../../../../config/date';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { getFormatData } from '../../../../../../utils/dateTime';
import { formatIntoPriceValue } from '../../../../../../utils/helpers';
import { FrontButton } from '../../../../Global/button';
import { BidsModalsState } from '../host';
import { CancelBidModal } from '../modals';

const BidDetailsGuest = observer(() => {
    const router = useRouter();
    const { reservationsStore } = useStores();

    const [isModalVisible, setIsModalVisible] = useState<BidsModalsState>({
        cancelBid: false,
    });

    const showCancelBidModal = () => setIsModalVisible((prevState) => ({ ...prevState, cancelBid: true }));

    useEffect(() => {
        if (!router.query.id) return;
        reservationsStore.getBid(router.query.id as string, UserType.guest);
    }, [router.query.id]);

    useEffect(() => {
        if (reservationsStore.item.item && !reservationsStore.item.item.isGuestRead) {
            reservationsStore
                .markBidAsRead(router.query.id as string, { userType: UserType.guest })
                .then(() => reservationsStore.fetchUnreadBidsCount({ userType: UserType.guest }));
        }
    }, [reservationsStore.item.item?.id]);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">Bid Details</h2>
            </div>
            <div className="content-with-side-panel">
                <div className="col-fluid mb-big-xs">
                    <h3 className="h6-style color-black">{reservationsStore.item.item?.property?.name}</h3>
                    <div className="row mb">
                        <div className="col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Check-in - Check-out</div>
                                <div>
                                    <span className="nobr">
                                        {getFormatData(
                                            reservationsStore.item.item?.checkIn,
                                            dateConfig.formats.localizedDate,
                                            true
                                        )}
                                    </span>{' '}
                                    -{' '}
                                    <span className="nobr">
                                        {getFormatData(
                                            reservationsStore.item.item?.checkOut,
                                            dateConfig.formats.localizedDate,
                                            true
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Number of Guests</div>
                                <div>{reservationsStore.item.item?.numberOfGuests}</div>
                            </div>
                        </div>
                    </div>
                    <div className="row mb">
                        <div className="col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Property Nightly Cost</div>
                                <div>
                                    {formatIntoPriceValue(
                                        reservationsStore.item.item?.nightlyPropertyCost ?? 0,
                                        true,
                                        true,
                                        2
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Bid Nightly Amount</div>
                                <div>
                                    {formatIntoPriceValue(
                                        reservationsStore.item.item?.nightlyBidAmount ?? 0,
                                        true,
                                        true,
                                        2
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mb">
                        <div className="col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Total Bid Amount</div>
                                <div>
                                    {formatIntoPriceValue(reservationsStore.item.item?.total ?? 0, true, true, 2)}
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 mb-xs">
                            <div className="info-block">
                                <div className="info-label color-dark-grey">Bid Expiration</div>
                                <div>
                                    {getFormatData(
                                        reservationsStore.item.item?.bidExpiration,
                                        dateConfig.formats.dateWithoutSeconds,
                                        false
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {reservationsStore.item.item?.status?.fullName &&
                validBidStatusesFor.cancel.includes(reservationsStore.item.item?.status?.fullName) ? (
                    <div className="col-fixed">
                        <div className="page-controls mb-big">
                            <FrontButton className="btn-primary btn-sm" type="button" onClick={showCancelBidModal}>
                                Cancel Bid
                            </FrontButton>
                        </div>
                    </div>
                ) : null}
                <CancelBidModal
                    reservationId={reservationsStore.item.item?.id ?? ''}
                    isVisible={isModalVisible.cancelBid!}
                    setIsVisible={setIsModalVisible}
                />
            </div>
        </div>
    );
});

export default BidDetailsGuest;
