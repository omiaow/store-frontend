import React, { useMemo, useState } from 'react';
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
    const initial = initialShop || shopFromState || {};
    const [name, setName] = useState(initialShop?.name ?? '');
    const [customName, setCustomName] = useState(initialShop?.customName ?? '');
    const [logoUrl, setLogoUrl] = useState(initialShop?.logoUrl ?? '');
    const [error, setError] = useState(null);

    React.useEffect(() => {
        setName(initial?.name ?? '');
        setCustomName(initial?.customName ?? '');
        setLogoUrl(initial?.logoUrl ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialShop, shopFromState]);

    const payloadPreview = useMemo(() => {
        return {
            name,
            customName,
            logoUrl: logoUrl,
        };
    }, [name, customName, logoUrl]);

    const isSaveDisabled = loading || name.trim().length === 0;

    return (
        <div className="shop-create-root">
            <DesktopOnlyBlock />

            <div className="shop-create-mobile">
                <CreateShopHeader
                    title="Обновить магазин"
                    subtitle="Измените данные магазина и сохраните"
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

                    <ShopDetailsForm
                        name={name}
                        onNameChange={setName}
                        customName={customName}
                        onCustomNameChange={setCustomName}
                        logoUrl={logoUrl}
                        onLogoUrlChange={setLogoUrl}
                    />
                </main>

                <CreateFooter
                    disabled={isSaveDisabled}
                    label={loading ? 'Сохранение…' : 'Сохранить'}
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

