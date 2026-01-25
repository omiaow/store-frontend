import './Header.css'

function Header({ imageUrl }) {
  return (
    <header className="customer-header">
      <div className="logo-container">
        <img 
          src={imageUrl || 'https://via.placeholder.com/150'} 
          alt="Shop Logo" 
          className="logo-image"
        />
      </div>
    </header>
  )
}

export default Header