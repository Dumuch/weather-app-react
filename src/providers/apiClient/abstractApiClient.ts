import { AxiosPromise } from 'axios';
import { WeatherData } from '../../store/stores/CityStore.types';

export abstract class AbstractApiClient {
    abstract __extendHeaders(headers: { [key: string]: string | undefined }): void;

    abstract getWeatherByCityId(cityId: number): AxiosPromise<WeatherData>
    abstract getWeatherByLatLon(lat: number, lon: number): AxiosPromise<WeatherData>
    abstract getWeatherByCityName(cityName: string): AxiosPromise<WeatherData>
}
