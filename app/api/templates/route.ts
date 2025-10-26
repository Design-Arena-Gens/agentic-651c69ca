import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json')
const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'templates')

interface Template {
  id: string
  name: string
  url: string
  uploadedAt: string
}

async function ensureDirectories() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  if (!existsSync(TEMPLATES_DIR)) {
    await mkdir(TEMPLATES_DIR, { recursive: true })
  }
}

async function readTemplates(): Promise<Template[]> {
  try {
    await ensureDirectories()
    if (!existsSync(TEMPLATES_FILE)) {
      return []
    }
    const data = await readFile(TEMPLATES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeTemplates(templates: Template[]) {
  await ensureDirectories()
  await writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const templates = await readTemplates()
    return NextResponse.json({ templates })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const file = formData.get('file') as File | null

    if (!name || !file) {
      return NextResponse.json(
        { error: 'Template name and file are required' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExtension}`
    const filePath = path.join(TEMPLATES_DIR, fileName)

    await writeFile(filePath, buffer)

    const templates = await readTemplates()

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name,
      url: `/templates/${fileName}`,
      uploadedAt: new Date().toISOString(),
    }

    templates.push(newTemplate)
    await writeTemplates(templates)

    return NextResponse.json({ template: newTemplate }, { status: 201 })
  } catch (error) {
    console.error('Error uploading template:', error)
    return NextResponse.json(
      { error: 'Failed to upload template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const templates = await readTemplates()
    const filteredTemplates = templates.filter((tpl) => tpl.id !== id)

    if (templates.length === filteredTemplates.length) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    await writeTemplates(filteredTemplates)

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
