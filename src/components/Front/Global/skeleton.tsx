import { Skeleton, SkeletonProps } from 'primereact/skeleton';
import React, { FunctionComponent } from 'react';

const FrontSkeleton: FunctionComponent<SkeletonProps> = (props) => {
    return <Skeleton {...props}></Skeleton>;
};

export default FrontSkeleton;
