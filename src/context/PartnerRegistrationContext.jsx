import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../services/supabaseClient'
import { storageService, STORAGE_PATHS } from '../services/storageService'

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
            location: null,
            openTime: '08:00',
            closeTime: '21:00'
        },
        step2: {
            idCardPhoto: null,
            shopPhoto: null,
            bankName: '',
            bankAccountName: '',
            bankAccountNumber: ''
        }
    })

    // Current step tracking
    const [currentDriverStep, setCurrentDriverStep] = useState(1)
    const [currentMerchantStep, setCurrentMerchantStep] = useState(1)

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
    // Accept step3FormData to avoid stale state issue
    const submitDriverRegistration = async (step3FormData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Anda belum login. Silakan login terlebih dahulu.')

            // Merge latest step3 data with existing driver state
            const finalData = {
                ...driverData,
                step3: { ...driverData.step3, ...(step3FormData || {}) }
            }

            // 1. Upload Photos via storageService
            console.log('[Driver Reg] Uploading photos...')
            const selfieUrl = await storageService.upload(finalData.step1.selfiePhoto, STORAGE_PATHS.DRIVER_SELFIE, user.id)
            const vehiclePhotoUrl = await storageService.upload(finalData.step2.vehiclePhoto, STORAGE_PATHS.DRIVER_VEHICLE, user.id)
            const stnkUrl = await storageService.upload(finalData.step2.stnkPhoto, STORAGE_PATHS.DRIVER_VEHICLE, user.id)
            const idCardUrl = await storageService.upload(finalData.step3.idCardPhoto, STORAGE_PATHS.DRIVER_KTP, user.id)
            const photoWithVehicleUrl = await storageService.upload(finalData.step3.photoWithVehicle, STORAGE_PATHS.DRIVER_WITH_VEHICLE, user.id)
            console.log('[Driver Reg] Photos uploaded successfully')

            // 2. Insert Driver Record
            const { error } = await supabase.from('drivers').insert({
                user_id: user.id,
                vehicle_type: finalData.step2.vehicleType === 'motor' ? 'motorcycle' : finalData.step2.vehicleType,
                vehicle_plate: finalData.step2.plateNumber,
                vehicle_brand: finalData.step2.vehicleBrand,
                selfie_url: selfieUrl,
                vehicle_photo_url: vehiclePhotoUrl,
                stnk_url: stnkUrl,
                ktp_url: idCardUrl,
                photo_with_vehicle_url: photoWithVehicleUrl,
                address: finalData.step1.address || null,
                phone: finalData.step1.phoneNumber || null,
                bank_name: finalData.step3.bankName || null,
                bank_account_name: finalData.step3.accountName || null,
                bank_account_number: finalData.step3.accountNumber || null,
                status: 'pending'
            })

            if (error) {
                console.error('[Driver Reg] Insert error:', error)
                throw new Error(error.message || 'Gagal menyimpan data pendaftaran driver.')
            }

            // 3. Update profile with registration info
            await supabase.from('profiles').update({
                full_name: finalData.step1.fullName || undefined,
                phone: finalData.step1.phoneNumber || undefined
            }).eq('id', user.id)

            console.log('[Driver Reg] Registration submitted successfully!')
            clearDriverData()

            if (refreshProfile) await refreshProfile()
            return { success: true }

        } catch (error) {
            console.error('[Driver Reg] Registration failed:', error)
            return { success: false, error: error.message || 'Pendaftaran driver gagal. Coba lagi.' }
        }
    }

    // Submit merchant registration
    // Accept step2FormData to avoid stale state issue  
    const submitMerchantRegistration = async (step2FormData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Anda belum login. Silakan login terlebih dahulu.')

            // Merge latest step2 data with existing merchant state
            const finalData = {
                ...merchantData,
                step2: { ...merchantData.step2, ...(step2FormData || {}) }
            }

            // 1. Upload Photos via storageService
            console.log('[Merchant Reg] Uploading photos...')
            const idCardUrl = await storageService.upload(finalData.step2.idCardPhoto, STORAGE_PATHS.MERCHANT_KTP, user.id)
            const shopPhotoUrl = await storageService.upload(finalData.step2.shopPhoto, STORAGE_PATHS.MERCHANT_LOGO, user.id)
            console.log('[Merchant Reg] Photos uploaded:', { idCardUrl, shopPhotoUrl })

            // 2. Insert Merchant Record 
            const insertData = {
                owner_id: user.id,
                name: finalData.step1.shopName,
                address: finalData.step1.address,
                phone: finalData.step1.phoneNumber,
                latitude: finalData.step1.location?.lat || null,
                longitude: finalData.step1.location?.lng || null,
                image_url: shopPhotoUrl,
                ktp_url: idCardUrl,
                bank_name: finalData.step2.bankName || null,
                bank_account_name: finalData.step2.accountName || null,
                bank_account_number: finalData.step2.accountNumber || null,
                status: 'pending'
            }

            console.log('[Merchant Reg] Inserting merchant:', insertData)

            const { error } = await supabase.from('merchants').insert(insertData)

            if (error) {
                console.error('[Merchant Reg] Insert error:', error)
                throw new Error(error.message || 'Gagal menyimpan data pendaftaran warung.')
            }

            // 3. Update profile with merchant owner info
            await supabase.from('profiles').update({
                full_name: finalData.step1.ownerName || undefined
            }).eq('id', user.id)

            console.log('[Merchant Reg] Registration submitted successfully!')
            clearMerchantData()

            if (refreshProfile) await refreshProfile()
            return { success: true }

        } catch (error) {
            console.error('[Merchant Reg] Registration failed:', error)
            return { success: false, error: error.message || 'Pendaftaran warung gagal. Coba lagi.' }
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
