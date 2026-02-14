import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useHttp from '../hooks/http.hook'
import './BookingPage.css'

function BookingPage() {
  const { store, branchId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { requestWithMeta } = useHttp()

  const cartItems = useMemo(() => {
    const items = location.state?.cartItems
    return Array.isArray(items) ? items : []
  }, [location.state])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const canSubmit = useMemo(() => {
    if (!store || !branchId) return false
    if (!name.trim()) return false
    if (!phone.trim()) return false
    if (!cartItems.length) return false
    return true
  }, [store, branchId, name, phone, cartItems.length])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return

    try {
      setSubmitting(true)
      setError(null)

      const products = cartItems.map((it) => ({
        productId: it.id,
        quantity: it.quantity,
      }))

      const { ok, data } = await requestWithMeta(
        `/store/${encodeURIComponent(store)}/branches/${encodeURIComponent(branchId)}/order`,
        'POST',
        {
          products,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerDescription: description.trim() || undefined,
        }
      )

      if (!ok) {
        setError(data?.error || data?.message || 'Failed to create booking')
        return
      }

      setSuccess(true)
    } catch (e) {
      setError(e.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }, [canSubmit, cartItems, store, branchId, name, phone, description, requestWithMeta])

  const goToMainPage = useCallback(() => {
    if (!store) return
    navigate(`/${encodeURIComponent(store)}`, { replace: true })
  }, [navigate, store])

  return (
    <div className="client-booking-page">
      <div className="client-booking-header">
        <button className="client-booking-back" type="button" onClick={goToMainPage}>
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
        <div className="client-booking-title">Заказ</div>
        <div className="client-booking-spacer" />
      </div>

      <div className="client-booking-content">
        {success ? (
          <div className="client-booking-card">
            <div className="client-booking-successTitle">Заказ создан</div>
            <div className="client-booking-successText">
              Ваш заказ был создан. Пожалуйста, посетите филиал для получения вашего заказа.
            </div>
            <button className="client-booking-primary" type="button" onClick={() => navigate(`/${encodeURIComponent(store)}`)}>
              Вернуться к продуктам
            </button>
          </div>
        ) : (
          <div className="client-booking-card">
            <div className="client-booking-cardTitle">Детали заказа</div>

            {!cartItems.length && (
              <div className="client-booking-warning">
                Корзина пуста. Пожалуйста, вернитесь и выберите продукты сначала.
              </div>
            )}

            <label className="client-booking-label">
              Имя
              <input
                className="client-booking-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                autoComplete="name"
              />
            </label>

            <label className="client-booking-label">
              Телефон
              <input
                className="client-booking-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 ..."
                autoComplete="tel"
                inputMode="tel"
              />
            </label>

            <label className="client-booking-label">
              Комментарий (необязательно)
              <textarea
                className="client-booking-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Что-нибудь, что мы должны знать?"
                rows={3}
              />
            </label>

            {error && <div className="client-booking-error">{error}</div>}

            <button
              className="client-booking-primary"
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Создание заказа…' : 'Создать заказ'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingPage

