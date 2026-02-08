import React from 'react';
import Hero from '../components/Hero';
import Products from '../components/Products';
import ProductsByClass from '../components/ProductsByClass';
import FeaturedCategories from '../components/FeaturedCategories';
import EidCollections from '../components/EidCollections';
import OutletLocationHero from '../components/OutletLocationHero';

const Home = () => {
    return (
        <div>
            <Hero />
            <FeaturedCategories />
            {/* <EidCollections /> */}
            <ProductsByClass/>
            {/* <Products /> */}
            <OutletLocationHero/>
        </div>
    );
};

export default Home;