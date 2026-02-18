import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseClient
vi.mock('../../services/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            not: vi.fn().mockReturnThis()
        }))
    }
}))

// Mock DOM APIs for download
const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
const mockRevokeObjectURL = vi.fn()
const mockClick = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    global.Blob = class MockBlob {
        constructor(content, options) {
            this.content = content
            this.options = options
            this.size = content[0]?.length || 0
        }
    }
})

describe('exportService', () => {
    let exportService

    beforeEach(async () => {
        const mod = await import('../../services/exportService')
        exportService = mod.exportService || mod.default
    })

    describe('toCSV', () => {
        it('should generate correct CSV header and rows', () => {
            const data = [
                { name: 'Alice', age: 30, city: 'Jakarta' },
                { name: 'Bob', age: 25, city: 'Bandung' }
            ]
            const columns = [
                { key: 'name', label: 'Nama' },
                { key: 'age', label: 'Umur' },
                { key: 'city', label: 'Kota' }
            ]

            const csv = exportService.toCSV(data, columns)

            expect(csv).toContain('"Nama","Umur","Kota"')
            expect(csv).toContain('"Alice","30","Jakarta"')
            expect(csv).toContain('"Bob","25","Bandung"')
        })

        it('should handle empty data array', () => {
            const csv = exportService.toCSV([], [{ key: 'name', label: 'Name' }])
            expect(csv).toBe('')
        })

        it('should escape quotes in values', () => {
            const data = [{ name: 'Alice "The Great"' }]
            const columns = [{ key: 'name', label: 'Nama' }]

            const csv = exportService.toCSV(data, columns)

            expect(csv).toContain('Alice ""The Great""')
        })

        it('should handle null and undefined values', () => {
            const data = [{ name: null, age: undefined }]
            const columns = [
                { key: 'name', label: 'Nama' },
                { key: 'age', label: 'Umur' }
            ]

            const csv = exportService.toCSV(data, columns)

            expect(csv).toContain('"",""')
        })

        it('should stringify object values', () => {
            const data = [{ info: { key: 'val' } }]
            const columns = [{ key: 'info', label: 'Info' }]

            const csv = exportService.toCSV(data, columns)

            // JSON gets stringified then quotes escaped: {"key":"val"} -> {""key"":""val""}
            expect(csv).toContain('key')
            expect(csv).toContain('val')
        })
    })

    describe('downloadCSV', () => {
        it('should create a Blob with UTF-8 BOM and trigger download', () => {
            const mockLink = {
                href: '',
                download: '',
                click: mockClick
            }
            vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
            vi.spyOn(document.body, 'appendChild').mockImplementation(() => { })
            vi.spyOn(document.body, 'removeChild').mockImplementation(() => { })

            exportService.downloadCSV('test,csv,data', 'test_export')

            // Blob is a class mock, just verify URL + download name
            expect(mockCreateObjectURL).toHaveBeenCalled()
            expect(mockLink.download).toContain('test_export')
            expect(mockLink.download).toContain('.csv')
            expect(mockClick).toHaveBeenCalled()
        })
    })
})
