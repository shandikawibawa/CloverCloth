import React from 'react';
import heroImg from '../../assets/clovercloth-hero.png';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative">
      <img
        src={heroImg}
        alt="CloverCloth"
        className="w-full h-[300px] sm:h-[400px] lg:h-[550px] object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center md:justify-end px-4 md:pr-16 lg:pr-32">
        <div className="text-center md:text-left text-white max-w-xl">
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight uppercase mb-4 leading-tight">
            Vacation <br /> Ready
          </h1>
          <p className="text-xs sm:text-sm md:text-lg mb-6">
            Explore our Vacation-ready outfits with fast worldwide shipping.
          </p>
          <Link
            to="/collections/all"
            className="bg-white text-gray-950 px-4 sm:px-6 py-2 rounded-sm text-sm sm:text-lg"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
