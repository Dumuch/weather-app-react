import { FC, FormEvent, useRef, useState } from 'react';
import { useStores } from '../../store';
import { City, WeatherData } from '../../store/stores/CityStore.types';
import { ReactSortable } from 'react-sortablejs';
import { debounds } from '../../utils/helpers';
import { observer } from 'mobx-react-lite';

interface Props {
    city: City;
    deleteCity: (cityId: number) => void;
}

const SortableItem: FC<Props> = ({ city, deleteCity }) => {
    const onClickDeleteCity = () => deleteCity(city.id);
    return (
        <div className='settings-city-item'>
            <div className='settings-city-item__wrapper-burger-button'>
                <div className='settings-city-item__burger-button'></div>
            </div>
            <div className='settings-city-item__name'>
                {city.name}, {city.weatherData?.sys.country}
            </div>
            <button className='settings-city-item__delete-button' onClick={onClickDeleteCity}>delete</button>
        </div>
    );
};

const WeatherWidgetSettings = observer(() => {
    const { CityStore } = useStores();

    const [currentCity, setCurrentCity] = useState<WeatherData | null>(null);
    const [cityNameInput, setCityNameInput] = useState('');

    const deleteCity = (cityId: number) => {
        CityStore.deleteCity(cityId);
    };

    const addCity = async () => {
        if (currentCity) {
            setCityNameInput('');
            await CityStore.addCity({
                id: currentCity.id,
                lat: currentCity.coord.lat,
                lon: currentCity.coord.lon,
                name: currentCity.name
            });
        }
    };

    const findCity = async (cityName: string) => {
        try {
            setCurrentCity(await CityStore.findCityByCityName(cityName));
        } catch (err) {
            setCurrentCity(null);
        }
    };

    const onChangeInput = (e: FormEvent<HTMLInputElement>) => {
        const cityName = e.currentTarget.value;
        setCurrentCity(null);

        debounds(findCity, cityName);
        setCityNameInput(cityName);
    };

    const onSortEnd = (list: City[]) => {
        CityStore.newOrder(list);
    };

    return (
        <div className='settings'>
            <div className='settings-header'>Settings</div>

            <ReactSortable handle={'.settings-city-item__wrapper-burger-button'} animation={150} className={'settings-city-list'} list={CityStore.cityList.list} setList={onSortEnd}>
                {CityStore.cityList.list.map((item) => <SortableItem key={item.id} city={item}
                                                                     deleteCity={deleteCity} />)}
            </ReactSortable>

            <div className='settings__add-city'>
                <div className='add-city__header'>
                    <span className='add-city__title'>Add City:</span>
                    {!currentCity && !CityStore.cityList.isLoading && cityNameInput.length ? (
                        <span className='add-city__error-message'>Not found</span>
                    ) : null}
                </div>
                <div className='add-city__body'>
                    <input className='add-city__input' value={cityNameInput} onChange={onChangeInput} />
                    <button
                        className='add-city__button'
                        disabled={!currentCity}
                        onClick={addCity}>Add
                    </button>
                </div>

            </div>

        </div>
    );
});

export default WeatherWidgetSettings;
