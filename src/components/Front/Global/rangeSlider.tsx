import { FunctionComponent } from 'react';
import { Slider, SliderProps } from 'primereact/slider';
import classnames from 'classnames';

interface Props extends SliderProps {
    errored?: boolean;
}

export const FrontRangeSlider: FunctionComponent<Props> = (props) => {
    return <Slider className={classnames({ 'p-invalid': props.errored }, props.className ?? '')} {...props} range />;
};
