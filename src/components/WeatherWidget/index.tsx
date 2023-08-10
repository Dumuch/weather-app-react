import WeatherWidgetSettings from './Settings';
import WeatherWidgetCityList from './CityList';
import { useEffect, useState } from 'react';
import { useStores } from '../../store';
import { Geocoder } from '../../services/Geocoder';
import { observer } from 'mobx-react-lite';

const WeatherWidget = observer(() => {
    const { CityStore } = useStores();
    const [isOpenSettings, setIsOpenSettings] = useState(false);
    const toggleSettings = () => setIsOpenSettings(prevState => !prevState);

    useEffect(() => {
        CityStore.getCityFromLocalStorage()
        CityStore.fetchWeather().then(async () => {
            if (CityStore.cityList.list.length === 0) {
                try {
                    const geocoder = new Geocoder();
                    const currentWeatherCity = await geocoder.getCurrentPosition();
                    await CityStore.addCityByLatLng(
                        currentWeatherCity.coords.latitude,
                        currentWeatherCity.coords.longitude,
                    )
                } catch (e) {}
            }
        })
    }, []);


    return (
        <div className='weather-widget'>
            <button className={`settings-toggle ${isOpenSettings ? 'settings-toggle_open' : ''}`}
                    onClick={toggleSettings}>
                <span className='settings-toggle__burger'></span>Open settings
            </button>
            {isOpenSettings && <WeatherWidgetSettings />}
            {CityStore.cityList.list.length === 0 ? <p> City not added </p> : <WeatherWidgetCityList isOpen={!isOpenSettings} />}
        </div>
    );
});

export default WeatherWidget;
