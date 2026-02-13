import React, { useMemo, useState } from 'react';

export default function ConnectTelegramChannelSection({ branchId, botUsername, onConfirm }) {
    const [awaitingConfirm, setAwaitingConfirm] = useState(false);
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null); // null | { ok: boolean, message: string }

    const connectUrl = useMemo(() => {
        if (!branchId || !botUsername) return null;
        return `https://t.me/${encodeURIComponent(botUsername)}?startchannel=branch_${encodeURIComponent(
            String(branchId)
        )}`;
    }, [branchId, botUsername]);

    return (
        <section className="shop-create-section">
            <div className="shop-create-row">
                <div className="shop-create-rowGrow">
                    <div className="shop-create-label shop-create-labelNoMargin">Telegram Channel</div>
                    <div className="shop-create-help shop-create-helpStoreSettings">
                        Connect a Telegram channel to this branch
                    </div>
                </div>

                <button
                    type="button"
                    className="shop-create-buttonSecondary"
                    disabled={!connectUrl}
                    onClick={() => {
                        if (!connectUrl) return;
                        window.open(connectUrl, '_blank', 'noopener,noreferrer');
                        setAwaitingConfirm(true);
                        setResult(null);
                    }}
                >
                    Connect Telegram Channel
                </button>
            </div>

            {!botUsername ? (
                <div className="shop-create-help" style={{ marginTop: 8 }}>
                    Missing bot username. Set <code>REACT_APP_TELEGRAM_BOT_USERNAME</code> in{' '}
                    <code>frontend/.env</code>.
                </div>
            ) : null}

            {!branchId ? (
                <div className="shop-create-help" style={{ marginTop: 8 }}>
                    Create the branch first to generate <code>BRANCH_ID</code>.
                </div>
            ) : null}

            {awaitingConfirm ? (
                <div style={{ marginTop: 12 }}>
                    <div className="shop-create-help">
                        After adding the bot as administrator, click Confirm below.
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                        <button
                            type="button"
                            className="shop-create-buttonSecondary"
                            disabled={checking || !branchId}
                            onClick={async () => {
                                if (!branchId) return;
                                setChecking(true);
                                setResult(null);
                                try {
                                    const res = await onConfirm?.();
                                    if (res?.connected) {
                                        setResult({ ok: true, message: 'Channel connected.' });
                                    } else {
                                        setResult({
                                            ok: false,
                                            message: 'Channel not connected yet. Please try again.',
                                        });
                                    }
                                } catch (e) {
                                    setResult({
                                        ok: false,
                                        message: e?.message || 'Failed to check channel connection.',
                                    });
                                } finally {
                                    setChecking(false);
                                }
                            }}
                        >
                            {checking ? 'Checking…' : 'Confirm'}
                        </button>

                        {result ? (
                            <div
                                className="shop-create-help"
                                style={{ color: result.ok ? '#1f7a1f' : '#b00020' }}
                            >
                                {result.message}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

