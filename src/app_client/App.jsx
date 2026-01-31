import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Header from './components/Header'
import ProductCard from './components/ProductCard'
import Footer from './components/Footer'
import FloatingActionButton from './components/FloatingActionButton'
import CartModal from './components/CartModal'
import useHttp from '../hooks/http.hook'
import './CustomerSide.css'

function CustomerSide() {
  const { store } = useParams()
  const { requestWithMeta } = useHttp()
  const [cart, setCart] = useState({})
  const [fabVisible, setFabVisible] = useState(false)
  const [fabPosition, setFabPosition] = useState(null)
  const [products, setProducts] = useState([])
  // const [branches, setBranches] = useState([])
  const [storeData, setStoreData] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Global `index.css` locks scrolling + root height for Telegram/provider UX.
  // Customer side should scroll normally with non-sticky header/footer.
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const root = document.getElementById('root')
    const prevRootOverflow = root?.style.overflow
    const prevRootHeight = root?.style.height
    const prevRootMinHeight = root?.style.minHeight

    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    if (root) {
      root.style.overflow = 'visible'
      root.style.height = 'auto'
      root.style.minHeight = '100vh'
    }

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
      if (root) {
        root.style.overflow = prevRootOverflow || ''
        root.style.height = prevRootHeight || ''
        root.style.minHeight = prevRootMinHeight || ''
      }
    }
  }, [])

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!store) {
        setError('Store name is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const { ok, status, data } = await requestWithMeta(`/${encodeURIComponent(store)}`)
        if (!ok) {
          if (status === 404) setError('Store not found')
          else setError(data?.message || 'Failed to load store data')
          return
        }
        
        // Map products to match ProductCard's expected format
        const mappedProducts = (data?.products || []).map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          description: product.description || '',
          ...product // Include all other product fields
        }))

        setStoreData(data.shop)
        // setBranches(data.branches)
        setProducts(mappedProducts)
      } catch (err) {
        setError('Failed to fetch store data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [store, requestWithMeta])

  const handleAddToCart = (product, buttonPosition) => {
    const key = String(product?.id ?? product?._id ?? product?.productId ?? product?.name ?? '')
    if (!key) return

    // Add/increment product in cart
    setCart(prev => {
      const existing = prev[key]
      if (existing) {
        return {
          ...prev,
          [key]: { ...existing, quantity: existing.quantity + 1 },
        }
      }
      return {
        ...prev,
        [key]: {
          key,
          id: product?.id ?? product?._id ?? key,
          name: product?.name ?? 'Unknown',
          price: typeof product?.price === 'number' ? product.price : undefined,
          image: product?.image,
          quantity: 1,
        },
      }
    })

    // Show FAB with animation from button position
    if (!fabVisible) {
      setFabPosition(buttonPosition)
      setFabVisible(true)
    }
  }

  const cartSummary = useMemo(() => Object.values(cart), [cart])
  const cartCount = useMemo(
    () => cartSummary.reduce((sum, it) => sum + (it.quantity || 0), 0),
    [cartSummary]
  )

  const handleCartIncrease = (key) => {
    setCart(prev => {
      const it = prev[key]
      if (!it) return prev
      return { ...prev, [key]: { ...it, quantity: it.quantity + 1 } }
    })
  }

  const handleCartDecrease = (key) => {
    setCart(prev => {
      const it = prev[key]
      if (!it) return prev
      if (it.quantity <= 1) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: { ...it, quantity: it.quantity - 1 } }
    })
  }

  const handleCartRemoveLine = (key) => {
    setCart(prev => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  useEffect(() => {
    if (cartCount === 0) {
      setFabVisible(false)
      setIsCartOpen(false)
    }
  }, [cartCount])

  return (
    <div className="customer-side">
      <Header imageUrl={storeData?.logoUrl} />
      <main className="customer-main">
        {loading && (
          <div className="loading-container">
            <p>Loading products...</p>
          </div>
        )}
        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <div className="products-container">
            {products.length === 0 ? (
              <p>No products available</p>
            ) : (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
      <FloatingActionButton 
        count={cartCount}
        isVisible={fabVisible && cartCount > 0}
        initialPosition={fabPosition}
        onClick={() => setIsCartOpen(true)}
      />
      <CartModal
        isOpen={isCartOpen}
        items={cartSummary}
        onIncrease={handleCartIncrease}
        onDecrease={handleCartDecrease}
        onRemove={handleCartRemoveLine}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  )
}

export default CustomerSide
