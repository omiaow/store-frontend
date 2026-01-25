import React from 'react';

export default function CreateFooter({ disabled, onCreate, label = 'Create shop' }) {
    return (
        <footer className="shop-create-footer">
            <button
                className="shop-create-buttonPrimary"
                type="button"
                disabled={disabled}
                onClick={onCreate}
            >
                {label}
            </button>
        </footer>
    );
}

