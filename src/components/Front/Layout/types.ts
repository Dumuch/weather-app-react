import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<T = void> = NextPage<T> & {
    getLayout?: (page: ReactElement<T>) => ReactNode;
};
