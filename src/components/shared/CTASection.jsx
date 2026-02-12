import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function CTASection() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const driverStatus = user?.driverStatus || 'none'
    const merchantStatus = user?.merchantStatus || 'none'

    // Determine button config based on status
    const getButtonConfig = (type) => {
        const status = type === 'driver' ? driverStatus : merchantStatus
        const baseRoute = type === 'driver' ? '/partner/driver/step-1' : '/partner/merchant/step-1'
        const dashboardRoute = type === 'driver' ? '/driver/dashboard' : '/merchant/dashboard'
        const statusRoute = '/registration-status'

        switch (status) {
            case 'processing':
                return {
                    text: type === 'driver' ? 'Pendaftaran Driver' : 'Pendaftaran Warung',
                    subtext: 'Sedang Diproses',
                    icon: 'hourglass_top',
                    bgColor: type === 'driver' ? 'bg-yellow-50' : 'bg-yellow-50',
                    borderColor: type === 'driver' ? 'border-yellow-100' : 'border-yellow-100',
                    iconBgColor: 'bg-white',
                    iconColor: 'text-warning',
                    textColor: 'text-warning',
                    onClick: () => navigate(statusRoute),
                    disabled: false,
                }
            case 'approved':
                return {
                    text: type === 'driver' ? 'Dashboard Driver' : 'Dashboard Warung',
                    subtext: 'Buka Dashboard',
                    icon: type === 'driver' ? 'two_wheeler' : 'storefront',
                    bgColor: type === 'driver' ? 'bg-green-50' : 'bg-green-50',
                    borderColor: type === 'driver' ? 'border-green-100' : 'border-green-100',
                    iconBgColor: 'bg-white',
                    iconColor: 'text-success',
                    textColor: 'text-success',
                    onClick: () => navigate(dashboardRoute),
                    disabled: false,
                }
            case 'rejected':
                return {
                    text: type === 'driver' ? 'Pendaftaran Driver' : 'Pendaftaran Warung',
                    subtext: 'Perbaiki Pendaftaran',
                    icon: 'error',
                    bgColor: type === 'driver' ? 'bg-red-50' : 'bg-red-50',
                    borderColor: type === 'driver' ? 'border-red-100' : 'border-red-100',
                    iconBgColor: 'bg-white',
                    iconColor: 'text-error',
                    textColor: 'text-error',
                    onClick: () => navigate(baseRoute),
                    disabled: false,
                }
            default: // 'none'
                return {
                    text: type === 'driver' ? 'Daftar Jadi Driver' : 'Daftar Jadi Warung',
                    subtext: type === 'driver' ? 'Daftar Sekarang' : 'Gabung Mitra',
                    icon: type === 'driver' ? 'two_wheeler' : 'storefront',
                    bgColor: type === 'driver' ? 'bg-blue-50' : 'bg-orange-50',
                    borderColor: type === 'driver' ? 'border-blue-100' : 'border-orange-100',
                    iconBgColor: 'bg-white',
                    iconColor: type === 'driver' ? 'text-blue-600' : 'text-primary',
                    textColor: type === 'driver' ? 'text-blue-600' : 'text-orange-600',
                    onClick: () => navigate(baseRoute),
                    disabled: false,
                }
        }
    }

    const merchantConfig = getButtonConfig('merchant')
    const driverConfig = getButtonConfig('driver')

    return (
        <section className="grid grid-cols-2 gap-3 mt-2">
            {/* Merchant CTA */}
            <div
                onClick={merchantConfig.onClick}
                className={`relative overflow-hidden rounded-xl ${merchantConfig.bgColor} border ${merchantConfig.borderColor} p-4 active:scale-95 transition-transform cursor-pointer group ${merchantConfig.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className="flex flex-col h-full justify-between gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-full ${merchantConfig.iconBgColor} shadow-sm flex items-center justify-center ${merchantConfig.iconColor} group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined">{merchantConfig.icon}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm leading-tight">{merchantConfig.text}</h3>
                        <p className={`text-[10px] ${merchantConfig.textColor} font-medium mt-1 flex items-center gap-0.5`}>
                            {merchantConfig.subtext} <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                        </p>
                    </div>
                </div>
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${merchantConfig.bgColor.replace('50', '200/30')} rounded-full blur-xl`}></div>
            </div>

            {/* Driver CTA */}
            <div
                onClick={driverConfig.onClick}
                className={`relative overflow-hidden rounded-xl ${driverConfig.bgColor} border ${driverConfig.borderColor} p-4 active:scale-95 transition-transform cursor-pointer group ${driverConfig.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className="flex flex-col h-full justify-between gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-full ${driverConfig.iconBgColor} shadow-sm flex items-center justify-center ${driverConfig.iconColor} group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined">{driverConfig.icon}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm leading-tight">{driverConfig.text}</h3>
                        <p className={`text-[10px] ${driverConfig.textColor} font-medium mt-1 flex items-center gap-0.5`}>
                            {driverConfig.subtext} <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                        </p>
                    </div>
                </div>
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${driverConfig.bgColor.replace('50', '200/30')} rounded-full blur-xl`}></div>
            </div>
        </section>
    )
}

export default CTASection
