import type { Options } from 'qr-code-styling'
import { useCallback, useState } from 'react'
import { useToast } from '../components/ui/toastContext'
import { copyPngToClipboard, makeFileName, renderBlob, saveBlob, type ExportFormat } from '../lib/export'

export type ExportJob = ExportFormat | 'copy'

interface ExportSource {
  /** Renderer options for the current design, or null when nothing is valid. */
  options: Options | null
  /** Encoded text, for the "copy text" action. */
  payload: string
  /** Used to build a recognisable file name. */
  fileNameHint: string
}

/** Download, copy-as-image and copy-as-text, with busy state and toasts. */
export function useExportActions({ options, payload, fileNameHint }: ExportSource) {
  const { toast } = useToast()
  const [busy, setBusy] = useState<ExportJob | null>(null)

  const download = useCallback(
    async (format: ExportFormat) => {
      if (!options || busy) return
      setBusy(format)
      try {
        const blob = await renderBlob(options, format)
        const fileName = makeFileName(fileNameHint, format)
        saveBlob(blob, fileName)
        toast({ title: `${format.toUpperCase()} downloaded`, description: fileName })
      } catch {
        toast({
          title: `Couldn’t export the ${format.toUpperCase()}`,
          description: 'Please try again.',
          variant: 'error',
        })
      } finally {
        setBusy(null)
      }
    },
    [busy, fileNameHint, options, toast],
  )

  const copyImage = useCallback(async () => {
    if (!options || busy) return
    setBusy('copy')
    try {
      await copyPngToClipboard(renderBlob(options, 'png'))
      toast({ title: 'QR code copied', description: 'Paste it into any app as an image.' })
    } catch {
      toast({
        title: 'Couldn’t copy the image',
        description: 'Your browser blocked clipboard access. Download the PNG instead.',
        variant: 'error',
      })
    } finally {
      setBusy(null)
    }
  }, [busy, options, toast])

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(payload)
      toast({ title: 'Encoded text copied' })
    } catch {
      toast({ title: 'Couldn’t copy the text', variant: 'error' })
    }
  }, [payload, toast])

  return { busy, download, copyImage, copyText }
}
