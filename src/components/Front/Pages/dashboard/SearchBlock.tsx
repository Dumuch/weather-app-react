import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { FC, useState, useEffect } from 'react';
import { dateConfig } from '../../../../config/date';
import { getFormatData } from '../../../../utils/dateTime';
import { FrontRoutesList } from '../FrontRoutesList';
import RemoveSearchModal from './RemoveSearchModal';
import { DictionaryCode, DictionaryValue, SavedSearch } from '../../../../models/api';
import { concatString, normalizeQuery } from '../../../../utils/helpers';
import { useStores } from '../../../../store';
import axios from 'axios';

interface Props {
    obSearch: SavedSearch;
}
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_MAPS_KEY ?? '';

const SearchBlock: FC<Props> = observer(({ obSearch }) => {
    const { dictionaryStore } = useStores();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [locationString, setLocationString] = useState('');
    const [additionalParameters, setAdditionalParameters] = useState<{
        activePropertyTypes: DictionaryValue[];
        activeCancellationPolicy: DictionaryValue[];
        activeAmenities: DictionaryValue[];
    }>({ activeAmenities: [], activeCancellationPolicy: [], activePropertyTypes: [] });
    const showModal = () => setIsModalVisible(true);

    const checkInDate = getFormatData(obSearch.searchParameters.checkIn, dateConfig.formats.localizedDate);
    const checkOutDate = getFormatData(obSearch.searchParameters.checkOut, dateConfig.formats.localizedDate);

    const propertyTypes = dictionaryStore.getDictionary(DictionaryCode.propertyTypes);
    const cancellationPolicies = dictionaryStore.getDictionary(DictionaryCode.cancellationPolicies, true, 'order');
    const amenities = dictionaryStore.getDictionary(DictionaryCode.amenities);

    useEffect(() => {
        if (obSearch.searchParameters.lat && obSearch.searchParameters.lng && !obSearch.searchParameters.locationStr) {
            axios
                .get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${obSearch.searchParameters.lat}, ${obSearch.searchParameters.lng}&key=${GOOGLE_MAPS_KEY}`
                )
                .then(({ data }) => {
                    if (data.status === 'OK') {
                        const findResult = data.results.find((item: { types: any }) => {
                            return (
                                JSON.stringify(item.types) ===
                                (obSearch.searchParameters.placeTypes as unknown as string)
                            );
                        });

                        if (findResult) {
                            setLocationString(findResult.formatted_address);
                        } else {
                            setLocationString(data.results[0].formatted_address);
                        }
                    }
                })
                .catch((err) => {});
        }
    }, []);

    useEffect(() => {
        dictionaryStore.fetchList().then(() => {
            if (
                obSearch.searchParameters.propertyTypes &&
                typeof obSearch.searchParameters.propertyTypes === 'string'
            ) {
                const parsedPropertyTypes = JSON.parse(obSearch.searchParameters.propertyTypes);
                const activePropertyTypes = parsedPropertyTypes.reduce((acc: any[], id: number) => {
                    const find = propertyTypes.find((item) => item.id === id);
                    if (find) {
                        acc.push(find);
                    }
                    return acc;
                }, []);
                setAdditionalParameters((prevParams) => ({ ...prevParams, activePropertyTypes }));
            }

            if (
                obSearch.searchParameters.cancellationPolicy?.length &&
                typeof obSearch.searchParameters.cancellationPolicy === 'string'
            ) {
                const parsedCancellationPolicies = JSON.parse(obSearch.searchParameters.cancellationPolicy);
                const activeCancellationPolicy = parsedCancellationPolicies.reduce((acc: any[], id: number) => {
                    const find = cancellationPolicies.find((item) => item.id === id);
                    if (find) {
                        acc.push(find);
                    }
                    return acc;
                }, []);
                setAdditionalParameters((prevParams) => ({ ...prevParams, activeCancellationPolicy }));
            }

            if (
                obSearch.searchParameters.amenities?.length &&
                typeof obSearch.searchParameters.amenities === 'string'
            ) {
                const parsedAmenities = JSON.parse(obSearch.searchParameters.amenities);
                const activeAmenities = parsedAmenities.reduce(
                    (acc: any[], listIds: number[]) => {
                        listIds.forEach((id) => {
                            const find = amenities.find((item) => item.id === id);
                            if (find) {
                                if (acc[find.relatedTo]) {
                                    acc[find.relatedTo] = [...acc[find.relatedTo], find];
                                } else {
                                    acc[find.relatedTo] = [find];
                                }
                            }
                        });
                        return acc;
                    },
                    Array.from(Array(amenities.length), () => undefined)
                );
                setAdditionalParameters((prevParams) => ({
                    ...prevParams,
                    activeAmenities: activeAmenities.filter((amenity: DictionaryValue) => amenity !== undefined).flat(),
                }));
            }
        });
    }, [dictionaryStore, dictionaryStore.isLoading]);

    return (
        <>
            <div className="item">
                {obSearch.searchParameters.locationStr || locationString ? (
                    <h3 className="h6-style location">{obSearch.searchParameters.locationStr || locationString}</h3>
                ) : null}
                {checkInDate || checkOutDate ? (
                    <div className="dates">
                        {checkInDate ? (
                            <span className="nobr">{checkInDate}</span>
                        ) : (
                            <span className="font-italic parameters">Date not specified</span>
                        )}{' '}
                        -{' '}
                        {checkOutDate ? (
                            <span className="nobr">{checkOutDate}</span>
                        ) : (
                            <span className="font-italic parameters">Date not specified</span>
                        )}
                    </div>
                ) : (
                    <span className="font-italic parameters">Dates not specified</span>
                )}
                {obSearch.searchParameters.guests && obSearch.searchParameters.guests > 1 ? (
                    <div className="guests">
                        {`${obSearch.searchParameters.guests} Guest${obSearch.searchParameters.guests > 1 ? 's' : ''}`}
                    </div>
                ) : null}
                <div className="parameters">
                    {concatString(
                        [
                            obSearch.searchParameters.bathRooms
                                ? `${obSearch.searchParameters.bathRooms} Bathroom${
                                      (obSearch.searchParameters.bathRooms ?? 0) > 1 ? 's' : ''
                                  }`
                                : '',
                            obSearch.searchParameters.bedRooms
                                ? `${obSearch.searchParameters.bedRooms} Bedroom${
                                      (obSearch.searchParameters.bedRooms ?? 0) > 1 ? 's' : ''
                                  }`
                                : '',
                            obSearch.searchParameters.priceMin
                                ? `Minimum Price: ${obSearch.searchParameters.priceMin}`
                                : '',
                            obSearch.searchParameters.priceMax
                                ? `Maximum Price: ${obSearch.searchParameters.priceMax}`
                                : '',
                            additionalParameters.activePropertyTypes?.map((tes) => tes.fullName),
                            additionalParameters.activeCancellationPolicy?.map((tes) => tes.fullName),
                            additionalParameters.activeAmenities?.map((tes) => tes.fullName),
                        ].flat(),
                        ','
                    )}
                </div>
                <Link href={{ pathname: FrontRoutesList.Properties, query: normalizeQuery(obSearch.searchParameters) }}>
                    <a className="area-link" title="View Details" />
                </Link>
                <a onClick={showModal} className="btn-delete" title="Delete">
                    <span className="far fa-trash-alt" />
                </a>
            </div>
            <RemoveSearchModal searchId={obSearch.id} isVisible={isModalVisible} setIsVisible={setIsModalVisible} />
        </>
    );
});

export default SearchBlock;
