import React, { useMemo, useState } from 'react';

export default function ConnectTelegramChannelSection({ branchId, botUsername, onConfirm }) {
    const [hasClickedConnect, setHasClickedConnect] = useState(false);
    const [checking, setChecking] = useState(false);
    const [status, setStatus] = useState(null); // null | { ok: boolean, message: string }

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
                    <div className="shop-create-label shop-create-labelNoMargin">Telegram-канал</div>
                    <div className="shop-create-help shop-create-helpStoreSettings">
                        Подключите канал через бота
                    </div>
                </div>

                <button
                    type="button"
                    className="shop-create-buttonSecondary"
                    disabled={!connectUrl}
                    onClick={() => {
                        if (!connectUrl) return;
                        window.open(connectUrl, '_blank', 'noopener,noreferrer');
                        setHasClickedConnect(true);
                        setStatus(null);
                    }}
                >
                    Connect Telegram Channel
                </button>
            </div>

            {!botUsername ? (
                <div className="shop-create-help" style={{ marginTop: 8 }}>
                    Укажите <code>REACT_APP_TELEGRAM_BOT_USERNAME</code> в <code>frontend/.env</code>.
                </div>
            ) : null}

            {!branchId ? (
                <div className="shop-create-help" style={{ marginTop: 8 }}>
                    Сначала создайте филиал, чтобы получить ID.
                </div>
            ) : null}

            {hasClickedConnect ? (
                <div style={{ marginTop: 12 }}>
                    <div className="shop-create-help">
                        After adding the bot as administrator, click Confirm below.
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                        <button
                            type="button"
                            className="shop-create-buttonPrimary"
                            disabled={checking || !branchId}
                            onClick={async () => {
                                if (!branchId) return;
                                setChecking(true);
                                setStatus(null);
                                try {
                                    const result = await onConfirm?.();
                                    if (result?.connected) {
                                        setStatus({ ok: true, message: 'Канал успешно подключен.' });
                                    } else {
                                        setStatus({
                                            ok: false,
                                            message: 'Канал пока не подключен. Проверьте права администратора и повторите.',
                                        });
                                    }
                                } catch (e) {
                                    setStatus({
                                        ok: false,
                                        message: e?.message || 'Не удалось проверить подключение канала.',
                                    });
                                } finally {
                                    setChecking(false);
                                }
                            }}
                        >
                            {checking ? 'Проверка…' : 'Confirm'}
                        </button>

                        {status ? (
                            <div
                                className="shop-create-help"
                                style={{ color: status.ok ? '#1f7a1f' : '#b00020' }}
                            >
                                {status.message}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </section>
    );
}

