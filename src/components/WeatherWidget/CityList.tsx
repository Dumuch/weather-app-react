import { useStores } from '../../store';
import CityItem from './CityItem';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
    isOpen: boolean;
}

const WeatherWidgetCityList: FC<Props> = observer(({isOpen}) => {
    const { CityStore } = useStores();
    return (
        <div className='city-list-container' style={{display: isOpen ? 'block' : 'none'}}>
            <ul className='city-list'>
                {CityStore.cityList.list.map(city => <CityItem key={city.id} city={city} />)}
            </ul>
        </div>);
});

export default WeatherWidgetCityList;
