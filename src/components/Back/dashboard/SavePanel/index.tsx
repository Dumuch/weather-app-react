import { FormikProps } from 'formik';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { FormField } from '../../Form/form-field';
import { DashBoardPanel } from '../Panel';
import CancelButton from './CancelButton';
import DeleteButton from './DeleteButton';
import SaveButton from './SaveButton';
import { getFormatData } from '../../../../utils/dateTime';
import { dateConfig } from '../../../../config/date';

interface SavePanelProps {
    children: JSX.Element | JSX.Element[];
    inputsDisabled?: boolean;
    timestamp?:
        | {
              createdAt: string;
              updatedAt?: string;
          }
        | undefined;
    formikProps: FormikProps<any>;
}

type ContextProps = Omit<SavePanelProps, 'children'>;

export const SavePanelContext = React.createContext<ContextProps | undefined>(undefined);

const SavePanel = ({ children, inputsDisabled, timestamp, formikProps }: SavePanelProps) => {
    return (
        <SavePanelContext.Provider value={{ formikProps }}>
            <DashBoardPanel>
                <div className="grid form-group">
                    <label htmlFor="save-panel_createdAt" className="dense-label">
                        Created at
                    </label>
                    <FormField
                        value={timestamp?.createdAt ? getFormatData(timestamp.createdAt, dateConfig.formats.date) : ''}
                        className="col"
                        type="text"
                        readOnly={inputsDisabled}
                        field="general.createdAt"
                        formName="save-panel"
                    />
                </div>
                {timestamp?.updatedAt && (
                    <div className="grid form-group">
                        <label htmlFor="save-panel_updatedAt" className="dense-label">
                            Updated at
                        </label>
                        <FormField
                            value={getFormatData(timestamp.updatedAt, dateConfig.formats.date)}
                            className="col"
                            type="text"
                            readOnly={inputsDisabled}
                            field="updatedAt"
                            formName="save-panel"
                        />
                    </div>
                )}
                {children}
            </DashBoardPanel>
        </SavePanelContext.Provider>
    );
};

SavePanel.SaveButton = SaveButton;
SavePanel.CancelButton = CancelButton;
SavePanel.DeleteButton = DeleteButton;

export default observer(SavePanel);
