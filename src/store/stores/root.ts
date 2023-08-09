import { CityStore } from './CityStore';


export class RootStore {
    CityStore: CityStore
    apiUrl: string | undefined;


    constructor() {
        this.CityStore = new CityStore(this);
         this.getApiUrl();
    }

    getApiUrl() {
        this.apiUrl = process.env.REACT_APP_PROVIDERS_REMOTE_SERVER_BASE_URL;
    }
}
