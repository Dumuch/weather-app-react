import { AbstractApiClient, RemoteServerApiClient } from '../providers/apiClient';

class Container {
    protected currentApiClient: AbstractApiClient;

    constructor() {
        this.currentApiClient = new RemoteServerApiClient();
    }

    get apiClient() {
        return this.currentApiClient;
    }
}

const container = new Container();

export default container;
