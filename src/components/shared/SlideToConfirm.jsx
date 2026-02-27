import { useState, useRef, useEffect, useCallback } from 'react';

const SlideToConfirm = ({
    onConfirm,
    isConfirming = false,
    text = 'GESER UNTUK KONFIRMASI',
    processingText = 'MEMPROSES...',
    successText = 'SELESAI!',
    disabled = false,
    className = ''
}) => {
    const [sliderVal, setSliderVal] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const containerRef = useRef(null);
    const knobRef = useRef(null);
    const isDragging = useRef(false);

    useEffect(() => {
        if (!isConfirming && !isSuccess) {
            setSliderVal(0);
        }
    }, [isConfirming, isSuccess]);

    const handleMove = useCallback((clientX) => {
        if (!isDragging.current || disabled || isConfirming || isSuccess) return;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const knobWidth = 56;
        const maxDrag = rect.width - knobWidth;

        let newX = clientX - rect.left - (knobWidth / 2);
        if (newX < 0) newX = 0;
        if (newX > maxDrag) newX = maxDrag;

        const percentage = (newX / maxDrag) * 100;
        setSliderVal(percentage);

        if (percentage >= 95) {
            isDragging.current = false;
            setSliderVal(100);
            setIsSuccess(true);
            if (onConfirm) onConfirm();
            setTimeout(() => {
                setIsSuccess(false);
                setSliderVal(0);
            }, 2000);
        }
    }, [disabled, isConfirming, isSuccess, onConfirm]);

    const handleEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        setSliderVal(prev => prev < 95 ? 0 : prev);
    }, []);

    // Register non-passive touch listeners on the knob to allow preventDefault
    useEffect(() => {
        const knob = knobRef.current;
        if (!knob) return;

        const onTouchStart = (e) => {
            if (disabled || isConfirming || isSuccess) return;
            e.preventDefault();
            isDragging.current = true;
        };

        const onTouchMove = (e) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX);
        };

        const onTouchEnd = (e) => {
            e.preventDefault();
            handleEnd();
        };

        // { passive: false } to allow preventDefault()
        knob.addEventListener('touchstart', onTouchStart, { passive: false });
        knob.addEventListener('touchmove', onTouchMove, { passive: false });
        knob.addEventListener('touchend', onTouchEnd, { passive: false });

        return () => {
            knob.removeEventListener('touchstart', onTouchStart);
            knob.removeEventListener('touchmove', onTouchMove);
            knob.removeEventListener('touchend', onTouchEnd);
        };
    }, [disabled, isConfirming, isSuccess, handleMove, handleEnd]);

    // Pointer events for mouse/desktop
    const handlePointerDown = (e) => {
        if (disabled || isConfirming || isSuccess) return;
        isDragging.current = true;
        e.target.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) => {
        handleMove(e.clientX);
    };

    const handlePointerUp = (e) => {
        e.target.releasePointerCapture?.(e.pointerId);
        handleEnd();
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-14 bg-slate-200 rounded-xl overflow-hidden select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ touchAction: 'none' }}
        >
            <div
                className="absolute top-0 left-0 h-full bg-green-500"
                style={{
                    width: `calc(56px + (100% - 56px) * ${sliderVal / 100})`,
                    transition: isDragging.current ? 'none' : 'width 0.3s ease-out'
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className={`font-bold text-sm tracking-wide ${sliderVal > 50 || isConfirming || isSuccess ? 'text-white' : 'text-slate-500'}`}>
                    {isConfirming ? processingText : (isSuccess ? successText : text)}
                </span>
            </div>

            {!isConfirming && !isSuccess && (
                <div
                    ref={knobRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="absolute top-1 bottom-1 w-12 bg-white rounded-lg shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                    style={{
                        left: `calc(4px + (100% - 56px) * ${sliderVal / 100})`,
                        transition: isDragging.current ? 'none' : 'left 0.3s ease-out',
                        touchAction: 'none'
                    }}
                >
                    <span className="material-symbols-outlined text-green-500 text-2xl">
                        double_arrow
                    </span>
                </div>
            )}

            {(isConfirming || isSuccess) && (
                <div className="absolute top-1 bottom-1 right-1 w-12 bg-white/20 rounded-lg flex items-center justify-center z-20">
                    <span className="material-symbols-outlined text-white animate-spin">
                        {isConfirming ? 'refresh' : 'check'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default SlideToConfirm;
