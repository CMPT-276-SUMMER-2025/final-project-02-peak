import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import "swiper/css/navigation"; // import styles for arrows

import Activity_Card from "../activity_card/activity_card";

import "./activity_carousel.css";

function Activity_Carousel({ category, list }) {
  const getPhotoUrl = (imgSrc, maxWidth) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!imgSrc) return "default_img.jpg";

    return `https://places.googleapis.com/v1/${imgSrc}/media?key=${API_KEY}&maxWidthPx=${maxWidth}`;
  };

  return (
    <div className="carousel-container">
      <h1>{category}</h1>
      <div className="carousel-wrapper">
        <Swiper
          modules={[Navigation]}
          spaceBetween={60}
          slidesPerView={4}
          breakpoints={{
            0: {
              slidesPerView: 1,
              slidesPerGroup: 1,
            },
            600: {
              slidesPerView: 2,
              slidesPerGroup: 2,
            },
            800: {
              slidesPerView: 3,
              slidesPerGroup: 3,
            },
            1024: {
              slidesPerView: 4,
              slidesPerGroup: 4,
            },
            1440: {
              slidesPerView: 5,
              slidesPerGroup: 5,
            },
          }}
          navigation
          // loop
          className="carousel"
        >
          {list.map((attr, i) => (
            <SwiperSlide key={i}>
              <div className="activity_card_container">
                <Activity_Card
                  id={attr.id}
                  img={
                    attr.photos && attr.photos.length > 0
                      ? getPhotoUrl(attr.photos[0].name, 300)
                      : "default_img"
                  }
                  title={attr.displayName.text}
                  desc={
                    attr.editorialSummary?.text ||
                    attr.generativeSummary?.text ||
                    ""
                  }
                  rating={attr.rating}
                  price_level={attr.priceLevel || ""}
                  location={attr.location}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default Activity_Carousel;
