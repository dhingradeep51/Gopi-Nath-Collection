import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import { FaCartPlus, FaInfoCircle } from "react-icons/fa";

const SearchResults = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const goldColor = "#D4AF37";
  const burgundyColor = "#2D0A14";
  const darkBg = "#1a050b";

  useEffect(() => {
    if (keyword) getSearchResults();
  }, [keyword]);

  const getSearchResults = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/search/${keyword}`);
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Error fetching search results");
    }
  };

  return (
    <Layout title={`Search Results for "${keyword}" - Gopi Nath Collection`}>
      <div className="search-results-page">
        <div className="container mt-3">
          <div className="text-center mb-5">
            <h1 className="search-title">Search Results</h1>
            <h6 className="search-subtitle">
              {products.length < 1 
                ? `No products found for "${keyword}"` 
                : `Found ${products.length} divine items for "${keyword}"`}
            </h6>
          </div>

          <div className="row justify-content-center">
            {products?.map((p) => (
              <div className="card m-3 search-product-card" key={p._id}>
                <div className="card-img-wrapper">
                  <img
                    src={`/api/v1/product/product-photo/${p._id}`}
                    className="card-img-top"
                    alt={p.name}
                    onClick={() => navigate(`/product/${p.slug}`)}
                  />
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">{p.name}</h5>
                    <h5 className="card-price">₹{p.price}</h5>
                  </div>
                  <p className="card-text">
                    {p.description.substring(0, 50)}...
                  </p>
                  <div className="card-action-btns">
                    <button
                      className="btn btn-details"
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      <FaInfoCircle /> DETAILS
                    </button>
                    <button
                      className="btn btn-add-cart"
                      onClick={() => {
                        setCart([...cart, p]);
                        localStorage.setItem("cart", JSON.stringify([...cart, p]));
                        toast.success("Added to Cart");
                      }}
                    >
                      <FaCartPlus /> ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .search-results-page {
          background-color: ${darkBg};
          min-height: 100vh;
          padding: 40px 0;
          color: white;
        }
        .search-title {
          color: ${goldColor};
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-style: italic;
        }
        .search-subtitle {
          opacity: 0.7;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 14px;
        }
        .search-product-card {
          width: 18rem;
          background-color: ${burgundyColor};
          border: 1px solid ${goldColor}33;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .search-product-card:hover {
          transform: translateY(-5px);
          border-color: ${goldColor};
        }
        .card-img-wrapper {
          height: 250px;
          overflow: hidden;
        }
        .card-img-top {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
        }
        .card-title {
          color: ${goldColor};
          font-size: 1.1rem;
          margin: 0;
        }
        .card-price {
          color: #fff;
          font-weight: bold;
          margin: 0;
        }
        .card-text {
          font-size: 13px;
          color: #ccc;
          margin: 15px 0;
        }
        .card-action-btns {
          display: flex;
          gap: 10px;
        }
        .btn-details {
          flex: 1;
          background: transparent;
          border: 1px solid ${goldColor};
          color: ${goldColor};
          font-size: 12px;
          font-weight: bold;
        }
        .btn-add-cart {
          flex: 1;
          background-color: ${goldColor};
          color: ${burgundyColor};
          font-size: 12px;
          font-weight: bold;
          border: none;
        }
        .btn-add-cart:hover {
          background-color: #fff;
        }
      `}</style>
    </Layout>
  );
};

export default SearchResults;