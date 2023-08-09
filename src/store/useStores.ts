import { useContext } from 'react';
import { RootStore } from './stores/root';
import { StoreContext } from './StoreProvider';

export const useStores = (): RootStore => {
    return useContext(StoreContext);
};
