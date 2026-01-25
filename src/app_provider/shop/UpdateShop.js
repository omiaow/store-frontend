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
                    title="Update shop"
                    subtitle="Change shop info and save"
                />

                <main className="shop-create-content">
                    {error ? (
                        <section
                            className="shop-create-section"
                            style={{
                                borderColor: 'rgba(255, 107, 107, 0.55)',
                                background: 'rgba(255, 107, 107, 0.06)',
                            }}
                        >
                            <div className="shop-create-label">Error</div>
                            <div className="shop-create-help" style={{ marginTop: 0 }}>
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
                    label={loading ? 'Saving...' : 'Save'}
                    onCreate={async () => {
                        setError(null);
                        const res = await requestWithMeta('/operator/store', 'PUT', payloadPreview);
                        if (!res?.ok) {
                            setError(res?.data?.error || res?.data?.message || 'Failed to update shop');
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

