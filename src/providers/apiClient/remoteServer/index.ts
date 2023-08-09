import { AbstractApiClient } from '../abstractApiClient';
import client from './client';

export class RemoteServerApiClient extends AbstractApiClient {

    getWeatherByCityId(cityId: number) {
        return client.get('', { params: { id: cityId } });
    }

    getWeatherByLatLon(lat: number, lon: number) {
        return client.get('', { params: { lat, lon } });
    }

    __extendHeaders(headers: { [key: string]: string | undefined }) {
        for (const key of Object.keys(headers)) {
            // @ts-ignore
            client.defaults.headers[key] = headers[key];
        }
    }

}
