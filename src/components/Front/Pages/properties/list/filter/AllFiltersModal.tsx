import { FrontModal } from '../../../../Global/modal';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { FrontMultiSelect } from '../../../../Global/multiselect';
import { FrontButton } from '../../../../Global/button';
import FrontInput, { InputType } from '../../../../Global/input';
import { FrontRangeSlider } from '../../../../Global/rangeSlider';
import { useStores } from '../../../../../../store';
import { observer } from 'mobx-react-lite';
import { SliderChangeParams } from 'primereact/slider';
import { formatIntoPriceValue, UseLangMessage } from '../../../../../../utils/helpers';
import { ValidationMessage } from '../../../../../../lang/en/validatons';
import { AlertType, FrontNotificationField } from '../../../../Global/notificationField';
import { appConfig, HOUSE_RULES_DROPDOWN } from '../../../../../../config/app';

interface Props {
    isOpenModal: boolean;
    closeModal: () => void;
    props: any;
    arrGroupAmenities: any[];
    propertyTypes: any[];
    cancellationPolicies: any[];
    onSubmit: (values: any) => void;
}

const AllFiltersModal: FunctionComponent<Props> = observer(
    ({ isOpenModal, closeModal, props, arrGroupAmenities, propertyTypes, cancellationPolicies, onSubmit }) => {
        const { propertiesStore } = useStores();
        const [errorRangePrice, setErrorRangePrice] = useState('');

        const panelHeaderTemplate = (options: any) => {
            return (
                <div
                    className={`p-multiselect__panel-header p-multiselect-item ${options.checked ? 'p-highlight' : ''}`}
                    onClick={options.onChange}
                >
                    <div className="p-checkbox p-component">
                        <div className={`p-checkbox-box ${options.checked ? 'p-highlight' : ''}`}>
                            <span className={`p-checkbox-icon p-c ${options.checked ? 'pi pi-check' : ''}`}></span>
                        </div>
                    </div>
                    <span>Select All</span>
                </div>
            );
        };

        const handlerMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
            const priceMin = e.target.value ? Number(e.target.value.replace(/\D/g, '')) : 0;

            if (priceMin < props.values.price[1]) {
                propertiesStore.setSearchComponent({
                    ...propertiesStore.searchComponent,
                    filters: {
                        ...propertiesStore.searchComponent.filters,
                        priceMin: priceMin,
                        priceMax: props.values.price[1],
                    },
                });
                props.setFieldValue('price', [priceMin, props.values.price[1]]);
                props.setFieldValue('sliderPrice', [priceMin, props.values.price[1]]);
            } else {
                e.target.value = formatIntoPriceValue(props.values.sliderPrice[0], true, false, 0, 0);
                props.setFieldValue('price', props.values.sliderPrice);

                setErrorRangePrice(
                    UseLangMessage('Min Price', ValidationMessage.noMore).replace(
                        '{%replaceNumber%}',
                        props.values.price[1].toString()
                    )
                );
            }
        };

        const handlerMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
            const priceMax = e.target.value
                ? Number(e.target.value.replace(/\D/g, ''))
                : propertiesStore.searchComponent.rangePrice[1];
            if (priceMax > props.values.price[0] && priceMax <= propertiesStore.searchComponent.rangePrice[1]) {
                propertiesStore.setSearchComponent({
                    ...propertiesStore.searchComponent,
                    filters: {
                        ...propertiesStore.searchComponent.filters,
                        priceMin: props.values.price[0],
                        priceMax: priceMax,
                    },
                });
                props.setFieldValue('price', [props.values.price[0], priceMax]);
                props.setFieldValue('sliderPrice', [props.values.price[0], priceMax]);
            } else {
                e.target.value = formatIntoPriceValue(props.values.sliderPrice[1], true, false, 0, 0);
                props.setFieldValue('price', props.values.sliderPrice);

                if (priceMax < props.values.price[0]) {
                    setErrorRangePrice(
                        UseLangMessage('Max Price', ValidationMessage.noLess).replace(
                            '{%replaceNumber%}',
                            props.values.price[0].toString()
                        )
                    );
                } else if (priceMax > propertiesStore.searchComponent.rangePrice[1]) {
                    setErrorRangePrice(
                        UseLangMessage('Max Price', ValidationMessage.noMore).replace(
                            '{%replaceNumber%}',
                            propertiesStore.searchComponent.rangePrice[1].toString()
                        )
                    );
                }
            }
        };

        const handlerSliderPrice = (e: SliderChangeParams) => {
            const range = e.value as [number, number];

            setErrorRangePrice('');
            propertiesStore.setSearchComponent({
                ...propertiesStore.searchComponent,
                filters: {
                    ...propertiesStore.searchComponent.filters,
                    priceMin: range[0],
                    priceMax: range[1],
                },
            });
            props.setFieldValue('price', range);
            props.setFieldValue('sliderPrice', range);
        };

        const handlerSearch = () => {
            closeModal();
            onSubmit(props.values);
        };

        const handlerChangeMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
            setErrorRangePrice('');
            const priceMin = e.target.value ? Number(e.target.value) : 0;
            props.setFieldValue('price', [priceMin, props.values.price[1]]);
        };

        const handlerChangeMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
            setErrorRangePrice('');
            const priceMax = e.target.value ? Number(e.target.value) : propertiesStore.searchComponent.rangePrice[1];
            props.setFieldValue('price', [props.values.price[0], priceMax]);
        };

        return (
            <FrontModal
                blockScrolling={true}
                header={'Filters'}
                visible={isOpenModal}
                onHide={closeModal}
                footer={
                    <FrontButton className={'btn-primary'} onClick={handlerSearch} loading={propertiesStore.isLoading}>
                        Done
                    </FrontButton>
                }
                dismissableMask={true}
                position={'top'}
                className={'modal-sm form-wrap p-component_overflow-auto'}
            >
                <div className="mb">
                    <FrontNotificationField alertType={AlertType.danger} message={errorRangePrice} />
                    <div className="flex align-items-center flex-nowrap mb w-full">
                        <FrontInput
                            label={'Min price'}
                            value={props.values.price[0]}
                            name={'price'}
                            type={InputType.currency}
                            onBlur={handlerMinPrice}
                            onChange={handlerChangeMinPrice}
                            classWrapper={'w-full'}
                            minFractionDigits={0}
                            min={0}
                            max={appConfig.maxValueForSliderFilter}
                        />
                        <span className={'ml-3 mr-3'}>-</span>
                        <FrontInput
                            label={'Max price'}
                            value={props.values.price[1]}
                            name={'price'}
                            type={InputType.currency}
                            classWrapper={'w-full'}
                            onBlur={handlerMaxPrice}
                            onChange={handlerChangeMaxPrice}
                            minFractionDigits={0}
                            suffix={props.values.price[1] >= appConfig.maxValueForSliderFilter ? '+' : ''}
                            max={appConfig.maxValueForSliderFilter}
                        />
                    </div>
                    <FrontRangeSlider
                        name={'sliderPrice'}
                        value={props.values.sliderPrice}
                        min={
                            props.values.sliderPrice[0] > propertiesStore.searchComponent.rangePrice[0]
                                ? propertiesStore.searchComponent.rangePrice[0]
                                : props.values.sliderPrice[0]
                        }
                        max={
                            props.values.sliderPrice[1] > propertiesStore.searchComponent.rangePrice[1]
                                ? props.values.sliderPrice[1]
                                : propertiesStore.searchComponent.rangePrice[1]
                        }
                        onChange={handlerSliderPrice}
                    />
                </div>
                <div className="row mb">
                    <div className="flex align-items-center flex-nowrap  col-sm-6 mb-xs">
                        <FrontInput
                            name={'bedRooms'}
                            value={props.values.bedRooms ?? ''}
                            onChange={props.handleChange}
                            type={InputType.number}
                            label={'Bedrooms'}
                            classWrapper={'mr-2 w-full'}
                        />
                        <div className="flex align-items-center flex-nowrap">
                            <button
                                onClick={() => {
                                    props.setFieldValue('bedRooms', Number(props.values.bedRooms) + 1);
                                }}
                                className={'button-change-quantity button-change-quantity_plus mr-2'}
                            >
                                <span className="icon fas fa-plus"></span>
                                <span className={'display-none'}>+</span>
                            </button>
                            <button
                                onClick={() => {
                                    Number(props.values.bedRooms) - 1 >= 0 &&
                                        props.setFieldValue('bedRooms', Number(props.values.bedRooms) - 1);
                                }}
                                className={'button-change-quantity button-change-quantity_minus'}
                            >
                                <span className="icon fas fa-minus"></span>
                                <span className={'display-none'}>-</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex align-items-center flex-nowrap col-sm-6">
                        <FrontInput
                            name={'bathRooms'}
                            value={props.values.bathRooms ?? ''}
                            onChange={props.handleChange}
                            type={InputType.number}
                            label={'Bathrooms'}
                            classWrapper={'mr-2 w-full'}
                            min={0}
                        />

                        <div className="flex align-items-center flex-nowrap">
                            <button
                                onClick={() => {
                                    props.setFieldValue('bathRooms', Number(props.values.bathRooms) + 1);
                                }}
                                className={'button-change-quantity button-change-quantity_plus mr-2'}
                            >
                                <span className="icon fas fa-plus"></span>
                                <span className={'display-none'}>+</span>
                            </button>
                            <button
                                onClick={() => {
                                    Number(props.values.bathRooms) - 1 >= 0 &&
                                        props.setFieldValue('bathRooms', Number(props.values.bathRooms) - 1);
                                }}
                                className={'button-change-quantity button-change-quantity_minus'}
                            >
                                <span className="icon fas fa-minus"></span>
                                <span className={'display-none'}>-</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6 mb-4">
                        <FrontMultiSelect
                            hideAfterScroll={true}
                            wrapperListenerScroll={'p-dialog-content'}
                            value={props.values.propertyTypes}
                            options={propertyTypes}
                            onChange={props.handleChange}
                            name={'propertyTypes'}
                            optionLabel="fullName"
                            maxSelectedLabels={1}
                            className={'w-full'}
                            label={'Property type'}
                            id={`multiselect-propertyTypes`}
                            panelHeaderTemplate={panelHeaderTemplate}
                        />
                    </div>
                    <div className="col-sm-6 mb-4">
                        <FrontMultiSelect
                            hideAfterScroll={true}
                            wrapperListenerScroll={'p-dialog-content'}
                            value={props.values.cancellationPolicy}
                            options={cancellationPolicies}
                            onChange={props.handleChange}
                            name={'cancellationPolicy'}
                            optionLabel="fullName"
                            maxSelectedLabels={1}
                            className={'w-full'}
                            label={'Cancellation Policy'}
                            id={`multiselect-cancellationPolicy`}
                            panelHeaderTemplate={panelHeaderTemplate}
                        />
                    </div>
                    {arrGroupAmenities.map((group) => {
                        return (
                            <div className="col-sm-6 mb-4" key={group.key}>
                                <FrontMultiSelect
                                    hideAfterScroll={true}
                                    wrapperListenerScroll={'p-dialog-content'}
                                    value={props.values.amenities[group.key]}
                                    options={group.children}
                                    onChange={props.handleChange}
                                    name={`amenities[${group.key}]`}
                                    optionLabel="fullName"
                                    maxSelectedLabels={1}
                                    className={'w-full'}
                                    label={group.label}
                                    id={`multiselect-${group.key}`}
                                    panelHeaderTemplate={panelHeaderTemplate}
                                />
                            </div>
                        );
                    })}

                    <div className="col-sm-12 mb-4">
                        <FrontMultiSelect
                            hideAfterScroll={true}
                            wrapperListenerScroll={'p-dialog-content'}
                            value={props.values.houseRules}
                            options={HOUSE_RULES_DROPDOWN}
                            onChange={props.handleChange}
                            name={'houseRules'}
                            optionLabel="fullName"
                            maxSelectedLabels={1}
                            className={'w-full'}
                            label={'House Rules'}
                            id={`multiselect-houseRules`}
                            panelHeaderTemplate={panelHeaderTemplate}
                        />
                    </div>
                </div>
            </FrontModal>
        );
    }
);

export default AllFiltersModal;
