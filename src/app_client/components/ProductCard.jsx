import { useState } from 'react'
import './ProductCard.css'

function ProductCard({ product, onAddToCart }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAddClick = (e) => {
    e.stopPropagation()
    setIsAnimating(true)
    
    // Get button position for animation origin
    const buttonRect = e.currentTarget.getBoundingClientRect()
    
    // Trigger animation and add to cart
    if (onAddToCart) {
      onAddToCart(product, {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2
      })
    }

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false)
    }, 600)
  }

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
        />
        <div className="image-gradient-overlay"></div>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-container">
          <div className="product-price">{product.price.toFixed(2)} сом</div>
          <button 
            className={`add-button ${isAnimating ? 'animating' : ''}`}
            onClick={handleAddClick}
            aria-label="Add to cart"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M10 4V16M4 10H16" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard