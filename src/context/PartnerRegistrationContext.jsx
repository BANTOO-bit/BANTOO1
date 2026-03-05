import { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'
import { authService } from '../services/authService'
import { storageService, STORAGE_PATHS } from '../services/storageService'
import logger from '../utils/logger'
import imageCompression from 'browser-image-compression'

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
            const authUser = await authService.getCurrentUser()
            if (!authUser) throw new Error('Anda belum login. Silakan login terlebih dahulu.')

            // Merge latest step3 data with existing driver state
            const finalData = {
                ...driverData,
                step3: { ...driverData.step3, ...(step3FormData || {}) }
            }

            // Options for compressing the images
            const compressionOptions = {
                maxSizeMB: 1, // Max file size in MB
                maxWidthOrHeight: 1920, // Max width/height
                useWebWorker: true,
            }

            // Function to compress if it's a valid File object
            const compressIfNeeded = async (file) => {
                if (!file || !(file instanceof File)) return file;
                try {
                    logger.debug(`[Compression] Compressing file ${file.name} - Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                    const compressedFile = await imageCompression(file, compressionOptions);
                    logger.debug(`[Compression] Compressed file ${file.name} - New size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                    return compressedFile;
                } catch (err) {
                    console.error('[Compression] Error compressing file:', err);
                    return file; // Fallback to original if compression fails
                }
            }

            // 1. Upload Photos via storageService
            logger.debug('[Driver Reg] Compressing and Uploading photos...')
            const compressedSelfie = await compressIfNeeded(finalData.step1.selfiePhoto);
            const selfieUrl = await storageService.upload(compressedSelfie, STORAGE_PATHS.DRIVER_SELFIE, authUser.id)

            const compressedVehicle = await compressIfNeeded(finalData.step2.vehiclePhoto);
            const vehiclePhotoUrl = await storageService.upload(compressedVehicle, STORAGE_PATHS.DRIVER_VEHICLE, authUser.id)

            const compressedStnk = await compressIfNeeded(finalData.step2.stnkPhoto);
            const stnkUrl = await storageService.upload(compressedStnk, STORAGE_PATHS.DRIVER_VEHICLE, authUser.id)

            const compressedIdCard = await compressIfNeeded(finalData.step3.idCardPhoto);
            const idCardUrl = await storageService.upload(compressedIdCard, STORAGE_PATHS.DRIVER_KTP, authUser.id)

            const compressedPhotoWithVehicle = await compressIfNeeded(finalData.step3.photoWithVehicle);
            const photoWithVehicleUrl = await storageService.upload(compressedPhotoWithVehicle, STORAGE_PATHS.DRIVER_WITH_VEHICLE, authUser.id)

            logger.debug('[Driver Reg] Photos compressed and uploaded successfully')

            // 2. Insert Driver Record
            const { error } = await authService.insertDriverRecord({
                user_id: authUser.id,
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
                bank_account_name: finalData.step3.bankAccountName || null,
                bank_account_number: finalData.step3.bankAccountNumber || null,
                status: 'pending'
            })

            if (error) {
                console.error('[Driver Reg] Insert error:', error)
                throw new Error(error.message || 'Gagal menyimpan data pendaftaran driver.')
            }

            // 3. Update profile with registration info
            await authService.updateProfileData(authUser.id, {
                full_name: finalData.step1.fullName || undefined,
                phone: finalData.step1.phoneNumber || undefined
            })

            logger.debug('[Driver Reg] Registration submitted successfully!')
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
            const authUser = await authService.getCurrentUser()
            if (!authUser) throw new Error('Anda belum login. Silakan login terlebih dahulu.')

            // Merge latest step2 data with existing merchant state
            const finalData = {
                ...merchantData,
                step2: { ...merchantData.step2, ...(step2FormData || {}) }
            }

            // Options for compressing the images
            const compressionOptions = {
                maxSizeMB: 1, // Max file size in MB
                maxWidthOrHeight: 1920, // Max width/height
                useWebWorker: true,
            }

            // Function to compress if it's a valid File object
            const compressIfNeeded = async (file) => {
                if (!file || !(file instanceof File)) return file;
                try {
                    logger.debug(`[Compression] Compressing file ${file.name} - Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                    const compressedFile = await imageCompression(file, compressionOptions);
                    logger.debug(`[Compression] Compressed file ${file.name} - New size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                    return compressedFile;
                } catch (err) {
                    console.error('[Compression] Error compressing file:', err);
                    return file; // Fallback to original if compression fails
                }
            }

            // 1. Upload Photos via storageService
            logger.debug('[Merchant Reg] Compressing and Uploading photos...')
            const compressedIdCard = await compressIfNeeded(finalData.step2.idCardPhoto);
            const idCardUrl = await storageService.upload(compressedIdCard, STORAGE_PATHS.MERCHANT_KTP, authUser.id)

            const compressedShopPhoto = await compressIfNeeded(finalData.step2.shopPhoto);
            const shopPhotoUrl = await storageService.upload(compressedShopPhoto, STORAGE_PATHS.MERCHANT_LOGO, authUser.id)

            logger.debug('[Merchant Reg] Photos compressed and uploaded:', { idCardUrl, shopPhotoUrl })

            // 2. Insert Merchant Record 
            const insertData = {
                owner_id: authUser.id,
                name: finalData.step1.shopName,
                address: finalData.step1.address,
                phone: finalData.step1.phoneNumber,
                latitude: finalData.step1.location?.lat || null,
                longitude: finalData.step1.location?.lng || null,
                image_url: shopPhotoUrl,
                ktp_url: idCardUrl,
                bank_name: finalData.step2.bankName || null,
                bank_account_name: finalData.step2.bankAccountName || null,
                bank_account_number: finalData.step2.bankAccountNumber || null,
                status: 'pending'
            }

            logger.debug('[Merchant Reg] Inserting merchant:', insertData)

            const { error } = await authService.insertMerchantRecord(insertData)

            if (error) {
                console.error('[Merchant Reg] Insert error:', error)
                throw new Error(error.message || 'Gagal menyimpan data pendaftaran warung.')
            }

            // 3. Update profile with merchant owner info
            await authService.updateProfileData(authUser.id, {
                full_name: finalData.step1.ownerName || undefined
            })

            logger.debug('[Merchant Reg] Registration submitted successfully!')
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
