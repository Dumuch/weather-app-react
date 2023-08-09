import { Button, ButtonProps } from 'primereact/button';
import useSavePanelContext from './useSavePanelContext';

const CancelButton = (props: ButtonProps) => {
    const { formikProps } = useSavePanelContext();

    const cancelClassName = props.className ? `p-button-default ${props.className}` : 'p-button-default';
    return (
        <Button type="button" className={cancelClassName} {...props}>
            {props.children}
        </Button>
    );
};

export default CancelButton;
