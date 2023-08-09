import { action, makeAutoObservable, runInAction } from 'mobx';

import { RootStore } from './root';
import container from '../../container/container';
import { AddCity, City, CityList, WeatherData } from './CityStore.types';
import { LocalStorage } from '../../services/LocalStorage';
import { AxiosPromise } from 'axios';

const api = container.apiClient;
const CITY_LIST_KEY = 'cityList';

export class CityStore {
    cityList: CityList = {
        list: [],
        isFetch: false,
        isLoading: false
    };
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }

    getCityFromLocalStorage() {
        const cities = LocalStorage.getStorage<City[]>(CITY_LIST_KEY);
        if (cities) {
            runInAction(() => {
                this.cityList.list = cities;
            });
        }
    }

    async fetchWeather() {
        if (this.cityList.isLoading) return;
        this.cityList.isLoading = true;

        const promises: WeatherData[] = [];

        for (const city of this.cityList.list) {
            promises.push(
                await api.getWeatherByCityId(city.id).then(res => res.data)
            );
        }

        const citiesWeather = await Promise.all<WeatherData>(promises);
        try {
            runInAction(() => {
                this.cityList.list = this.cityList.list.map(city => {
                    const weather = citiesWeather.find(cityWeather => cityWeather.id === city.id);
                    if (weather) {
                        city.weatherData = weather;
                    }
                    return city;
                });
            });
            this.updateStorage();
        } catch (err) {
        } finally {
            runInAction(() => {
                this.cityList.isLoading = false;
            });
        }
    }

    async addCityByLatLng(lat: number, lon: number) {
        const { data } = await api.getWeatherByLatLon(lat, lon);
        if (data) {
            await this.addCity({ id: data.id, lat: lat, lon: lon, name: data.name });
        }
    }

    async addCity(newCity: AddCity) {
        if (!this.cityList.list.find(city => city.id === newCity.id)) {
            runInAction(() => {
                this.cityList.list.push({
                    id: newCity.id,
                    lat: newCity.lat,
                    lon: newCity.lon,
                    name: newCity.name,
                    weatherData: null
                });
            });
            await this.fetchWeather();
            this.updateStorage();
        }
    }

    updateStorage() {
        LocalStorage.setStorage(CITY_LIST_KEY, this.cityList.list);
    }
}
