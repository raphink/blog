import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

export default function Carousel({ slides }) {
    return (
        <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="carousel-swiper"
        >
            {slides.map((slide, i) => (
                <SwiperSlide key={i}>
                    <img src={slide.src} alt={slide.alt} loading="lazy" />
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
