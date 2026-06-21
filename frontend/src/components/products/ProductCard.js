import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    try {
      await addToCart(product.id);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const getImageSrc = (image) => {
    if (!image) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (image.startsWith('http')) return image;
    return `http://localhost:8000${image}`;
  };

  const stars = '★'.repeat(Math.round(product.avg_rating || 0)) +
                '☆'.repeat(5 - Math.round(product.avg_rating || 0));

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-img-wrap">
        <img
          src={getImageSrc(product.image)}
          alt={product.name}
        />
        {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category_name}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <span className="stars">{stars}</span>
          <span className="review-count">({product.reviews?.length || 0})</span>
        </div>
        <div className="product-footer">
          <span className="product-price">₹{parseFloat(product.price).toLocaleString()}</span>
          <button
            className="btn btn-primary add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : '+ Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
