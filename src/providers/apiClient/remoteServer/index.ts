import { AbstractApiClient } from '../abstractApiClient';
import client from './client';
import apiRoutes from '../routes';

const WEATHER_KEY = process.env.REACT_APP_WEATHER_KEY;
export class RemoteServerApiClient extends AbstractApiClient {

    getWeatherByCityId(cityId: number) {
        return client.get(apiRoutes.weatherData, { params: { appid: WEATHER_KEY, id: cityId } });
    }

    getWeatherByLatLon(lat: number, lon: number) {
        return client.get(apiRoutes.weatherData, { params: { appid: WEATHER_KEY, lat, lon } });
    }

    getWeatherByCityName(cityName: string) {
        return client.get(apiRoutes.weatherData, { params: { appid: WEATHER_KEY, q: cityName } });
    }

    __extendHeaders(headers: { [key: string]: string | undefined }) {
        for (const key of Object.keys(headers)) {
            // @ts-ignore
            client.defaults.headers[key] = headers[key];
        }
    }

}
