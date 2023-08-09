import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useStores } from '../../../../../../store';
import DashboardPropertiesSectionCard from './item';
import { FrontRoutesList } from '../../../FrontRoutesList';
import Link from 'next/link';
import { ProgressSpinner } from 'primereact/progressspinner';

const DashboardPropertiesSection = observer(() => {
    const { userStore } = useStores();

    useEffect(() => {
        if (userStore.isFetched && !userStore.properties.isLoading && !userStore.properties.isFetched) {
            userStore.properties.isLoading = true;
            userStore
                .fetchUser({ properties: true })
                .then(() => {
                    userStore.properties.items = userStore.user!.properties!;
                    userStore.properties.isFetched = true;
                })
                .catch()
                .finally(() => {
                    userStore.properties.isLoading = false;
                });
        }
    }, [userStore, userStore.isFetched]);

    return (
        <div className="main-panel">
            <div className="block-heading align-justify mb">
                <h2 className="h4-style title">Properties</h2>
                <Link href={FrontRoutesList.DashboardPropertiesCreate}>
                    <a className="btn btn-primary btn-sm">
                        <span className="icon-first fas fa-plus"></span>Add new property
                    </a>
                </Link>
            </div>
            <div className="properties-listing mb-big">
                {userStore.properties.isLoading && (
                    <ProgressSpinner className={'progress-spinner'} animationDuration={'1.4s'} />
                )}
                {userStore.properties.items?.length > 0 ? (
                    <>
                        {userStore.properties.items
                            .slice(0)
                            .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
                            .map((item) => (
                                <DashboardPropertiesSectionCard property={item} key={item.id} />
                            ))}
                    </>
                ) : (
                    <p>No properties found</p>
                )}
            </div>
        </div>
    );
});

export default DashboardPropertiesSection;
