import React, { FunctionComponent, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import PropertyListFilterSection from './filter';
import PropertyListSectionCard from './card';
import PropertyListMapSection from './map';
import { useStores } from '../../../../../store';
import FrontPagination from '../../../Global/pagination';
import FrontSkeleton from '../../../Global/skeleton';
import { normalizeQuery, scrollToElement, searchQuery } from '../../../../../utils/helpers';
import { Element } from 'react-scroll';
import { useScroll } from '../../../../../utils/useScroll';
import { useRouter } from 'next/router';
import { FrontRoutesList } from '../../FrontRoutesList';
import OutsideClickHandler from 'react-outside-click-handler';
import { orderList } from '../../../../../store/stores/propertiesStore';
import { appConfig } from '../../../../../config/app';

const PropertyListSection: FunctionComponent = observer(() => {
    const router = useRouter();
    const { hasScrolled } = useScroll();
    const { propertiesStore, globalStore } = useStores();
    const [listingTop, setListingTop] = useState(0);
    const [mapTop, setMapTop] = useState(0);
    const [mapBottom, setMapBottom] = useState(0);
    const [isVisibleOrderList, setIsVisibleOrderList] = useState(false);

    const updateSearchParams = async (e: PopStateEvent) => {
        if (e.state.as.includes(FrontRoutesList.Properties)) {
            router.reload();
            scrollToElement('scrollTo', -500);
        }
    };

    useEffect(() => {
        window.addEventListener('popstate', updateSearchParams);
        return () => {
            window.removeEventListener('popstate', updateSearchParams);
        };
    }, []);

    const calculateMapBottom = (footer: HTMLElement | null) => {
        if (footer) {
            const wt = window.scrollY;
            const wh = window.innerHeight;
            const et = footer.offsetTop;
            const eh = footer.clientHeight;

            if (wt + wh >= et && wt + wh - eh * 2 <= et + (wh - eh)) {
                setMapBottom(wt + wh - et);
            } else {
                setMapBottom(0);
            }
        }
    };

    useEffect(() => {
        if (globalStore.startClient) {
            setTimeout(() => {
                const listingTop =
                    document.getElementById('catalog-filter-section')?.getBoundingClientRect().height ?? 0;
                setListingTop(listingTop);
                setMapTop((document.getElementById('header')?.getBoundingClientRect().height ?? 0) + listingTop);
                const elementFooter = document.getElementById('footer');
                document.addEventListener('scroll', () => {
                    calculateMapBottom(elementFooter);
                });
            }, 500);

            changeCurrentOrder(propertiesStore.searchComponent.order)();
        }
    }, [globalStore.startClient]);

    useEffect(() => {
        propertiesStore.setAllowManualChangeBounds(false);
        const elementFooter = document.getElementById('footer');
        calculateMapBottom(elementFooter);
    }, [propertiesStore.searchComponent.properties]);

    useEffect(() => {
        setIsVisibleOrderList(false);
        if (hasScrolled) {
            setMapTop((prevState) => prevState - 112);
        } else {
            setMapTop((prevState) => prevState + 112);
        }
    }, [hasScrolled]);

    const changeCurrentPage = (value: number) => {
        propertiesStore.setSearchComponent({
            ...propertiesStore.searchComponent,
            page: value,
        });
        getSearchPropertiesAndRouter();
    };

    const toggleOrderList = () => setIsVisibleOrderList((prevState) => !prevState);

    const changeCurrentOrder = (value: string) => {
        return () => {
            const findSort = orderList.find((item) => item.value === value);
            if (findSort) {
                propertiesStore.setSearchComponent({
                    ...propertiesStore.searchComponent,
                    page: 1,
                    obOrder: findSort,
                });
                setIsVisibleOrderList(false);
                getSearchPropertiesAndRouter();
            }
        };
    };

    const getSearchPropertiesAndRouter = async () => {
        scrollToElement('scrollTo', -500);
        const page = propertiesStore.searchComponent.page;
        const order = propertiesStore.searchComponent.obOrder?.value;
        const filter = propertiesStore.searchComponent.filters;
        let queryObject = {
            ...router.query,
            ...filter,
            ...propertiesStore.searchComponent.viewport,
            state: propertiesStore.searchComponent.state,
            page,
            order,
        };
        queryObject = normalizeQuery(queryObject);
        await router.push(
            {
                pathname: FrontRoutesList.Properties,
                query: queryObject as unknown as string,
            },
            {
                pathname: FrontRoutesList.Properties,
                query: queryObject as unknown as string,
            },
            {
                shallow: false,
            }
        );

        const data = await propertiesStore.getSearch(queryObject);
        if (data) {
            propertiesStore.setSearchComponent({
                ...propertiesStore.searchComponent,
                properties: data.rows,
                count: data.count,
                rangePrice: [appConfig.minValueForSliderFilter, appConfig.maxValueForSliderFilter],
                filters: {
                    ...propertiesStore.searchComponent.filters,
                },
            });
        }
    };
    return (
        <>
            {globalStore.startClient && <PropertyListFilterSection submitFilter={getSearchPropertiesAndRouter} />}
            <Element name="scrollTo"></Element>

            <div className="catalog-listing-section" style={{ marginTop: listingTop }}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-7">
                            <div className="catalog-listing-wrap">
                                <div className="catalog-listing-header mb">
                                    <div>
                                        <h2 className="h4-style">
                                            {propertiesStore.isLoading ? (
                                                <FrontSkeleton width={'237px'} height={'28px'} />
                                            ) : (
                                                <>
                                                    {propertiesStore.searchComponent.count > 300
                                                        ? '300+'
                                                        : propertiesStore.searchComponent.count}{' '}
                                                    properties
                                                </>
                                            )}
                                        </h2>
                                    </div>
                                    <div>
                                        <div className="dropdown slim-dropdown bbs-custom-dropdown">
                                            <button
                                                onClick={toggleOrderList}
                                                className="dropdown-toggle"
                                                type="button"
                                                id="dropdownMenuSorting"
                                                data-toggle="dropdown"
                                                aria-haspopup="true"
                                                aria-expanded="true"
                                            >
                                                {propertiesStore.searchComponent?.obOrder ? (
                                                    <>{propertiesStore.searchComponent.obOrder.name}</>
                                                ) : (
                                                    'Sort'
                                                )}
                                                <span className="icon fas fa-chevron-down"></span>
                                            </button>
                                            <div
                                                className="dropdown-menu dropdown-menu_sort-list"
                                                style={{ display: isVisibleOrderList ? 'block' : 'none' }}
                                                aria-labelledby="dropdownMenuSorting"
                                            >
                                                {isVisibleOrderList && (
                                                    <div className="wrapper-dropdown-menu">
                                                        <OutsideClickHandler
                                                            onOutsideClick={toggleOrderList}
                                                            disabled={!isVisibleOrderList}
                                                        >
                                                            <ul className="dropdown-menu__list">
                                                                {orderList.map((item) => {
                                                                    return (
                                                                        <li key={item.value}>
                                                                            <button
                                                                                onClick={changeCurrentOrder(item.value)}
                                                                            >
                                                                                {item.name}
                                                                            </button>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </OutsideClickHandler>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="catalog-listing mb">
                                    <div className="inner-wrap">
                                        {propertiesStore.searchComponent.properties.length > 0 ? (
                                            <>
                                                {propertiesStore.searchComponent.properties.map((property) => {
                                                    return (
                                                        <PropertyListSectionCard
                                                            property={property}
                                                            key={property.id}
                                                        />
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <p className={'mr-2'}>
                                                Unfortunately, no properties were found. Please change the filters or
                                                search options
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {propertiesStore.searchComponent.count > 10 && (
                                    <FrontPagination
                                        currentPage={propertiesStore.searchComponent.page}
                                        setCurrentPage={changeCurrentPage}
                                        totalRecords={propertiesStore.searchComponent.count}
                                        rowsPerPage={10}
                                        pathname={FrontRoutesList.Properties}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-5 hidden-sm hidden-xs">
                            <PropertyListMapSection mapTop={mapTop} mapBottom={mapBottom} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});
export default PropertyListSection;
