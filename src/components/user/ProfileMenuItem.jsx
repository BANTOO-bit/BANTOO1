function ProfileMenuItem({ icon, label, onClick, showBorder = true }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors ${showBorder ? 'border-b border-border-color' : ''
                }`}
        >
            <span className="material-symbols-outlined text-primary mr-3">{icon}</span>
            <span className="flex-1 text-left font-medium text-sm">{label}</span>
            <span className="material-symbols-outlined text-text-secondary text-[20px]">chevron_right</span>
        </button>
    )
}

export default ProfileMenuItem
