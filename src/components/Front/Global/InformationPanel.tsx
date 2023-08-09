import React, { FunctionComponent } from 'react';
interface Props {
    title: string;
    description?: string;
}

export const FrontInformationPanel: FunctionComponent<Props> = (props) => {
    return (
        <div className={'main-panel'}>
            <h2>{props.title}</h2>
            {props?.description ? <p>{props.description}</p> : null}
        </div>
    );
};
