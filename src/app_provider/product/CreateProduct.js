import React, { useMemo, useState } from 'react';
import '../shop/Shop.css';

import DesktopOnlyBlock from '../shop/components/DesktopOnlyBlock';
import CreateShopHeader from '../shop/components/CreateShopHeader';
import CreateFooter from '../shop/components/CreateFooter';
import useHttp from '../../hooks/http.hook';
import { useNavigate } from 'react-router-dom';

import ProductDetailsForm from './components/ProductDetailsForm';

function CreateProduct({ onCreated }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [price, setPrice] = useState('');

    const { loading, request, error, clearError } = useHttp();

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

    const isCreateDisabled =
        loading ||
        name.trim().length === 0 ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0;

    async function handleCreate() {
        clearError();

        const response = await request('/operator/products', 'POST', payloadPreview);
        if (response?.error) return;

        setName('');
        setImageUrl('');
        setPrice('');

        if (typeof onCreated === 'function') onCreated(response);
        navigate('/provider/branch/store', { replace: true });
    }

    return (
        <div className="shop-create-root">
            <DesktopOnlyBlock />

            <div className="shop-create-mobile">
                <CreateShopHeader
                    title="Create product"
                    subtitle="Add product name, image and price"
                    onBack={() => navigate('/provider/branch/store')}
                />

                <main className="shop-create-content">
                    {error ? (
                        <section className="shop-create-section shop-create-sectionError">
                            <div className="shop-create-label">Error</div>
                            <div className="shop-create-help shop-create-helpTight">
                                {error}
                            </div>
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
                    disabled={isCreateDisabled}
                    label={loading ? 'Creating…' : 'Create product'}
                    onCreate={handleCreate}
                />
            </div>
        </div>
    );
}

export default CreateProduct;

