import { useState, useRef, useEffect } from 'react';

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
    const isDragging = useRef(false);

    useEffect(() => {
        if (!isConfirming && !isSuccess) {
            setSliderVal(0);
        }
    }, [isConfirming, isSuccess]);

    const handlePointerDown = (e) => {
        if (disabled || isConfirming || isSuccess) return;
        isDragging.current = true;
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current || disabled || isConfirming || isSuccess) return;

        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const knobWidth = 56;
            const maxDrag = rect.width - knobWidth;

            let newX = e.clientX - rect.left - (knobWidth / 2);
            if (newX < 0) newX = 0;
            if (newX > maxDrag) newX = maxDrag;

            const percentage = (newX / maxDrag) * 100;
            setSliderVal(percentage);

            if (percentage >= 100) {
                isDragging.current = false;
                setSliderVal(100);
                setIsSuccess(true);
                if (onConfirm) onConfirm();
                setTimeout(() => {
                    setIsSuccess(false);
                    setSliderVal(0);
                }, 2000);
            }
        }
    };

    const handlePointerUp = (e) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        e.target.releasePointerCapture(e.pointerId);

        if (sliderVal < 100) {
            setSliderVal(0);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-14 bg-slate-200 rounded-xl overflow-hidden select-none touch-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div
                className="absolute top-0 left-0 h-full bg-green-500 transition-none"
                style={{ width: `calc(56px + (100% - 56px) * ${sliderVal / 100})` }}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <span className={`font-bold text-sm tracking-wide ${sliderVal > 50 || isConfirming || isSuccess ? 'text-white' : 'text-slate-500'}`}>
                    {isConfirming ? processingText : (isSuccess ? successText : text)}
                </span>
            </div>

            {!isConfirming && !isSuccess && (
                <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className="absolute top-1 bottom-1 w-12 bg-white rounded-lg shadow-sm flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                    style={{
                        left: `calc(4px + (100% - 56px) * ${sliderVal / 100})`,
                        transition: isDragging.current ? 'none' : 'left 0.3s ease-out'
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
