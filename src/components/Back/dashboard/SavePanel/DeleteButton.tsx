import { Button, ButtonProps } from 'primereact/button';
import useSavePanelContext from './useSavePanelContext';

const DeleteButton = (props: ButtonProps) => {
    const { formikProps } = useSavePanelContext();

    const deleteClassName = props.className ? `p-button-danger ${props.className}` : 'p-button-danger';
    return (
        <Button type="button" className={deleteClassName} {...props}>
            {props.children}
        </Button>
    );
};

export default DeleteButton;
