import React, { FunctionComponent } from 'react';
import { Property, PropertyBedroom } from '../../../../models/api/property';
import { DashBoardInput } from '../../dashboard/input';
import SavePanel from '../../dashboard/SavePanel';
import { DashBoardPanel, HeaderColors } from '../../dashboard/Panel';
import { DashboardSection } from '../../dashboard/Section';
import { Form, Formik, FormikProps } from 'formik';
import { InputSwitch } from 'primereact/inputswitch';
import { confirmDialog } from 'primereact/confirmdialog';
import { dialog } from '../../../../utils/confirmDialogConstants';
import { useStores } from '../../../../store';
import { concatString } from '../../../../utils/helpers';
import { DictionaryValue } from '../../../../models/api';
import { getTime } from '../../../../utils/dateTime';

export interface Props {
    property: Property;
}

export interface initialValuesInterface {
    active: boolean;
    blocked: boolean;
    id: string;
    name: string;
    description: string;
}

export const PropertyEdit: FunctionComponent<Props> = ({ property }) => {
    const { propertiesStore } = useStores();

    const onSubmit = (props: initialValuesInterface) => {
        propertiesStore.updateItem({ ...property, ...props });
    };

    const handleCancel = (formik: FormikProps<initialValuesInterface>) => {
        confirmDialog({
            ...dialog.warn,
            accept: () => formik.resetForm(),
        });
    };

    const getBedroomsValue = (bedrooms: PropertyBedroom[]) => {
        return concatString([...bedrooms.map((bedroom) => `${bedroom.dictionaryValue?.fullName}: ${bedroom.value}`)]);
    };

    const getAmenitiesValue = (amenities: DictionaryValue[]) => {
        return concatString([...amenities.map((amenity) => amenity?.fullName ?? '')], ',');
    };

    const getUserValue = (property: Property) => {
        return concatString([property.user?.firstName ?? '', property.user?.lastName ?? '']);
    };

    const initialValues: initialValuesInterface = {
        active: property.active,
        blocked: property.blocked,
        id: property.id ?? '',
        name: property.name ?? '',
        description: property.description ?? '',
    };
    return (
        <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize={true}>
            {(props) => {
                return (
                    <Form>
                        <div className="grid">
                            <DashboardSection sectionTitle="General">
                                <DashBoardPanel>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Property Name/Title:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.name}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Owner:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={getUserValue(property)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Rental Description:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.description}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Active?:</label>
                                            <div className="sm:col-10 pt-3">
                                                <InputSwitch
                                                    checked={props.values.active}
                                                    name={'active'}
                                                    onChange={props.handleChange}
                                                    disabled={props.values.blocked}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                                <DashBoardPanel title="Location" headerColor={HeaderColors.linkWater}>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Address 1:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property?.address1 ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Address 2:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property?.address2 ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">City:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property?.city ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">State:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property?.state ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Zip:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property?.zip ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                            </DashboardSection>
                            <div className="col-4 pr-5 pl-5">
                                <h2>&nbsp;</h2>
                                <SavePanel
                                    timestamp={{
                                        createdAt: property.createdAt,
                                        updatedAt: property.updatedAt,
                                    }}
                                    inputsDisabled
                                    formikProps={props}
                                >
                                    <div className="controls-group-right">
                                        <SavePanel.CancelButton
                                            onClick={() => handleCancel(props)}
                                            className="p-button-default"
                                        >
                                            Cancel
                                        </SavePanel.CancelButton>
                                        <SavePanel.SaveButton className="p-button-primary">
                                            <i className="pi pi-save pr-3"></i>
                                            Save
                                        </SavePanel.SaveButton>
                                    </div>
                                </SavePanel>
                            </div>
                            <DashboardSection sectionTitle="Property Details">
                                <DashBoardPanel>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Property Type:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.propertyType?.fullName ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">
                                                Neighborhood / area description:
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.neighborhoodType?.fullName ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Number of Guests:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.numberOfGuests ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Bedrooms:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={getBedroomsValue(property.propertyBedrooms ?? [])}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Bathrooms:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.bathrooms ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Amenities:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={getAmenitiesValue(property.amenities ?? [])}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">House Rules / Policies:</label>
                                            <div className="form-horizontal sm:col-10">
                                                <div className="form-group">
                                                    <label htmlFor="maxGuests" className="dense-label">
                                                        Max Guests:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.maxGuests ?? ''}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id="maxGuests"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="smokingAllowed" className="dense-label">
                                                        Smoking/Non-smoking:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.smokingAllowed?.toString()}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id="smokingAllowed"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="eventsAllowed" className="dense-label">
                                                        Events Allowed:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.eventsAllowed?.toString()}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id="eventsAllowed"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="petsAllowed" className="dense-label">
                                                        Pets/No Pets:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.petsAllowed?.toString()}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id="petsAllowed"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="checkTimes" className="dense-label">
                                                        Check-in/Check-out times:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={`Check-in / Check-out: ${
                                                            property.checkIn ? getTime(property.checkIn) : ''
                                                        } - ${property.checkOut ? getTime(property.checkOut) : ''}`}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id="checkTimes"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="additionalRules" className="dense-label">
                                                        Additional house rules:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.additionalRules ?? ''}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id="additionalRules"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Night Stays:</label>
                                            <div className="form-horizontal sm:col-10">
                                                <div className="form-group">
                                                    <label htmlFor="minimumNightStay" className="dense-label">
                                                        Minimum:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.minimumNightStay ?? ''}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id={'minimumNightStay'}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="maximumNightStay" className="dense-label">
                                                        Maximum:
                                                    </label>
                                                    <DashBoardInput
                                                        readOnly={true}
                                                        value={property.maximumNightStay ?? ''}
                                                        setValue={() => {}}
                                                        className={'form-control'}
                                                        type={'text'}
                                                        placeholder={''}
                                                        id={'maximumNightStay'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                                <DashBoardPanel title="Rates & Fees" headerColor={HeaderColors.linkWater}>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Cleaning Fee ($):</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.cleaningFee ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Additional Fees ($):</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.additionalFees ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Tax Rate (%):</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.taxRate ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                                <DashBoardPanel title="Booking & Bid Process" headerColor={HeaderColors.linkWater}>
                                    <div className="form-horizontal">
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">Cancellation Policy:</label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property.cancellationPolicy?.fullName ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">
                                                Reservation Approval Required?:
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={String(property.reservationApprovalRequired)}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="sm:col-2 control-label">
                                                Days in advance notice for rentals:
                                            </label>
                                            <div className="sm:col-10 p-0">
                                                <DashBoardInput
                                                    readOnly={true}
                                                    value={property?.rentalNoticeDays ?? ''}
                                                    setValue={() => {}}
                                                    className={'form-control'}
                                                    type={'text'}
                                                    placeholder={''}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </DashBoardPanel>
                            </DashboardSection>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
};
