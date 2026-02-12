import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

const PartnerRegistrationContext = createContext()

export function PartnerRegistrationProvider({ children }) {
    const { refreshProfile } = useAuth()

    // Driver registration state
    const [driverData, setDriverData] = useState({
        step1: {
            fullName: '',
            phoneNumber: '',
            address: '',
            selfiePhoto: null
        },
        step2: {
            vehicleType: 'motor',
            plateNumber: '',
            vehicleBrand: '',
            vehiclePhoto: null,
            stnkPhoto: null
        },
        step3: {
            idCardPhoto: null,
            photoWithVehicle: null,
            // Bank Info
            bankName: '',
            bankAccountName: '',
            bankAccountNumber: ''
        }
    })

    // Merchant registration state
    const [merchantData, setMerchantData] = useState({
        step1: {
            shopName: '',
            ownerName: '',
            phoneNumber: '',
            address: '',
            addressDetail: '',
            location: null, // { lat, lng }
            openTime: '08:00',
            closeTime: '21:00'
        },
        step2: {
            idCardPhoto: null,
            shopPhoto: null,
            // Bank Info
            bankName: '',
            bankAccountName: '',
            bankAccountNumber: ''
        }
    })

    // Current step tracking
    const [currentDriverStep, setCurrentDriverStep] = useState(1)
    const [currentMerchantStep, setCurrentMerchantStep] = useState(1)

    // Helper: Upload file to Supabase Storage
    const uploadFile = async (file, folder, userId) => {
        if (!file) return null

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${folder}/${userId}/${fileName}`

            const { data, error } = await import('../services/supabaseClient')
                .then(m => m.supabase.storage
                    .from('partner-documents')
                    .upload(filePath, file)
                )

            if (error) throw error

            // Get Public URL
            const { data: { publicUrl } } = await import('../services/supabaseClient')
                .then(m => m.supabase.storage
                    .from('partner-documents')
                    .getPublicUrl(filePath)
                )

            return publicUrl
        } catch (error) {
            console.error('Upload failed:', error)
            throw error
        }
    }

    // Save driver step data
    const saveDriverStepData = (step, data) => {
        setDriverData(prev => ({
            ...prev,
            [`step${step}`]: {
                ...prev[`step${step}`],
                ...data
            }
        }))
        setCurrentDriverStep(step + 1)
    }

    // Save merchant step data
    const saveMerchantStepData = (step, data) => {
        setMerchantData(prev => ({
            ...prev,
            [`step${step}`]: {
                ...prev[`step${step}`],
                ...data
            }
        }))
        setCurrentMerchantStep(step + 1)
    }

    // Clear driver data
    const clearDriverData = () => {
        setDriverData({
            step1: { fullName: '', phoneNumber: '', address: '', selfiePhoto: null },
            step2: { vehicleType: 'motor', plateNumber: '', vehicleBrand: '', vehiclePhoto: null, stnkPhoto: null },
            step3: { idCardPhoto: null, photoWithVehicle: null, bankName: '', bankAccountName: '', bankAccountNumber: '' }
        })
        setCurrentDriverStep(1)
    }

    // Clear merchant data
    const clearMerchantData = () => {
        setMerchantData({
            step1: { shopName: '', ownerName: '', phoneNumber: '', address: '', addressDetail: '', location: null, openTime: '08:00', closeTime: '21:00' },
            step2: { idCardPhoto: null, shopPhoto: null, bankName: '', bankAccountName: '', bankAccountNumber: '' }
        })
        setCurrentMerchantStep(1)
    }

    // Submit driver registration
    const submitDriverRegistration = async () => {
        try {
            const { data: { user } } = await import('../services/supabaseClient').then(m => m.supabase.auth.getUser())
            if (!user) throw new Error('User not authenticated')

            // 1. Upload Photos
            const selfieUrl = await uploadFile(driverData.step1.selfiePhoto, 'driver-documents', user.id)
            const vehiclePhotoUrl = await uploadFile(driverData.step2.vehiclePhoto, 'driver-documents', user.id)
            const stnkUrl = await uploadFile(driverData.step2.stnkPhoto, 'driver-documents', user.id)
            const idCardUrl = await uploadFile(driverData.step3.idCardPhoto, 'driver-documents', user.id)
            const photoWithVehicleUrl = await uploadFile(driverData.step3.photoWithVehicle, 'driver-documents', user.id)

            // 2. Insert Data
            const { error } = await import('../services/supabaseClient').then(m => m.supabase.from('drivers').insert({
                user_id: user.id,
                // Personal Info

                // Vehicle Info
                vehicle_type: driverData.step2.vehicleType,
                vehicle_plate: driverData.step2.plateNumber,
                vehicle_brand: driverData.step2.vehicleBrand,

                // Bank Info
                bank_name: driverData.step3.bankName,
                bank_account_name: driverData.step3.bankAccountName,
                bank_account_number: driverData.step3.bankAccountNumber,

                // Photo URLs
                selfie_url: selfieUrl,
                vehicle_photo_url: vehiclePhotoUrl,
                stnk_url: stnkUrl,
                ktp_url: idCardUrl,
                photo_with_vehicle_url: photoWithVehicleUrl,

                status: 'pending'
            }))

            if (error) throw error

            // Clear data after successful submission
            clearDriverData()

            // Refresh auth profile to update status
            if (refreshProfile) await refreshProfile()

            return { success: true }
        } catch (error) {
            console.error('Driver registration failed:', error)
            return { success: false, error }
        }
    }

    // Submit merchant registration
    const submitMerchantRegistration = async () => {
        try {
            const { data: { user } } = await import('../services/supabaseClient').then(m => m.supabase.auth.getUser())
            if (!user) throw new Error('User not authenticated')

            // 1. Upload Photos
            const idCardUrl = await uploadFile(merchantData.step2.idCardPhoto, 'merchant-documents', user.id)
            const shopPhotoUrl = await uploadFile(merchantData.step2.shopPhoto, 'merchant-documents', user.id)

            // 2. Insert Data
            const { error } = await import('../services/supabaseClient').then(m => m.supabase.from('merchants').insert({
                owner_id: user.id,
                name: merchantData.step1.shopName,
                address: merchantData.step1.address,

                // Location & Hours
                latitude: merchantData.step1.location?.lat || null,
                longitude: merchantData.step1.location?.lng || null,
                operating_hours: {
                    open: merchantData.step1.openTime,
                    close: merchantData.step1.closeTime
                },

                // Bank Info
                bank_name: merchantData.step2.bankName,
                bank_account_name: merchantData.step2.bankAccountName,
                bank_account_number: merchantData.step2.bankAccountNumber,

                // Photo URLs
                ktp_url: idCardUrl,
                image_url: shopPhotoUrl, // Mapping shop photo to image_url standard field

                status: 'pending'
            }))

            if (error) throw error

            // Clear data after successful submission
            clearMerchantData()

            // Refresh auth profile to update status
            if (refreshProfile) await refreshProfile()

            return { success: true }
        } catch (error) {
            console.error('Merchant registration failed:', error)
            return { success: false, error }
        }
    }

    const value = {
        // Driver
        driverData,
        currentDriverStep,
        saveDriverStepData,
        clearDriverData,
        submitDriverRegistration,

        // Merchant
        merchantData,
        currentMerchantStep,
        saveMerchantStepData,
        clearMerchantData,
        submitMerchantRegistration
    }

    return (
        <PartnerRegistrationContext.Provider value={value}>
            {children}
        </PartnerRegistrationContext.Provider>
    )
}

export function usePartnerRegistration() {
    const context = useContext(PartnerRegistrationContext)
    if (!context) {
        throw new Error('usePartnerRegistration must be used within PartnerRegistrationProvider')
    }
    return context
}
