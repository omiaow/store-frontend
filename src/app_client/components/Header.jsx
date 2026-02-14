import './Header.css'
import { useState } from 'react'

function Header({ imageUrl, loading = false }) {
  const [isVerticalLogo, setIsVerticalLogo] = useState(false)

  return (
    <header className="customer-header">
      <div className="logo-container">
        {loading ? (
          <div className="logo-frame" aria-hidden="true">
            <div className="skeleton skeleton--block logo-skeleton" />
          </div>
        ) : (
          <div className="logo-frame">
            <img
              src={imageUrl || 'https://via.placeholder.com/150'}
              alt="Shop Logo"
              className={`logo-image ${isVerticalLogo ? 'logo-image--vertical' : 'logo-image--wide'}`}
              onLoad={(e) => {
                const img = e.currentTarget
                const w = img?.naturalWidth || 0
                const h = img?.naturalHeight || 0
                if (!w || !h) return
                setIsVerticalLogo(h > w)
              }}
            />
          </div>
        )}
      </div>
    </header>
  )
}

export default Header