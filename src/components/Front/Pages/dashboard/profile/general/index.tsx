import { observer } from 'mobx-react-lite';
import ProfileSectionGeneralForm from './generalForm';
import ProfileSectionGeneralChangePhotoForm from './changePhoto';
import { useState } from 'react';

const ProfileSectionGeneral = observer(() => {
    const [openModalChangePhoto, setOpenModalChangePhoto] = useState(false);
    const toggleModalChangePhoto = () => setOpenModalChangePhoto(!openModalChangePhoto);
    return (
        <>
            <ProfileSectionGeneralForm openChangePhoto={toggleModalChangePhoto} />
            <ProfileSectionGeneralChangePhotoForm
                isOpenModal={openModalChangePhoto}
                closeModalChangePhoto={toggleModalChangePhoto}
            />
        </>
    );
});

export default ProfileSectionGeneral;
