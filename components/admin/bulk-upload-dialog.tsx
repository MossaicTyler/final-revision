"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react"
import { bulkUploadTracking } from "@/app/actions/admin"
import { useRouter } from "next/navigation"

export function BulkUploadDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const text = await file.text()
      const response = await bulkUploadTracking(text)

      setResult(response)
      if (response.success) {
        router.refresh()
      }
    } catch (error) {
      setResult({ error: "Failed to process file" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Tracking Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">CSV Format Requirements:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>First row must contain headers</li>
              <li>Required columns: order_id, tracking_number, carrier</li>
              <li>Optional columns: estimated_delivery, status</li>
            </ul>
            <div className="mt-3 p-3 bg-background rounded border border-border/40 font-mono text-xs">
              order_id,tracking_number,carrier,estimated_delivery,status
              <br />
              123,1Z999AA10123456784,UPS,2024-12-25,shipped
              <br />
              124,9400111899562537866889,USPS,2024-12-26,shipped
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/40 rounded-lg cursor-pointer hover:bg-muted/20 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{file ? file.name : "Click to upload CSV file"}</p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-3">
              {result.success && result.results && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Upload Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                      <p className="text-sm text-muted-foreground">Successful</p>
                      <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                        {result.results.success}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{result.results.failed}</p>
                    </div>
                  </div>
                  {result.results.errors.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 max-h-32 overflow-y-auto">
                      <p className="text-sm font-medium mb-2">Errors:</p>
                      {result.results.errors.map((error: string, i: number) => (
                        <p key={i} className="text-xs text-red-600 dark:text-red-400">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {result.error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                  <span>{result.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
