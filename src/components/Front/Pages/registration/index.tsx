import React, { FunctionComponent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import RegistrationSectionForm from './form';
import { State } from '../../../../models/api';
import RegistrationSectionSubmitted from './submitted';

interface Props {
    states: State[] | [];
}

const RegistrationSection: FunctionComponent<Props> = observer(({ states }) => {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const closeRegistrationForm = () => setIsSubmitted(true);
    return (
        <>
            {isSubmitted ? (
                <RegistrationSectionSubmitted />
            ) : (
                <RegistrationSectionForm states={states} submitted={closeRegistrationForm} />
            )}
        </>
    );
});
export default RegistrationSection;
