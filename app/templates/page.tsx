'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  url: string
  uploadedAt: string
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      setMessage('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !templateName) {
      setMessage('Please provide template name and file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('name', templateName)
      formData.append('file', file)

      const response = await fetch('/api/templates', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Template uploaded successfully!')
        setTemplateName('')
        setFile(null)
        setPreview('')
        fetchTemplates()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(data.error || 'Failed to upload template')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('Template deleted successfully')
        fetchTemplates()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to delete template')
      }
    } catch (error) {
      setMessage('An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Birthday Template
            </h2>

            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Birthday Card 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {preview && (
                  <div className="mt-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.includes('success')
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Template'}
              </button>
            </form>
          </div>

          {/* Templates List */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Templates ({templates.length})
            </h2>

            {templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No templates uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                    <img
                      src={template.url}
                      alt={template.name}
                      className="w-full rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
