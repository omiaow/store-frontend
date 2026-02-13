import React, { useMemo, useState } from 'react';
import './Shop.css';

import DesktopOnlyBlock from './components/DesktopOnlyBlock';
import CreateShopHeader from './components/CreateShopHeader';
import ShopDetailsForm from './components/ShopDetailsForm';
import LocationSection from './components/LocationSection';
import ScheduleSection from './components/ScheduleSection';
import CreateFooter from './components/CreateFooter';
import MapPickerOverlay from './components/MapPickerOverlay';
import HourPickerModal from './components/HourPickerModal';
import TelegramChannelSection from './components/TelegramChannelSection';
import useHttp from '../../hooks/http.hook';
import { useNavigate } from 'react-router-dom';

function CreateShop({ onCreated }) {
    const navigate = useNavigate();
    const { loading, requestWithMeta } = useHttp();
    const [name, setName] = useState('');
    const [customName, setCustomName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const [tgChannelId, setTgChannelId] = useState('');

    // Schedule format requested: [{ day: 1, open: "09:00", close: "17:00" }, ...]
    const [schedule, setSchedule] = useState(() => {
        return [1, 2, 3, 4, 5, 6, 7].map((day) => ({
            day,
            enabled: day >= 1 && day <= 5, // default Mon–Fri enabled
            open: '09:00',
            close: '17:00',
        }));
    });

    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [timeModal, setTimeModal] = useState({
        open: false,
        day: null,
        field: null, // "open" | "close"
    });

    const dayLabels = useMemo(
        () => ({
            1: 'Пн',
            2: 'Вт',
            3: 'Ср',
            4: 'Чт',
            5: 'Пт',
            6: 'Сб',
            7: 'Вс',
        }),
        []
    );

    const hourOptions = useMemo(() => {
        return Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
    }, []);

    function openTimeModal(day, field) {
        setTimeModal({ open: true, day, field });
    }

    function closeTimeModal() {
        setTimeModal({ open: false, day: null, field: null });
    }

    const payloadPreview = useMemo(() => {
        const schedulePayload = schedule
            .filter((s) => s.enabled)
            .map(({ day, open, close }) => ({ day, open, close }));

        return {
            name,
            customName,
            tgChannelId: tgChannelId,
            schedule: schedulePayload,
            logoUrl: logoUrl,
            lat,
            lon,
        };
    }, [name, customName, tgChannelId, schedule, logoUrl, lat, lon]);

    function updateScheduleDay(day, patch) {
        setSchedule((prev) =>
            prev.map((s) => (s.day === day ? { ...s, ...patch } : s))
        );
    }

    const isCreateDisabled = name.trim().length === 0 || isLogoUploading;
    const currentScheduleDay = timeModal.day
        ? schedule.find((x) => x.day === timeModal.day)
        : null;
    const selectedHourValue =
        currentScheduleDay && timeModal.field
            ? currentScheduleDay[timeModal.field]
            : null;
    const hourModalTitle =
        timeModal.day && timeModal.field
            ? `${dayLabels[timeModal.day]} ${
                  timeModal.field === 'open' ? 'открытие' : 'закрытие'
              }`
            : 'Время';

    return (
        <div className="shop-create-root">
            <DesktopOnlyBlock />

            <div className="shop-create-mobile">
                <CreateShopHeader />

                <main className="shop-create-content">
                    <ShopDetailsForm
                        name={name}
                        onNameChange={setName}
                        customName={customName}
                        onCustomNameChange={setCustomName}
                        logoUrl={logoUrl}
                        onLogoUrlChange={setLogoUrl}
                        onLogoUploadLoadingChange={setIsLogoUploading}
                    />

                    <TelegramChannelSection
                        tgChannelId={tgChannelId}
                        onTgChannelIdChange={setTgChannelId}
                    />

                    <LocationSection
                        lat={lat}
                        lon={lon}
                        onOpenMap={() => setIsMapOpen(true)}
                    />

                    <ScheduleSection
                        schedule={schedule}
                        dayLabels={dayLabels}
                        onToggleDay={(day, enabled) => updateScheduleDay(day, { enabled })}
                        onPickTime={(day, field) => openTimeModal(day, field)}
                    />

                    {/* <PayloadPreviewSection payloadPreview={payloadPreview} /> */}
                </main>

                <CreateFooter
                    disabled={isCreateDisabled || loading}
                    label={loading ? 'Создание…' : 'Создать магазин'}
                    onCreate={async () => {
                        try {
                            const res = await requestWithMeta('/operator/store', 'POST', payloadPreview);
                            // eslint-disable-next-line no-console
                            console.log('Create shop payload:', payloadPreview);
                            // eslint-disable-next-line no-console
                            console.log('Create shop response:', res);

                            if (res?.ok) {
                                if (typeof onCreated === 'function') {
                                    onCreated(res);
                                }
                                navigate('/provider/branch/store', { replace: true });
                            }
                        } catch (e) {
                            // eslint-disable-next-line no-console
                            console.log('Create shop request failed:', e);
                        }
                    }}
                />

                <MapPickerOverlay
                    isOpen={isMapOpen}
                    lat={lat}
                    lon={lon}
                    setLat={setLat}
                    setLon={setLon}
                    onClose={() => setIsMapOpen(false)}
                />

                <HourPickerModal
                    isOpen={timeModal.open}
                    title={hourModalTitle}
                    hourOptions={hourOptions}
                    selectedValue={selectedHourValue}
                    onClose={closeTimeModal}
                    onSelect={(t) => {
                        if (!timeModal.day || !timeModal.field) return;
                        updateScheduleDay(timeModal.day, { [timeModal.field]: t });
                        closeTimeModal();
                    }}
                />
            </div>
        </div>
    );
}

export default CreateShop;