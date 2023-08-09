import React from 'react';
import { SavePanelContext } from './index';

const useSavePanelContext = () => {
    const context = React.useContext(SavePanelContext);
    if (!context) {
        throw new Error(`Save panel compound components cannot be rendered outside the SavePanel component`);
    }
    return context;
};

export default useSavePanelContext;
