import React from 'react';

export default function TelegramChannelSection({ tgChannelId, onTgChannelIdChange }) {
    return (
        <section className="shop-create-section">
            <label className="shop-create-label" htmlFor="shop-tg-channel-id">
                ID Telegram-канала
            </label>
            {/* <div className="shop-create-help">Строковое поле: `tgChannelId`</div> */}
            <input
                id="shop-tg-channel-id"
                className="shop-create-input"
                placeholder="например, -1001234567890"
                value={tgChannelId}
                onChange={(e) => onTgChannelIdChange(e.target.value)}
                autoComplete="off"
            />
        </section>
    );
}

