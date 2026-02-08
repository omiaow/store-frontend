import './Header.css'

function Header({ imageUrl, loading = false }) {
  return (
    <header className="customer-header">
      <div className="logo-container">
        {loading ? (
          <div className="skeleton skeleton--block logo-skeleton" aria-hidden="true" />
        ) : (
          <img
            src={imageUrl || 'https://via.placeholder.com/150'}
            alt="Shop Logo"
            className="logo-image"
          />
        )}
      </div>
    </header>
  )
}

export default Header