import { AbstractApiClient } from '../abstractApiClient';
import client from './client';

export class RemoteServerApiClient extends AbstractApiClient {
    __extendHeaders(headers: { [key: string]: string | undefined }) {
        for (const key of Object.keys(headers)) {
            // @ts-ignore
            client.defaults.headers[key] = headers[key];
        }
    }

}
