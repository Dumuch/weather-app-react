export interface City {
    id: number;
    lat: number;
    lon: number;
    name: string;
    weatherData: WeatherData | null;
}

export interface AddCity {
    id: number;
    lat: number;
    lon: number;
    name: string;
}

export interface CityList {
    list: City[];
    isLoading: boolean;
    isFetch: boolean;
}

export interface WeatherDescription {
    'id': number;
    'main': string;
    'description': string;
    'icon': string;
}

export interface WeatherData {
    'coord': {
        'lon': number;
        'lat': number;
    },
    'weather': WeatherDescription[],
    'base': string;
    'main': {
        'temp': number;
        'feels_like': number;
        'temp_min': number;
        'temp_max': number;
        'pressure': number;
        'humidity': number;
        'sea_level': number;
        'grnd_level': number;
    },
    'visibility': number;
    'wind': {
        'speed': number;
        'deg': number;
        'gust': number;
    },
    'clouds': {
        'all': number;
    },
    'dt': number;
    'sys': {
        'type': number;
        'id': number;
        'country': string;
        'sunrise': number;
        'sunset': number;
    },
    'timezone': number;
    'id': number;
    'name': string;
    'cod': number;
}
