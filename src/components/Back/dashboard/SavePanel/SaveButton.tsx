import { Button, ButtonProps } from 'primereact/button';
import useSavePanelContext from './useSavePanelContext';

const SaveButton = (props: ButtonProps) => {
    const { formikProps } = useSavePanelContext();
    const saveClassName = props.className ? `p-button-primary ${props.className}` : 'p-button-primary';
    return (
        <Button type="submit" className={saveClassName} {...props}>
            {props.children}
        </Button>
    );
};

export default SaveButton;
