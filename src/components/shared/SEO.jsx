import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, image, url }) {
    const defaultTitle = "BANTOO — Aplikasi Pesan Antar Makanan Terlengkap"
    const defaultDesc = "Pesan makanan ringan dan berat dari warung favoritmu dengan BANTOO. Antar cepat, harga bersahabat, tanpa repot keluar rumah."
    const defaultImage = "/icon-512.png" // Fallback to large PWA icon
    const defaultUrl = window.location.href

    const finalTitle = title ? `${title} | BANTOO` : defaultTitle
    const finalDesc = description || defaultDesc
    const finalImage = image || defaultImage
    const finalUrl = url || defaultUrl

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDesc} />

            {/* Open Graph tags for WhatsApp/Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDesc} />
            <meta property="og:image" content={finalImage} />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={finalUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDesc} />
            <meta name="twitter:image" content={finalImage} />
        </Helmet>
    )
}
