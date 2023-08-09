import React, { FC } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { observer } from 'mobx-react-lite';
import Swiper, { Navigation, Pagination, A11y } from 'swiper';
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Property } from '../../../../../models/api/property';
import PropertyListSectionCard from '../../properties/list/card';
interface Props {
    popularProperties: Property[];
}

const PopularProperties: FC<Props> = observer(({ popularProperties }) => {
    const responsiveOptions = {
        560: {
            slidesPerView: 2,
            slidesPerGroup: 2,
        },
        767: {
            slidesPerView: 3,
            slidesPerGroup: 3,
        },
        1050: {
            slidesPerView: 4,
            slidesPerGroup: 1,
        },
    };

    const hideButtons = (swiper: Swiper) => {
        const buttons = document.querySelectorAll('.custom-carousel-button');
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (
            buttons[0].classList.contains('carousel-button-disabled') &&
            buttons[1].classList.contains('carousel-button-disabled')
        ) {
            swiperWrapper?.classList.add('center-slides');
            Array.from(buttons)?.forEach((button) => button.classList.add('carousel-buttons-hidden'));
        } else {
            swiperWrapper?.classList.remove('center-slides');
            Array.from(buttons)?.forEach((button) => button.classList.remove('carousel-buttons-hidden'));
        }
    };
    return (
        <section className="content-section">
            <div className="pop-props container">
                <h2 className="h4-style text-center">Popular Properties</h2>
                {popularProperties ? (
                    <>
                        <SwiperComponent
                            className="pop-props-slider mb"
                            breakpoints={responsiveOptions}
                            slidesPerView={1}
                            slidesPerGroup={1}
                            modules={[Navigation, Pagination, A11y]}
                            // warning, CPU intensive, as stated in: https://github.com/nolimits4web/swiper/issues/5625
                            watchSlidesProgress
                            navigation={{
                                nextEl: '.next',
                                prevEl: '.prev',
                                disabledClass: 'carousel-button-disabled',
                            }}
                            onResize={hideButtons}
                            pagination={{
                                clickable: true,
                                el: '.pop-prop-bullets',
                                type: 'bullets',
                                bulletElement: 'button',
                                bulletActiveClass: 'bullet-active',
                            }}
                        >
                            {popularProperties.map((property) => (
                                <SwiperSlide className="catalog-listing swiper-slide" key={property.id}>
                                    <PropertyListSectionCard property={property} />
                                </SwiperSlide>
                            ))}
                        </SwiperComponent>
                        <div className="pop-prop-controls">
                            <button className="prev custom-carousel-button">
                                <span className="p-carousel-prev-icon pi pi-chevron-left" />
                            </button>
                            <div className="pop-prop-bullets" />
                            <button className="next custom-carousel-button">
                                <span className="p-carousel-next-icon pi pi-chevron-right" />
                            </button>
                        </div>
                    </>
                ) : (
                    <ProgressSpinner animationDuration="1.4s" />
                )}
            </div>
        </section>
    );
});

export default PopularProperties;
