import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function Attachments({ selectedTicket, loadingAttachments, theme }) {
    const [previewFile, setPreviewFile] = useState<string | null>(null)

    const isImage = (url: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    }

    const isPDF = (url: string) => {
        return /\.pdf$/i.test(url)
    }

    return (
        <div className="mt-6">
            <h2 className="font-medium mb-2">Pièces jointes</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto">
                {loadingAttachments ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                            Chargement des pièces jointes...
                        </p>
                    </div>
                ) : selectedTicket?.attachments && selectedTicket.attachments.length > 0 ? (
                    selectedTicket.attachments.map(attachment => {
                        const fileName =
                            attachment.title && attachment.title.trim() !== ''
                                ? attachment.title
                                : attachment.file.split('/').pop()

                        return (
                            <div
                                key={attachment.id}
                                className={`flex items-center justify-between p-3 border rounded-lg ${
                                    theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap ${
                                                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                            }`}
                                            title={fileName} // 👉 Tooltip complet au survol
                                        >
                                            {fileName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Aperçu */}
                                    {(isImage(attachment.file) || isPDF(attachment.file)) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                isImage(attachment.file)
                                                    ? setPreviewFile(attachment.file)
                                                    : window.open(attachment.file, '_blank')
                                            }
                                            className={`flex-shrink-0 ${
                                                theme === 'dark'
                                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            Aperçu
                                        </Button>
                                    )}

                                    {/* Télécharger */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(attachment.file, '_blank')}
                                        className={`flex-shrink-0 ${
                                            theme === 'dark'
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        Télécharger
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p
                        className={`italic text-center py-4 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}
                    >
                        Aucune pièce jointe
                    </p>
                )}
            </div>

            {/* Dialog de prévisualisation des images */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-3xl">
                    {previewFile && (
                        <img
                            src={previewFile}
                            alt="Aperçu de la pièce jointe"
                            className="w-full h-auto rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
