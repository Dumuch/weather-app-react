import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { observer } from 'mobx-react-lite';
import { FrontModal } from '../../../../Global/modal';
import ModalFooter from '../../../../Global/modalFooter';
import { PropertyDetailsModalsState } from '../PropertyDetails';
import { DictionaryValue } from '../../../../../../models/api';

interface Props {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<PropertyDetailsModalsState>>;
    amenitiesByCategories: { category: { name: string; id: number }; items: DictionaryValue[] }[] | [] | undefined;
}

const PropertyDetailsAmenitiesModal: FunctionComponent<Props> = observer(
    ({ isVisible, setIsVisible, amenitiesByCategories }) => {
        const hideModal = () => setIsVisible('');
        return (
            <FrontModal
                header={'Amenities'}
                visible={isVisible}
                onHide={hideModal}
                footer={<ModalFooter success={'true'} closeModalHandler={hideModal} />}
                dismissableMask={true}
                position={'top'}
                className={'modal-lg p-dialog-content_scroll'}
            >
                {amenitiesByCategories?.map((amenity, idx) => {
                    if (amenity.items.length > 0) {
                        return (
                            <div key={idx} className={'mb'}>
                                <h4 className="h5-style mb-half">{amenity.category.name}</h4>
                                <div className="pdd-amenities-listing three-cols mb">
                                    <div className="inner-wrap">
                                        {amenity.items.map((item) => (
                                            <div key={item.id} className="item">
                                                {item.fullName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                })}
            </FrontModal>
        );
    }
);
export default PropertyDetailsAmenitiesModal;
