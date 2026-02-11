import React, { useEffect, useMemo, useState } from 'react';
import '../shop/Shop.css';

import DesktopOnlyBlock from '../shop/components/DesktopOnlyBlock';
import CreateShopHeader from '../shop/components/CreateShopHeader';
import CreateFooter from '../shop/components/CreateFooter';
import useHttp from '../../hooks/http.hook';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ProductDetailsForm from './components/ProductDetailsForm';

function UpsertProduct({ onSaved }) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const productId = params.productId || null;
    const isEdit = !!productId;

    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');
    const [submitError, setSubmitError] = useState(null);
    const [isPrefillLoading, setIsPrefillLoading] = useState(false);

    const { loading, requestWithMeta } = useHttp();

    const parsedPrice = useMemo(() => {
        const normalized = String(price).replace(',', '.').trim();
        if (!normalized) return NaN;
        const n = Number(normalized);
        return Number.isFinite(n) ? n : NaN;
    }, [price]);

    const payloadPreview = useMemo(() => {
        return {
            name: name.trim(),
            imageUrl: imageUrl.trim() || null,
            price: parsedPrice,
        };
    }, [name, imageUrl, parsedPrice]);

    useEffect(() => {
        let cancelled = false;
        if (!isEdit) return;

        setSubmitError(null);

        async function prefill() {
            setIsPrefillLoading(true);
            try {
                const stateProduct = location?.state?.product ?? null;
                const stateId = stateProduct?._id ?? stateProduct?.id ?? null;
                if (stateProduct && stateId && String(stateId) === String(productId)) {
                    if (cancelled) return;
                    setName(stateProduct?.name ?? '');
                    setImageUrl(stateProduct?.imageUrl ?? stateProduct?.image_url ?? '');
                    setPrice(
                        stateProduct?.price !== undefined && stateProduct?.price !== null
                            ? String(stateProduct.price)
                            : ''
                    );
                    return;
                }

                const res = await requestWithMeta('/operator/products', 'GET');
                if (!res?.ok) {
                    if (cancelled) return;
                    setSubmitError(res?.data?.error || res?.data?.message || 'Не удалось загрузить товары');
                    return;
                }

                const data = res?.data;
                const listRaw = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.products)
                        ? data.products
                        : [];

                const found = listRaw.find((p) => {
                    const id = p?._id ?? p?.id;
                    if (!id) return false;
                    return String(id) === String(productId);
                });

                if (!found) {
                    if (cancelled) return;
                    setSubmitError('Товар не найден');
                    return;
                }

                if (cancelled) return;
                setName(found?.name ?? '');
                setImageUrl(found?.imageUrl ?? found?.image_url ?? '');
                setPrice(
                    found?.price !== undefined && found?.price !== null ? String(found.price) : ''
                );
            } finally {
                if (!cancelled) setIsPrefillLoading(false);
            }
        }

        prefill();
        return () => {
            cancelled = true;
        };
    }, [isEdit, productId, location?.state, requestWithMeta]);

    const isSubmitDisabled =
        loading ||
        isPrefillLoading ||
        name.trim().length === 0 ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0;

    async function handleSubmit() {
        setSubmitError(null);

        if (isEdit) {
            const priceNumber = Number(String(price).replace(',', '.').trim());
            if (!Number.isFinite(priceNumber) || priceNumber < 0) {
                setSubmitError('Цена должна быть числом >= 0');
                return;
            }

            const res = await requestWithMeta('/operator/products', 'PUT', {
                productId,
                name: String(name ?? '').trim(),
                price: priceNumber,
                imageUrl: String(imageUrl ?? '').trim() || null,
            });

            if (!res?.ok) {
                setSubmitError(res?.data?.error || res?.data?.message || 'Не удалось обновить товар');
                return;
            }

            const updatedId = res?.data?.product?.id ?? res?.data?.product?._id ?? productId;
            const updated = res?.data?.product
                ? { ...res.data.product, _id: updatedId, id: updatedId }
                : null;
            if (typeof onSaved === 'function') onSaved(updated ?? { _id: productId, id: productId });
            navigate('/provider/branch/store', { replace: true });
            return;
        }

        const res = await requestWithMeta('/operator/products', 'POST', payloadPreview);
        if (!res?.ok) {
            setSubmitError(res?.data?.error || res?.data?.message || 'Не удалось создать товар');
            return;
        }

        setName('');
        setImageUrl('');
        setPrice('');

        if (typeof onSaved === 'function') onSaved(res?.data ?? null);
        navigate('/provider/branch/store', { replace: true });
    }

    return (
        <div className="shop-create-root">
            <DesktopOnlyBlock />

            <div className="shop-create-mobile">
                <CreateShopHeader
                    title={isEdit ? 'Редактировать товар' : 'Создать товар'}
                    subtitle={
                        isEdit
                            ? 'Измените название, изображение и цену'
                            : 'Добавьте название, изображение и цену'
                    }
                    onBack={() => navigate('/provider/branch/store')}
                />

                <main className="shop-create-content">
                    {submitError ? (
                        <section className="shop-create-section shop-create-sectionError">
                            <div className="shop-create-label">Ошибка</div>
                            <div className="shop-create-help shop-create-helpTight">{submitError}</div>
                        </section>
                    ) : null}

                    <ProductDetailsForm
                        name={name}
                        onNameChange={setName}
                        imageUrl={imageUrl}
                        onImageUrlChange={setImageUrl}
                        price={price}
                        onPriceChange={setPrice}
                    />
                </main>

                <CreateFooter
                    disabled={isSubmitDisabled}
                    label={
                        loading
                            ? isEdit
                                ? 'Сохранение…'
                                : 'Создание…'
                            : isEdit
                                ? 'Сохранить'
                                : 'Создать товар'
                    }
                    onCreate={handleSubmit}
                />
            </div>
        </div>
    );
}

export default UpsertProduct;

