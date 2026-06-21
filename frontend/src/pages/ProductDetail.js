import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    productAPI.getOne(id)
      .then(({ data }) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  const getImageSrc = (image) => {
    if (!image) return 'https://via.placeholder.com/500x400?text=No+Image';
    if (image.startsWith('http')) return image;
    return `http://localhost:8000${image}`;
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      await addToCart(product.id, qty);
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await productAPI.addReview({ ...review, product: id });
      toast.success('Review submitted!');
      const { data } = await productAPI.getOne(id);
      setProduct(data);
      setReview({ rating: 5, comment: '' });
    } catch { toast.error('Failed to submit review'); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!product) return <div className="container" style={{ padding: '4rem' }}>Product not found</div>;

  return (
    <div className="container product-detail">
      <div className="detail-grid">
        <div className="detail-image">
          <img
            src={getImageSrc(product.image)}
            alt={product.name}
          />
        </div>
        <div className="detail-info">
          <span className="detail-category">{product.category_name}</span>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-rating">
            {'★'.repeat(Math.round(product.avg_rating || 0))}{'☆'.repeat(5 - Math.round(product.avg_rating || 0))}
            <span> ({product.reviews?.length || 0} reviews)</span>
          </div>
          <p className="detail-price">₹{parseFloat(product.price).toLocaleString()}</p>
          <p className="detail-desc">{product.description}</p>
          <p className="detail-stock">
            {product.stock > 0 ? `✅ In Stock (${product.stock} left)` : '❌ Out of Stock'}
          </p>
          <div className="detail-actions">
            <div className="qty-control">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{ flex: 1 }}
            >
              🛒 Add to Cart
            </button>
          </div>
          <p className="detail-seller">Sold by: <strong>{product.seller_name}</strong></p>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        {product.reviews?.length === 0 && <p style={{ color: 'var(--gray)' }}>No reviews yet.</p>}
        {product.reviews?.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-header">
              <strong>{r.user}</strong>
              <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}

        {user && (
          <form onSubmit={handleReview} className="review-form">
            <h3>Write a Review</h3>
            <div className="form-group">
              <label>Rating</label>
              <select value={review.rating} onChange={e => setReview({ ...review, rating: e.target.value })}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                value={review.comment}
                onChange={e => setReview({ ...review, comment: e.target.value })}
                rows={3}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Review</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
