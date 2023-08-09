import { Button } from 'primereact/button';
import { ConfirmDialogProps } from 'primereact/confirmdialog';

export const DialogFooter = (dialogProps: ConfirmDialogProps) => {
    return (
        <div>
            <Button label="Cancel" className="p-button-default" onClick={dialogProps.reject} />
            <Button label="Confirm" className="p-button-primary" onClick={dialogProps.accept} />
        </div>
    );
};
