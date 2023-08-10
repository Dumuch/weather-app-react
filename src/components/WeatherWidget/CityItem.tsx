import { FC, memo } from 'react';
import { City, WeatherDescription } from '../../store/stores/CityStore.types';
import { metersToKm, convertTempKelvinToCelsius, capitalized } from '../../utils/helpers';
import { observer } from 'mobx-react-lite';

interface Props {
    city: City;
}

const weatherDescriptions = (weathers: WeatherDescription[]) => {
    return weathers.map(weather => capitalized(weather.description) + '.');
};

const CityItem: FC<Props> = memo(observer(({ city }) => {
    return (
        <li className='city-item'>
            <div className='city-item__header'>
                {city.name}, {city.weatherData?.sys.country}
            </div>
            {city.weatherData && (
                <div className='city-item__body'>
                    <div className='city-item__temperature'>
                        <img src={`https://openweathermap.org/img/wn/${city.weatherData.weather[0].icon}@2x.png`}
                             className='temperature-image' width='100' height='100' alt={city.weatherData.name} />
                        <span
                            className='temperature-number'>{convertTempKelvinToCelsius(city.weatherData?.main.temp)}°C</span>
                    </div>
                    <div className='city-item__feel-like'>
                        Feels like {convertTempKelvinToCelsius(city.weatherData?.main.feels_like)}°C. {' '}
                        {weatherDescriptions(city.weatherData.weather)}
                    </div>

                    <div className='city-item__wind'>
                        <img src='/assets/navigation.png' className='wind-image' width='20' height='20'
                             alt='navigation icon' />
                        {city.weatherData?.wind.speed}m/s SSE
                    </div>

                    <div className='city-item__humidity'>
                        Humidity: {city.weatherData?.main.humidity}%
                    </div>

                    <div className='city-item__visibility'>
                        Visibility: {metersToKm(city.weatherData?.visibility)}km
                    </div>

                </div>

            )}
        </li>
    );
}));

export default CityItem;
