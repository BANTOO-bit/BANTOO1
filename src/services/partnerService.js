import { supabase } from './supabaseClient'
import { storageService, STORAGE_PATHS } from './storageService'
import imageCompression from 'browser-image-compression'
import logger from '../utils/logger'

/**
 * Partner Service — Handles driver & merchant partner registration.
 * Extracted from PartnerRegistrationContext to follow clean architecture.
 */
export const partnerService = {
    /**
     * Submit driver registration
     */
    async submitDriverRegistration(userId, driverData, files) {
        // Helper: compress image if valid File
        const compressIfNeeded = async (file) => {
            if (!(file instanceof File) || !file.type?.startsWith('image/')) return file
            try {
                return await imageCompression(file, {
                    maxSizeMB: 0.3,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    fileType: 'image/webp'
                })
            } catch {
                return file
            }
        }

        // Upload files
        const uploadPromises = {}
        const fileFields = ['ktp_photo', 'sim_photo', 'stnk_photo', 'vehicle_photo', 'selfie_photo']
        for (const field of fileFields) {
            if (files[field] instanceof File) {
                const compressed = await compressIfNeeded(files[field])
                const folder = field.replace('_photo', '')
                uploadPromises[field] = storageService.uploadFile(
                    compressed,
                    `${STORAGE_PATHS.DRIVERS}/${userId}/${folder}`
                )
            }
        }

        // Wait for all uploads
        const uploadResults = {}
        for (const [field, promise] of Object.entries(uploadPromises)) {
            try {
                const url = await promise
                uploadResults[field] = url
            } catch (err) {
                logger.error(`Failed to upload ${field}:`, err)
            }
        }

        // Prepare driver record
        const driverRecord = {
            user_id: userId,
            vehicle_type: driverData.vehicle_type,
            vehicle_plate: driverData.vehicle_plate,
            vehicle_brand: driverData.vehicle_brand || null,
            vehicle_year: driverData.vehicle_year || null,
            nik: driverData.nik || null,
            sim_number: driverData.sim_number || null,
            ktp_photo_url: uploadResults.ktp_photo || null,
            sim_photo_url: uploadResults.sim_photo || null,
            stnk_photo_url: uploadResults.stnk_photo || null,
            vehicle_photo_url: uploadResults.vehicle_photo || null,
            selfie_photo_url: uploadResults.selfie_photo || null,
            status: 'pending',
        }

        const { data, error } = await supabase
            .from('drivers')
            .insert(driverRecord)
            .select()
            .single()

        if (error) throw error

        // Update profile
        await supabase
            .from('profiles')
            .update({ full_name: driverData.full_name || null })
            .eq('id', userId)

        return data
    },

    /**
     * Submit merchant registration
     */
    async submitMerchantRegistration(userId, merchantData, files) {
        const compressIfNeeded = async (file) => {
            if (!(file instanceof File) || !file.type?.startsWith('image/')) return file
            try {
                return await imageCompression(file, {
                    maxSizeMB: 0.3,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                    fileType: 'image/webp'
                })
            } catch {
                return file
            }
        }

        // Upload files
        const uploadPromises = {}
        const fileFields = ['ktp_photo', 'merchant_photo']
        for (const field of fileFields) {
            if (files[field] instanceof File) {
                const compressed = await compressIfNeeded(files[field])
                const folder = field.replace('_photo', '')
                uploadPromises[field] = storageService.uploadFile(
                    compressed,
                    `${STORAGE_PATHS.MERCHANTS}/${userId}/${folder}`
                )
            }
        }

        const uploadResults = {}
        for (const [field, promise] of Object.entries(uploadPromises)) {
            try {
                const url = await promise
                uploadResults[field] = url
            } catch (err) {
                logger.error(`Failed to upload ${field}:`, err)
            }
        }

        // Prepare merchant record
        const merchantRecord = {
            owner_id: userId,
            name: merchantData.name,
            category: merchantData.category || null,
            address: merchantData.address || null,
            phone: merchantData.phone || null,
            latitude: merchantData.latitude || null,
            longitude: merchantData.longitude || null,
            owner_name: merchantData.owner_name || null,
            owner_nik: merchantData.owner_nik || null,
            ktp_photo_url: uploadResults.ktp_photo || null,
            image: uploadResults.merchant_photo || null,
            status: 'pending',
        }

        const { data, error } = await supabase
            .from('merchants')
            .insert(merchantRecord)
            .select()
            .single()

        if (error) throw error
        return data
    },
}

export default partnerService
