import React, { ReactNode } from 'react';
import { BackRoutesList } from '../BackRoutesList';

interface LoginPageConfig {
    form: ReactNode;
    footer?: ReactNode;
}

export const loginPageConfigs: { [key: string]: LoginPageConfig } = {
    [BackRoutesList.SignIn]: {
        form: '',
    },
    [BackRoutesList.ForgotPwd]: {
        form: '',
    },
};
