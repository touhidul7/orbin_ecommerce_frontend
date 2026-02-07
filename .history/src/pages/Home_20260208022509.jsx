import React from 'react';
import Hero from '../components/Hero';
import Products from '../components/Products';
import ProductsByClass from '../components/ProductsByClass';
import FeaturedCategories from '../components/FeaturedCategories';

const Home = () => {
    return (
        <div>
            <Hero />
            <FeaturedCategories />
            <ProductsByClass/>
            {/* <Products /> */}
        </div>
    );
};

export default Home;