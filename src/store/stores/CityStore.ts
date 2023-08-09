import { makeAutoObservable, runInAction } from 'mobx';

import { RootStore } from './root';
import container from '../../container/container';
const api = container.apiClient;

export class CityStore {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }
}
