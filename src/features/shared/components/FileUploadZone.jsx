import { useState } from 'react'

function FileUploadZone({
    icon = 'add_a_photo',
    title = 'Upload File',
    subtitle = 'Format JPG or PNG',
    accept = 'image/*',
    capture = null,
    onChange,
    preview = null,
    required = false
}) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0 && onChange) {
            onChange(files[0])
        }
    }

    const handleFileChange = (e) => {
        const files = e.target.files
        if (files.length > 0 && onChange) {
            onChange(files[0])
        }
    }

    return (
        <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer group relative overflow-hidden ${isDragging
                    ? 'border-primary bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept={accept}
                capture={capture}
                onChange={handleFileChange}
                required={required}
            />

            {preview ? (
                <div className="flex flex-col items-center">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-40 rounded-lg mb-2"
                    />
                    <span className="text-xs text-gray-500">Click to change</span>
                </div>
            ) : (
                <div className="space-y-1 text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-full transition-all group-hover:scale-110">
                        <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-primary transition-colors">
                            {icon}
                        </span>
                    </div>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                        <span className="relative cursor-pointer rounded-md font-medium text-primary hover:text-blue-700">
                            <span>{title}</span>
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
            )}
        </div>
    )
}

export default FileUploadZone
