import React, { useEffect, useState } from "react";
import Hero from "../components/Layout/Hero";
import GenderCollectionSection from "../components/Products/GenderCollectionSection";
import NewArrivals from "../components/Products/NewArrivals";
import ProductDetails from "../components/Products/ProductDetails";
import ProductGrid from "../components/Products/ProductGrid";
import FeaturedCollection from "../components/Products/FeaturedCollection";
import FeaturesSection from "../components/Products/FeaturesSection";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productSlice";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  const [bestSellerProduct, setBestSellerProduct] = useState(null);

  useEffect(() => {
    // Fetch products for Women Bottom Wear (limit 8)
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        category: "Bottom Wear",
        limit: 8,
      })
    );

    // Fetch best seller product
    const fetchBestSeller = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`
        );
        setBestSellerProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch best seller product:", error);
      }
    };

    fetchBestSeller();
  }, [dispatch]);

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Gender Collection */}
      <GenderCollectionSection />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Best Seller Section */}
      <section className="my-12">
        <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
        {bestSellerProduct ? (
          <ProductDetails productId={bestSellerProduct._id} />
        ) : (
          <p className="text-center">Loading best seller product ...</p>
        )}
      </section>

      {/* Top Wears */}
      <div className="container mx-auto p-6">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top Wears for Women
        </h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>

      {/* Featured Collection */}
      <FeaturedCollection />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
};

export default Home;
