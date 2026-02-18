/**
 * Storage Service — Centralized Supabase Storage upload/download/delete
 * 
 * Bucket structure:
 *   public-assets/  → profile photos, merchant logos, menu images (PUBLIC)
 *   private-docs/   → KTP, STNK, receipts, evidence (PRIVATE)
 * 
 * Folder convention: {category}/{subcategory}/{ownerId}/{timestamp_random.ext}
 */

import { supabase } from './supabaseClient'

// ===== CONSTANTS =====

const BUCKETS = {
    PUBLIC: 'public-assets',
    PRIVATE: 'private-docs'
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf']

/**
 * Predefined folder paths for consistent structure.
 * Each key maps to { bucket, folder, allowedTypes }
 */
export const STORAGE_PATHS = {
    // Public assets
    USER_PROFILE: { bucket: BUCKETS.PUBLIC, folder: 'users/profile', allowedTypes: ALLOWED_IMAGE_TYPES },
    MERCHANT_LOGO: { bucket: BUCKETS.PUBLIC, folder: 'merchants/logo', allowedTypes: ALLOWED_IMAGE_TYPES },
    MERCHANT_MENU: { bucket: BUCKETS.PUBLIC, folder: 'merchants/menu', allowedTypes: ALLOWED_IMAGE_TYPES },

    // Private docs
    DRIVER_KTP: { bucket: BUCKETS.PRIVATE, folder: 'drivers/ktp', allowedTypes: ALLOWED_DOC_TYPES },
    DRIVER_VEHICLE: { bucket: BUCKETS.PRIVATE, folder: 'drivers/vehicle', allowedTypes: ALLOWED_DOC_TYPES },
    DRIVER_SELFIE: { bucket: BUCKETS.PRIVATE, folder: 'drivers/selfie', allowedTypes: ALLOWED_IMAGE_TYPES },
    DRIVER_WITH_VEHICLE: { bucket: BUCKETS.PRIVATE, folder: 'drivers/with-vehicle', allowedTypes: ALLOWED_IMAGE_TYPES },
    MERCHANT_KTP: { bucket: BUCKETS.PRIVATE, folder: 'merchants/ktp', allowedTypes: ALLOWED_DOC_TYPES },
    FINANCE_RECEIPT: { bucket: BUCKETS.PRIVATE, folder: 'finance/receipts', allowedTypes: ALLOWED_IMAGE_TYPES },
    ISSUE_EVIDENCE: { bucket: BUCKETS.PRIVATE, folder: 'issues/evidence', allowedTypes: ALLOWED_IMAGE_TYPES },
}


// ===== SERVICE =====

export const storageService = {

    /**
     * Upload a file to Supabase Storage.
     * Validates type & size, generates unique filename, handles blob conversion.
     * 
     * @param {File} file - The file to upload
     * @param {Object} storagePath - One of STORAGE_PATHS (e.g. STORAGE_PATHS.MERCHANT_MENU)
     * @param {string} ownerId - User ID or entity ID for folder scoping
     * @param {Object} [options] - Optional overrides
     * @param {number} [options.maxSize] - Override max file size in bytes
     * @returns {Promise<{ url: string, path: string, bucket: string }>}
     */
    async uploadFile(file, storagePath, ownerId, options = {}) {
        // 1. Validate inputs
        if (!file) throw new StorageError('File tidak boleh kosong', 'NO_FILE')
        if (!storagePath?.bucket || !storagePath?.folder) {
            throw new StorageError('Storage path tidak valid', 'INVALID_PATH')
        }
        if (!ownerId) throw new StorageError('Owner ID diperlukan', 'NO_OWNER')

        // 2. Validate file type
        const fileType = file.type || `image/${this._getExtension(file.name)}`
        const allowedTypes = storagePath.allowedTypes || ALLOWED_IMAGE_TYPES
        if (!allowedTypes.includes(fileType)) {
            const allowed = allowedTypes.map(t => t.split('/')[1]).join(', ')
            throw new StorageError(
                `Format file tidak didukung. Gunakan: ${allowed}`,
                'INVALID_TYPE'
            )
        }

        // 3. Validate file size
        const maxSize = options.maxSize || MAX_FILE_SIZE
        if (file.size > maxSize) {
            const maxMB = (maxSize / (1024 * 1024)).toFixed(0)
            throw new StorageError(
                `Ukuran file terlalu besar. Maksimal ${maxMB}MB`,
                'FILE_TOO_LARGE'
            )
        }

        // 4. Generate unique file path
        const ext = this._getExtension(file.name) || 'jpg'
        const uniqueName = `${Date.now()}_${this._randomId()}.${ext}`
        const fullPath = `${storagePath.folder}/${ownerId}/${uniqueName}`

        // 5. Convert to blob to avoid ERR_UPLOAD_FILE_CHANGED in Chrome
        const arrayBuffer = await file.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: fileType })

        // 6. Upload
        const { data, error } = await supabase.storage
            .from(storagePath.bucket)
            .upload(fullPath, blob, {
                contentType: fileType,
                cacheControl: '3600',
                upsert: false // Never overwrite
            })

        if (error) {
            console.error('[StorageService] Upload error:', error)
            throw new StorageError(
                'Gagal mengunggah file. Silakan coba lagi.',
                'UPLOAD_FAILED',
                error
            )
        }

        // 7. Get URL
        let url
        if (storagePath.bucket === BUCKETS.PUBLIC) {
            url = this.getPublicUrl(storagePath.bucket, fullPath)
        } else {
            // For private bucket, return signed URL (1 hour)
            url = await this.getSignedUrl(fullPath, 3600)
        }

        return {
            url,
            path: fullPath,
            bucket: storagePath.bucket
        }
    },


    /**
     * Get public URL for a file in a public bucket.
     * @param {string} bucket - Bucket name
     * @param {string} path - File path
     * @returns {string}
     */
    getPublicUrl(bucket, path) {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path)
        return data?.publicUrl || null
    },


    /**
     * Get a temporary signed URL for a private file.
     * @param {string} path - File path within private-docs bucket
     * @param {number} [expiresIn=3600] - Seconds until URL expires (default 1 hour)
     * @returns {Promise<string>}
     */
    async getSignedUrl(path, expiresIn = 3600) {
        const { data, error } = await supabase.storage
            .from(BUCKETS.PRIVATE)
            .createSignedUrl(path, expiresIn)

        if (error) {
            console.error('[StorageService] Signed URL error:', error)
            throw new StorageError('Gagal membuat URL file', 'SIGNED_URL_FAILED', error)
        }
        return data?.signedUrl || null
    },


    /**
     * Delete a file from storage.
     * @param {string} bucket - Bucket name
     * @param {string} path - File path
     */
    async deleteFile(bucket, path) {
        if (!bucket || !path) return
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path])

            if (error) {
                console.error('[StorageService] Delete error:', error)
            }
        } catch (err) {
            // Non-critical, just log
            console.error('[StorageService] Delete failed:', err)
        }
    },


    /**
     * Convenience: Upload and return only the URL string.
     * Most consumers just need the URL.
     * 
     * @param {File} file 
     * @param {Object} storagePath - One of STORAGE_PATHS
     * @param {string} ownerId 
     * @returns {Promise<string|null>} URL or null if no file
     */
    async upload(file, storagePath, ownerId) {
        if (!file) return null
        const result = await this.uploadFile(file, storagePath, ownerId)
        return result.url
    },


    // ===== PRIVATE HELPERS =====

    _getExtension(filename) {
        if (!filename) return 'jpg'
        const parts = filename.split('.')
        return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg'
    },

    _randomId() {
        return Math.random().toString(36).substring(2, 10)
    }
}


/**
 * Custom error class for storage operations.
 */
export class StorageError extends Error {
    constructor(message, code, originalError = null) {
        super(message)
        this.name = 'StorageError'
        this.code = code
        this.originalError = originalError
    }
}


export default storageService
