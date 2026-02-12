import { useNavigate } from 'react-router-dom'

function HelpButton() {
    const navigate = useNavigate()

    return (
        <section>
            <button
                onClick={() => navigate('/help')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white shadow-sm border border-primary/50 active:bg-orange-50 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">support_agent</span>
                    </div>
                    <span className="font-semibold text-sm text-text-main">Butuh bantuan?</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
            </button>
        </section>
    )
}

export default HelpButton
