import React, { useMemo, useState } from 'react';
import './Shop.css';

import DesktopOnlyBlock from './components/DesktopOnlyBlock';
import CreateShopHeader from './components/CreateShopHeader';
import TelegramChannelSection from './components/TelegramChannelSection';
import LocationSection from './components/LocationSection';
import ScheduleSection from './components/ScheduleSection';
import CreateFooter from './components/CreateFooter';
import MapPickerOverlay from './components/MapPickerOverlay';
import HourPickerModal from './components/HourPickerModal';
import useHttp from '../../hooks/http.hook';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function BranchSettings({ mode = 'edit' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { loading, requestWithMeta } = useHttp();
    const [name, setName] = useState('');
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
            1: 'Mon',
            2: 'Tue',
            3: 'Wed',
            4: 'Thu',
            5: 'Fri',
            6: 'Sat',
            7: 'Sun',
        }),
        []
    );

    const hourOptions = useMemo(() => {
        return Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
    }, []);

    function updateScheduleDay(day, patch) {
        setSchedule((prev) => prev.map((s) => (s.day === day ? { ...s, ...patch } : s)));
    }

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
            tgChannelId: tgChannelId,
            schedule: schedulePayload,
            lat,
            lon,
        };
    }, [name, tgChannelId, schedule, lat, lon]);

    const currentScheduleDay = timeModal.day ? schedule.find((x) => x.day === timeModal.day) : null;
    const selectedHourValue =
        currentScheduleDay && timeModal.field ? currentScheduleDay[timeModal.field] : null;
    const hourModalTitle =
        timeModal.day && timeModal.field
            ? `${dayLabels[timeModal.day]} ${timeModal.field === 'open' ? 'open' : 'close'}`
            : 'Time';

    const isCreateMode = mode === 'create';
    const branchId =
        params.branchId || location?.state?.branch?._id || location?.state?.branch?.id || null;
    const isSaveDisabled =
        loading ||
        name.trim().length === 0 ||
        lat === null ||
        lon === null;

    React.useEffect(() => {
        if (isCreateMode) return;
        if (!branchId) return;

        const applyBranchToState = (b) => {
            if (!b) return;
            setName(b?.name ?? '');
            setTgChannelId(b?.tgChannelId ?? b?.tgChannel_id ?? '');
            const loc = b?.location || {};
            if (loc?.lat !== undefined && loc?.lat !== null) setLat(loc.lat);
            if (loc?.lng !== undefined && loc?.lng !== null) setLon(loc.lng);
            if (Array.isArray(b?.schedule)) {
                const byDay = new Map(b.schedule.map((s) => [s.day, s]));
                setSchedule((prev) =>
                    prev.map((d) => {
                        const match = byDay.get(d.day);
                        if (!match) return { ...d, enabled: false };
                        return { ...d, enabled: true, open: match.open, close: match.close };
                    })
                );
            }
        };

        const fromState = location?.state?.branch || null;
        if (fromState) {
            applyBranchToState(fromState);
            return;
        }

        (async () => {
            const res = await requestWithMeta(`/operator/branch/${branchId}`, 'GET');
            if (!res?.ok) return;
            applyBranchToState(res?.data?.branch);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchId, isCreateMode]);

    return (
        <div className="shop-create-root">
            <DesktopOnlyBlock />

            <div className="shop-create-mobile">
                <CreateShopHeader
                    title={isCreateMode ? 'Create branch' : 'Branch settings'}
                    subtitle={
                        isCreateMode
                            ? 'Set branch name, location and schedule'
                            : 'Set Telegram channel, location and schedule'
                    }
                />

                <main className="shop-create-content">
                    {!isCreateMode ? (
                        <section className="shop-create-section">
                            <div className="shop-create-row">
                                <div style={{ minWidth: 0 }}>
                                    <div className="shop-create-label" style={{ marginBottom: 0 }}>
                                        Store settings
                                    </div>
                                    <div className="shop-create-help" style={{ marginTop: 6, marginBottom: 0 }}>
                                        Update shop name, logo and custom name
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="shop-create-buttonSecondary"
                                    onClick={() => navigate('/provider/shop/update')}
                                >
                                    Open
                                </button>
                            </div>
                        </section>
                    ) : null}

                    <section className="shop-create-section">
                        <label className="shop-create-label" htmlFor="branch-name">
                            Branch name
                        </label>
                        <div className="shop-create-help">String input: `name`</div>
                        <input
                            id="branch-name"
                            className="shop-create-input"
                            placeholder="e.g. Downtown"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="off"
                        />
                    </section>

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
                </main>

                <CreateFooter
                    disabled={isSaveDisabled}
                    label={loading ? (isCreateMode ? 'Creating...' : 'Saving...') : isCreateMode ? 'Create' : 'Save'}
                    onCreate={async () => {
                        // eslint-disable-next-line no-console
                        console.log('Branch payload:', payloadPreview);

                        if (isCreateMode) {
                            const res = await requestWithMeta('/operator/branch', 'POST', payloadPreview);
                            if (res?.ok) {
                                navigate('/provider/branch/store', { replace: true });
                            }
                            return;
                        }

                        if (!branchId) return;
                        const res = await requestWithMeta(`/operator/branch/${branchId}`, 'PUT', payloadPreview);
                        if (res?.ok) {
                            navigate('/provider/branch/store', { replace: true });
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

export default BranchSettings;

