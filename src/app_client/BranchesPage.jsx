import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useHttp from '../hooks/http.hook'
import './BranchesPage.css'

function ensureLeafletLoaded() {
  // Load Leaflet via CDN (no npm deps). Safe to call multiple times.
  if (window.L) return Promise.resolve(window.L)

  const existingScript = document.querySelector('script[data-leaflet="true"]')
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.L))
      existingScript.addEventListener('error', reject)
    })
  }

  if (!document.querySelector('link[data-leaflet="true"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.setAttribute('data-leaflet', 'true')
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.defer = true
    script.setAttribute('data-leaflet', 'true')
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
  })
}

function BranchesPage() {
  const { store } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { requestWithMeta } = useHttp()

  const mapElRef = useRef(null)
  const leafletMapRef = useRef(null)
  const leafletMarkersRef = useRef(null)

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const requiredByProductId = useMemo(() => {
    const map = new Map()
    const fromState = location.state?.cartItems
    if (Array.isArray(fromState) && fromState.length) {
      for (const it of fromState) {
        const id = it?.id
        const qty = Number(it?.quantity || 0)
        if (!id || !Number.isFinite(qty) || qty <= 0) continue
        map.set(String(id), qty)
      }
      return map
    }

    // If we only have query params, treat each as quantity 1.
    const qs = new URLSearchParams(location.search)
    const ids = qs.getAll('productIds').filter(Boolean)
    ids.forEach((id) => map.set(String(id), 1))
    return map
  }, [location.state, location.search])

  const productIds = useMemo(() => {
    const qs = new URLSearchParams(location.search)
    const fromQuery = qs.getAll('productIds').filter(Boolean)
    if (fromQuery.length) return fromQuery

    const fromState = (location.state?.cartItems || [])
      .map((it) => it?.id)
      .filter(Boolean)

    return fromState
  }, [location.search, location.state])

  const branchHasEnough = useCallback((branch) => {
    if (!requiredByProductId || requiredByProductId.size === 0) return true
    const available = new Map()
    const counts = branch?.productCounts || []
    for (const c of counts) {
      const pid = c?.productId
      if (!pid) continue
      available.set(String(pid), Number(c?.count || 0))
    }
    for (const [pid, needed] of requiredByProductId.entries()) {
      const have = available.get(String(pid)) ?? 0
      if (have < needed) return false
    }
    return true
  }, [requiredByProductId])

  const cartItems = useMemo(() => {
    const items = location.state?.cartItems
    return Array.isArray(items) ? items : []
  }, [location.state])

  useEffect(() => {
    const fetchBranches = async () => {
      if (!store) {
        setError('Store is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const qs = new URLSearchParams()
        productIds.forEach((id) => qs.append('productIds', id))

        const { ok, data, status } = await requestWithMeta(
          `/store/${encodeURIComponent(store)}/branches${qs.toString() ? `?${qs.toString()}` : ''}`
        )

        if (!ok) {
          if (status === 404) setError('Store not found')
          else setError(data?.error || data?.message || 'Ошибка загрузки филиалов')
          return
        }

        setBranches(data?.branches || [])
      } catch (e) {
        setError(e.message || 'Ошибка загрузки филиалов')
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [store, productIds, requestWithMeta])

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!mapElRef.current) return
      const L = await ensureLeafletLoaded()
      if (cancelled) return
      if (leafletMapRef.current) return

      const fallbackLat = 42.87658553054612
      const fallbackLng = 74.6036089976348
      const first = branches?.[0]?.location
      const initialLat = typeof first?.lat === 'number' ? first.lat : fallbackLat
      const initialLng = typeof first?.lng === 'number' ? first.lng : fallbackLng

      const map = L.map(mapElRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialLat, initialLng], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

      leafletMarkersRef.current = L.layerGroup().addTo(map)
      leafletMapRef.current = map
      setTimeout(() => map.invalidateSize(), 0)
    }

    initMap()

    return () => {
      cancelled = true
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
      leafletMarkersRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = leafletMapRef.current
    const L = window.L
    const layer = leafletMarkersRef.current
    if (!map || !L || !layer) return

    layer.clearLayers()

    const points = []
    for (const b of branches) {
      const lat = b?.location?.lat
      const lng = b?.location?.lng
      if (typeof lat !== 'number' || typeof lng !== 'number') continue

      points.push([lat, lng])
      const hasEnough = branchHasEnough(b)
      const logoUrl = b?.logoUrl || b?.shopLogoUrl || ''
      const safeLogoUrl = String(logoUrl || '').replace(/"/g, '&quot;')

      const icon = L.divIcon({
        className: 'client-branch-pinIcon',
        html: `
          <div class="client-branch-pin ${hasEnough ? '' : 'client-branch-pin--insufficient'}" role="img" aria-label="Branch">
            <div class="client-branch-pinBadge">
              ${
                safeLogoUrl
                  ? `<img class="client-branch-pinLogo" src="${safeLogoUrl}" alt="" />`
                  : `<div class="client-branch-pinLogo client-branch-pinLogo--placeholder"></div>`
              }
            </div>
            <div class="client-branch-pinArrow" aria-hidden="true"></div>
          </div>
        `,
        iconSize: [56, 72],
        iconAnchor: [28, 72],
        popupAnchor: [0, -68],
      })

      const popup = hasEnough
        ? `Филиал: ${b?._id || ''}`
        : `Недостаточно товаров на складе`
      const marker = L.marker([lat, lng], { icon }).bindPopup(popup).addTo(layer)
      marker.on('click', () => {
        if (!hasEnough) return
        const bid = b?._id
        if (!bid) return
        navigate(`/${encodeURIComponent(store)}/branches/${encodeURIComponent(bid)}/booking`, {
          state: { cartItems },
        })
      })
    }

    if (points.length >= 2) {
      map.fitBounds(points, { padding: [40, 40] })
    } else if (points.length === 1) {
      map.setView(points[0], 15)
    }
  }, [branches, branchHasEnough, cartItems, navigate, store])

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) return
    const map = leafletMapRef.current
    const L = window.L
    if (!map || !L) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        map.setView([lat, lng], 15)
        L.circleMarker([lat, lng], {
          radius: 8,
          color: '#2563eb',
          weight: 2,
          fillColor: '#2563eb',
          fillOpacity: 0.25,
        }).addTo(map)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  return (
    <div className="client-branches-page">
      <div ref={mapElRef} className="client-branches-map" />

      <div className="client-branches-controls" aria-hidden="false">
        <button
          className="client-branches-fab client-branches-fabBack"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          title="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="client-branches-fab client-branches-fabMyLoc"
          type="button"
          onClick={useMyLocation}
          aria-label="My location"
          title="My location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2v3m0 14v3M2 12h3m14 0h3"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="client-branches-status">
        {loading && <div className="client-branches-chip">Загрузка филиалов…</div>}
        {!loading && error && <div className="client-branches-chip client-branches-chipError">{error}</div>}
        {!loading && !error && (
          <div className="client-branches-chip">
            Выберите филиал
          </div>
        )}
      </div>
    </div>
  )
}

export default BranchesPage
