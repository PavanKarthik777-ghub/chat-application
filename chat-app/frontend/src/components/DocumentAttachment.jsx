import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Eye, File, FileSpreadsheet, FileImage, FileVideo } from 'lucide-react'

export default function DocumentAttachment({ attachment, isOwn }) {
  // Handle uploading state
  if (attachment.uploading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-2"
      >
        <div className={`max-w-xs rounded-xl border-2 border-dashed transition-all duration-200 ${
          isOwn 
            ? 'border-blue-300 bg-blue-50/50' 
            : 'border-gray-300 bg-gray-50/50'
        }`}>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {attachment.fileName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                  <span className="text-xs text-gray-500">Uploading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  const getFileIcon = (fileType, mimeType) => {
    if (mimeType?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
    if (mimeType?.includes('word') || fileType === 'doc' || fileType === 'docx') return <FileText className="w-8 h-8 text-blue-500" />
    if (mimeType?.includes('excel') || fileType === 'xls' || fileType === 'xlsx') return <FileSpreadsheet className="w-8 h-8 text-green-500" />
    if (mimeType?.includes('powerpoint') || fileType === 'ppt' || fileType === 'pptx') return <FileImage className="w-8 h-8 text-orange-500" />
    if (mimeType?.includes('text')) return <FileText className="w-8 h-8 text-gray-500" />
    return <File className="w-8 h-8 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    try {
      // Use downloadUrl if available, otherwise use fileUrl
      const downloadUrl = attachment.downloadUrl || attachment.fileUrl
      
      // Fetch the file with proper headers
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      // Get the blob data
      const blob = await response.blob()
      
      // Create download link with proper filename
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.fileName
      
      // Add to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      // Fallback to simple download
      const link = document.createElement('a')
      link.href = attachment.fileUrl
      link.download = attachment.fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreview = () => {
    // For PDFs, use Google Docs Viewer for better preview
    if (attachment.mimeType?.includes('pdf')) {
      const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(attachment.fileUrl)}&embedded=true`
      const newWindow = window.open('', '_blank')
      newWindow.document.write(`
        <html>
          <head>
            <title>${attachment.fileName}</title>
            <style>
              body { margin: 0; padding: 0; background: #f5f5f5; }
              iframe { width: 100%; height: 100vh; border: none; }
              .header { background: white; padding: 10px; border-bottom: 1px solid #ddd; }
              .download-btn { background: #4285f4; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>${attachment.fileName}</h3>
              <button class="download-btn" onclick="window.open('${attachment.fileUrl}', '_blank')">Download PDF</button>
            </div>
            <iframe src="${googleDocsUrl}" 
                    width="100%" 
                    height="calc(100vh - 60px)">
              <p>PDF preview not available. 
                 <a href="${attachment.fileUrl}" target="_blank">Click here to download</a>
              </p>
            </iframe>
          </body>
        </html>
      `)
      newWindow.document.close()
    } else {
      // For other files, trigger download
      handleDownload()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="mt-2"
    >
      <div className={`max-w-xs rounded-xl border-2 border-dashed transition-all duration-200 hover:shadow-lg ${
        isOwn 
          ? 'border-blue-300 bg-blue-50/50' 
          : 'border-gray-300 bg-gray-50/50'
      }`}>
        <div className="p-4">
          {/* File Icon and Info */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getFileIcon(attachment.fileType, attachment.mimeType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 truncate" title={attachment.fileName}>
                {attachment.fileName}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {formatFileSize(attachment.fileSize)} • {attachment.fileType?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreview}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isOwn
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Eye size={12} />
              {attachment.mimeType?.includes('pdf') ? 'Preview' : 'Open'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isOwn
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Download size={12} />
              Download
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
