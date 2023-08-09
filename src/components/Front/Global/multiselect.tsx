import { FunctionComponent, useEffect, useState } from 'react';
import { MultiSelect, MultiSelectProps } from 'primereact/multiselect';
import classnames from 'classnames';
import { FrontFloatLabel } from './floatLabel';

interface Props extends MultiSelectProps {
    errored?: boolean;
    label: string;
    required?: boolean;
    id: string;
    hideAfterScroll?: boolean;
    wrapperListenerScroll?: string;
}

export const FrontMultiSelect: FunctionComponent<Props> = (props) => {
    const [opened, setOpened] = useState(false);

    const hideAfterScroll = () => {
        if (opened) {
            const wrapper = document.querySelector(`.${props.wrapperListenerScroll}`) as HTMLElement;
            wrapper && wrapper.addEventListener('scroll', hideAfterScroll);
            setOpened(false);
            const panel = document.querySelector('.multi-select-panel-' + props.id) as HTMLElement;
            const multiSelect = document.getElementById(props.id);
            if (panel) {
                panel.style.display = 'none';
                wrapper && wrapper.click();
                multiSelect && multiSelect.classList.remove('p-inputwrapper-focus', 'p-focus');
            }
        }
    };
    useEffect(() => {
        if (props.hideAfterScroll && opened) {
            const wrapper = document.querySelector(`.${props.wrapperListenerScroll}`) as HTMLElement;
            wrapper && wrapper.addEventListener('scroll', hideAfterScroll);

            return () => {
                wrapper && wrapper.removeEventListener('scroll', hideAfterScroll);
            };
        }
    }, [opened]);

    const onShow = () => setOpened(true);
    const onHide = () => setOpened(false);

    return (
        <div className={`input-wrap has-content select-wrap`}>
            <FrontFloatLabel label={props.label} id={props.id} required={props.required}>
                <MultiSelect
                    onHide={onHide}
                    onShow={onShow}
                    panelClassName={'multi-select-panel-' + props.id}
                    className={classnames({ 'p-invalid': props.errored }, props.className ?? '')}
                    {...props}
                />
            </FrontFloatLabel>
        </div>
    );
};
