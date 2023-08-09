import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { dateConfig } from '../../../../../../config/date';
import { UserType } from '../../../../../../models/api';
import { useStores } from '../../../../../../store';
import { getFormatData } from '../../../../../../utils/dateTime';
import { concatString, formatIntoPriceValue } from '../../../../../../utils/helpers';
import { DeclineBidModal } from '../modals';
import { FrontButton } from '../../../../Global/button';
import ApproveBidModal from '../modals/ApproveBidModal';
import { validBidStatusesFor } from '../../../../../../config/app';

export interface BidsModalsState {
    approveBid?: boolean;
    declineBid?: boolean;
    cancelBid?: boolean;
}

const BidDetailsHost = observer(() => {
    const router = useRouter();
    const { reservationsStore } = useStores();

    const [isModalVisible, setIsModalVisible] = useState<BidsModalsState>({
        approveBid: false,
        declineBid: false,
    });

    const showDeclineModal = () => setIsModalVisible((prevState) => ({ ...prevState, declineBid: true }));
    const showApproveBid = () => setIsModalVisible((prevState) => ({ ...prevState, approveBid: true }));

    useEffect(() => {
        if (!router.query.id) return;
        reservationsStore.getBid(router.query.id as string, UserType.host);
    }, [router.query.id]);

    useEffect(() => {
        if (reservationsStore.item.item && !reservationsStore.item.item.isHostRead) {
            reservationsStore
                .markBidAsRead(router.query.id as string, { userType: UserType.host })
                .then(() => reservationsStore.fetchUnreadBidsCount({ userType: UserType.host }));
        }
    }, [reservationsStore.item.item?.id]);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb-big">
                <h2 className="h4-style title">Bid Details</h2>
            </div>
            <div className="content-with-side-panel">
                <div className="col-fluid mb-big-xs">
                    <h3 className="h6-style color-black">
                        {concatString([
                            reservationsStore.item.item?.guest?.firstName ?? '',
                            reservationsStore.item.item?.guest?.lastName ?? '',
                        ])}
                    </h3>
                    <div className="sep bg-color-light-grey mb"></div>
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
                                    {formatIntoPriceValue(reservationsStore.item.item?.hostPayout ?? 0, true, true, 2)}
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
                (validBidStatusesFor.accept.includes(reservationsStore.item.item?.status?.fullName) ||
                    validBidStatusesFor.decline.includes(reservationsStore.item.item?.status?.fullName)) ? (
                    <div className="col-fixed col-bids">
                        <div className="page-controls mb-big">
                            {validBidStatusesFor.accept.includes(reservationsStore.item.item?.status?.fullName) ? (
                                <FrontButton className={'btn-primary btn-sm'} type={'button'} onClick={showApproveBid}>
                                    Accept
                                </FrontButton>
                            ) : null}
                            {validBidStatusesFor.decline.includes(reservationsStore.item.item?.status?.fullName) ? (
                                <FrontButton className="btn btn-border btn-sm" onClick={showDeclineModal}>
                                    Decline
                                </FrontButton>
                            ) : null}
                        </div>
                    </div>
                ) : null}
                <DeclineBidModal
                    reservationId={reservationsStore.item.item?.id ?? ''}
                    isVisible={isModalVisible.declineBid!}
                    setIsVisible={setIsModalVisible}
                />
                <ApproveBidModal
                    reservationId={reservationsStore.item.item?.id ?? ''}
                    isVisible={isModalVisible.approveBid!}
                    setIsVisible={setIsModalVisible}
                />
            </div>
        </div>
    );
});

export default BidDetailsHost;
