import { useStores } from '../../../../../../store';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import PropertySectionDescriptionForm from './description';
import PropertySectionDetailsForm from './details';
import { TabView, TabPanel } from 'primereact/tabview';
import { FrontButton } from '../../../../Global/button';
import PropertySectionActivateDeactivateModal from './modals/activateDeactivateModal';
import PropertySectionDeleteModal from './modals/deleteModal';
import PropertySectionPhotosForm from './photos';
import PropertySectionReservationForm from './reservation';
import PropertySectionLocation from './location';
import PropertySectionAvailability from './availability';
import { useTabView } from '../../../../../../utils/useTabView';
import { FrontRoutesList } from '../../../FrontRoutesList';

const DashboardPropertySection = observer(() => {
    const { propertiesStore, globalStore } = useStores();
    const router = useRouter();
    const { id } = router.query;
    const { activeIndex, isActiveTabClass, handlerChangeTab } = useTabView(
        5,
        [propertiesStore, id],
        id as string,
        true
    );
    const [isOpenActivateDeactivateModal, setIsOpenActivateDeactivateModal] = useState(false);
    const [isOpenDeleteModal, setIsDeleteModal] = useState(false);
    const obProperty = propertiesStore.item.item;

    useEffect(() => {
        if (id && obProperty?.id !== id) {
            propertiesStore
                .get(id as string, false, false)
                .then((data) => {})
                .catch(() => {
                    router.replace(FrontRoutesList.DashboardProperties);
                });
        }
    }, [propertiesStore, id, globalStore.isLoading]);

    const toggleActivateDeactivateModal = (isOpen: boolean) => {
        return () => setIsOpenActivateDeactivateModal(isOpen);
    };

    const toggleDeleteModal = (isOpen: boolean) => {
        return () => setIsDeleteModal(isOpen);
    };

    const hiddenStatus = () => {
        return (
            <div className="alert alert-warning mb-big">
                <p>
                    <img
                        src={'/assets/img/i-info.svg'}
                        width={18}
                        height={18}
                        className={'icon-info-alert-warning'}
                        alt={''}
                    />
                    This property is deactivated and not able to be booked. If you would like to accept bookings for
                    this property, please click the &quot;ACTIVATE&quot; button above.
                </p>
            </div>
        );
    };

    const blockedStatus = () => {
        return (
            <div className="alert alert-danger mb-big">
                <p>
                    <img
                        src={'/assets/img/i-info.svg'}
                        width={18}
                        height={18}
                        className={'icon-info-alert-warning'}
                        alt={''}
                    />
                    This property is blocked.
                </p>
            </div>
        );
    };

    return (
        <>
            <div className="main-panel">
                {obProperty && !propertiesStore.isLoading ? (
                    <>
                        <div className="block-heading align-justify mb">
                            <h2 className="h4-style title">{obProperty.name}</h2>
                            <div className="buttons-group">
                                {!obProperty.blocked && (
                                    <FrontButton
                                        className={`btn btn-sm ${obProperty.active ? 'btn-border' : 'btn-primary'}`}
                                        type={'button'}
                                        onClick={toggleActivateDeactivateModal(true)}
                                    >
                                        {obProperty.active ? 'Deactivate' : 'Activate'}
                                    </FrontButton>
                                )}
                                <FrontButton
                                    className={'btn btn-border btn-sm'}
                                    type={'button'}
                                    onClick={toggleDeleteModal(true)}
                                >
                                    Delete
                                </FrontButton>
                            </div>
                        </div>
                        {obProperty.blocked ? blockedStatus() : !obProperty.active && hiddenStatus()}
                        <div className="tabs-wrap">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className={isActiveTabClass(0)}>
                                    <button onClick={handlerChangeTab(0)}>Description</button>
                                </li>
                                <li className={isActiveTabClass(1)}>
                                    <button onClick={handlerChangeTab(1)}>Location</button>
                                </li>
                                <li className={isActiveTabClass(2)}>
                                    <button onClick={handlerChangeTab(2)}>Details</button>
                                </li>
                                <li className={isActiveTabClass(3)}>
                                    <button onClick={handlerChangeTab(3)}>Photos</button>
                                </li>
                                <li className={isActiveTabClass(4)}>
                                    <button onClick={handlerChangeTab(4)}>Reservation Process</button>
                                </li>
                                <li className={isActiveTabClass(5)}>
                                    <button onClick={handlerChangeTab(5)}>Availability</button>
                                </li>
                            </ul>

                            {activeIndex !== null && (
                                <TabView
                                    renderActiveOnly={false}
                                    activeIndex={activeIndex}
                                    onTabChange={(e) => handlerChangeTab(e.index)}
                                >
                                    <TabPanel>
                                        <PropertySectionDescriptionForm property={obProperty} />
                                    </TabPanel>
                                    <TabPanel>
                                        <PropertySectionLocation property={obProperty} />
                                    </TabPanel>
                                    <TabPanel>
                                        <PropertySectionDetailsForm property={obProperty} />
                                    </TabPanel>
                                    <TabPanel>
                                        <PropertySectionPhotosForm property={obProperty} />
                                    </TabPanel>
                                    <TabPanel>
                                        <PropertySectionReservationForm property={obProperty} />
                                    </TabPanel>
                                    <TabPanel>
                                        <PropertySectionAvailability property={obProperty} />
                                        {/*The property's availability parameters have been updated  ToDo */}
                                    </TabPanel>
                                </TabView>
                            )}
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>
            <PropertySectionActivateDeactivateModal
                isOpenModal={isOpenActivateDeactivateModal}
                closeActivateDeactivateModal={toggleActivateDeactivateModal(false)}
            />
            <PropertySectionDeleteModal isOpenModal={isOpenDeleteModal} closeDeleteModal={toggleDeleteModal(false)} />
        </>
    );
});

export default DashboardPropertySection;
