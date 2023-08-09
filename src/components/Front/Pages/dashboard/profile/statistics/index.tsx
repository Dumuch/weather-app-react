import React, { FunctionComponent, useEffect, useState } from 'react';
import { useStores } from '../../../../../../store';
import { FrontDropdown } from '../../../../Global/dropdown';
import { observer } from 'mobx-react-lite';
import { MonthNameList } from '../../../../../../lang/en/month';
import format from 'date-fns/format';

const ProfileSectionStatistics: FunctionComponent = observer(() => {
    const [activeProperty, setActiveProperty] = useState('');
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

    useEffect(() => {
        propertyList.length > 0 && setActiveProperty(propertyList[0].id);
    }, [userStore.properties.items]);

    const propertyList = userStore.properties.items
        ? userStore.properties.items.slice().sort((a, b) => (a.name < b.name ? -1 : 1))
        : [];
    const obProperty = propertyList.find((property) => activeProperty === property.id);
    const listRate: { mothName: string; value: number }[] = [];
    const listRevenue: { mothName: string; value: number }[] = [];

    if (obProperty?.propertyStatistics) {
        const obStatisticList = obProperty?.propertyStatistics.filter(
            (item) => item.year === Number(format(new Date(), 'yyyy'))
        );
        const arrMonthIndex = Object.keys(MonthNameList).reverse();

        arrMonthIndex.forEach((key) => {
            const obStatistic = obStatisticList.find((item) => item.monthIndex === Number(key));
            if (obStatistic && obStatistic.occupancy && obStatistic.revenue) {
                listRate.push({
                    mothName: MonthNameList[Number(key)].name,
                    value: obStatistic.occupancy,
                });

                listRevenue.push({
                    mothName: MonthNameList[Number(key)].name,
                    value: obStatistic.revenue,
                });
            }
        });
    }

    let maxRevenue = 0;
    listRevenue.forEach((item) => {
        maxRevenue = maxRevenue + item.value;
    });

    return (
        <form>
            <div className="stat-filter mb-big">
                <div className="row">
                    <div className="col-lg-5 col-md-6 col-sm-6">
                        <div className="form-group">
                            <FrontDropdown
                                optionValue={'id'}
                                optionLabel={'name'}
                                label={'Property Name'}
                                id={'propertyDropDown'}
                                value={activeProperty}
                                options={propertyList}
                                handlerDropdown={(e) => setActiveProperty(e.target.value)}
                                name={'propertyDropDown'}
                            />
                        </div>
                    </div>
                    <div className="col-lg-5 col-lg-offset-2 col-md-6 col-sm-6">
                        <div className="profile-overall-rating">
                            <div>
                                <span className="fas fa-star"></span>
                                <span className="rating">
                                    {userStore.user?.hostOverallRating ? userStore.user.hostOverallRating : 0}
                                </span>
                                <div className="color-dark-grey">Overall rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-5 col-md-6 col-sm-6 mb-big-xs">
                    <div className="stat-table">
                        <div className="stat-table-header">Occupancy Rate %</div>
                        {listRate.length > 0 ? (
                            <>
                                {listRate.map((item) => {
                                    return (
                                        <div className="stat-item" key={item.mothName}>
                                            <div>{item.mothName}</div>
                                            <div className="value">{item.value ? item.value : 0}%</div>
                                            <div className="graphic-value">
                                                <span style={{ width: `${(item.value * 100) / 100}%` }}></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <p className={'m-3'}>No data found.</p>
                        )}
                    </div>
                </div>
                <div className="col-lg-5 col-lg-offset-2 col-md-6 col-sm-6 mb-big-xs">
                    <div className="stat-table">
                        <div className="stat-table-header">Total Revenue $</div>
                        {listRevenue.length > 0 ? (
                            <>
                                {listRevenue.map((item) => {
                                    return (
                                        <div className="stat-item" key={item.mothName}>
                                            <div>{item.mothName}</div>
                                            <div className="value">${item.value ? item.value : 0}</div>
                                            <div className="graphic-value">
                                                <span
                                                    style={{
                                                        width: `${Math.ceil((item.value * 100) / (maxRevenue || 1))}%`,
                                                    }}
                                                ></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <p className={'m-3'}>No data found.</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
});

export default ProfileSectionStatistics;
