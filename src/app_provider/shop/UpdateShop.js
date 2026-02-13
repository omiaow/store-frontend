import React, { useEffect, useMemo, useState } from 'react';
import './Shop.css';

import DesktopOnlyBlock from './components/DesktopOnlyBlock';
import CreateShopHeader from './components/CreateShopHeader';
import ShopDetailsForm from './components/ShopDetailsForm';
import CreateFooter from './components/CreateFooter';
import useHttp from '../../hooks/http.hook';
import { useNavigate, useLocation } from 'react-router-dom';

function UpdateShop({ initialShop }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, requestWithMeta } = useHttp();

    const shopFromState = location?.state?.shop || null;
    const initial = initialShop || shopFromState || null;

    const [name, setName] = useState(initial?.name ?? '');
    const [customName, setCustomName] = useState(initial?.customName ?? '');
    const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '');
    const [error, setError] = useState(null);
    const [prefillLoading, setPrefillLoading] = useState(false);
    const [isLogoUploading, setIsLogoUploading] = useState(false);

    useEffect(() => {
        // Instant prefill from navigation state/prop (if present),
        // then we still fetch fresh data from API below.
        if (!initial) return;
        setName(initial?.name ?? '');
        setCustomName(initial?.customName ?? '');
        setLogoUrl(initial?.logoUrl ?? '');
    }, [initial]);

    useEffect(() => {
        let cancelled = false;

        async function loadShop() {
            setError(null);
            setPrefillLoading(true);
            try {
                const res = await requestWithMeta('/operator/store', 'GET');
                if (cancelled) return;

                if (!res?.ok) {
                    setError(res?.data?.error || res?.data?.message || 'Не удалось загрузить магазин');
                    return;
                }

                const shop = res?.data?.shop ?? res?.data ?? null;
                setName(shop?.name ?? '');
                setCustomName(shop?.customName ?? '');
                setLogoUrl(shop?.logoUrl ?? '');
            } finally {
                if (!cancelled) setPrefillLoading(false);
            }
        }

        loadShop();
        return () => {
            cancelled = true;
        };
    }, [requestWithMeta]);

    const payloadPreview = useMemo(() => {
        return {
            name: String(name ?? '').trim(),
            customName: String(customName ?? '').trim(),
            logoUrl: String(logoUrl ?? '').trim() || null,
        };
    }, [name, customName, logoUrl]);

    const isSaveDisabled =
        loading || isLogoUploading || prefillLoading || String(name ?? '').trim().length === 0;

    return (
        <div className="shop-create-root">
            <DesktopOnlyBlock />

            <div className="shop-create-mobile">
                <CreateShopHeader
                    title="Ваш магазин"
                    subtitle="Укажите данные вашего магазина"
                    onBack={() => navigate('/provider/branch/store')}
                />

                <main className="shop-create-content">
                    {error ? (
                        <section className="shop-create-section shop-create-sectionError">
                            <div className="shop-create-label">Ошибка</div>
                            <div className="shop-create-help shop-create-helpTight">
                                {error}
                            </div>
                        </section>
                    ) : null}

                    {prefillLoading ? (
                        <>
                            <section className="shop-create-section">
                                <div className="shop-create-skeleton shop-create-skeleton--text shop-create-skeletonLabel" />
                                <div className="shop-create-skeleton shop-create-skeletonInput" />
                            </section>

                            <section className="shop-create-section">
                                <div className="shop-create-skeleton shop-create-skeleton--text shop-create-skeletonLabel" />
                                <div className="shop-create-skeleton shop-create-skeleton--text shop-create-skeletonHelp" />
                                <div className="shop-create-skeleton shop-create-skeletonInput" />
                            </section>

                            <section className="shop-create-section">
                                <div className="shop-create-skeleton shop-create-skeleton--text shop-create-skeletonLabel" />
                                <div className="shop-create-skeleton shop-create-skeletonInput" />
                            </section>
                        </>
                    ) : (
                        <ShopDetailsForm
                            name={name}
                            onNameChange={setName}
                            customName={customName}
                            onCustomNameChange={setCustomName}
                            logoUrl={logoUrl}
                            onLogoUrlChange={setLogoUrl}
                            onLogoUploadLoadingChange={setIsLogoUploading}
                        />
                    )}
                </main>

                <CreateFooter
                    disabled={isSaveDisabled}
                    label={prefillLoading ? 'Загрузка…' : loading ? 'Сохранение…' : 'Сохранить'}
                    onCreate={async () => {
                        setError(null);
                        const res = await requestWithMeta('/operator/store', 'PUT', payloadPreview);
                        if (!res?.ok) {
                            setError(res?.data?.error || res?.data?.message || 'Не удалось обновить магазин');
                            return;
                        }
                        navigate('/provider/branch/store', { replace: true });
                    }}
                />
            </div>
        </div>
    );
}

export default UpdateShop;

