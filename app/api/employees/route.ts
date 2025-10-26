import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

const DATA_DIR = path.join(process.cwd(), 'data')
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json')
const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')

interface Employee {
  id: string
  name: string
  email: string
  designation: string
  team: string
  dob: string
  photo?: string
  createdAt: string
}

async function ensureDirectories() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  if (!existsSync(PHOTOS_DIR)) {
    await mkdir(PHOTOS_DIR, { recursive: true })
  }
}

async function readEmployees(): Promise<Employee[]> {
  try {
    await ensureDirectories()
    if (!existsSync(EMPLOYEES_FILE)) {
      return []
    }
    const data = await readFile(EMPLOYEES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function writeEmployees(employees: Employee[]) {
  await ensureDirectories()
  await writeFile(EMPLOYEES_FILE, JSON.stringify(employees, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const employees = await readEmployees()
    return NextResponse.json({ employees })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const designation = formData.get('designation') as string
    const team = formData.get('team') as string
    const dob = formData.get('dob') as string
    const photoFile = formData.get('photo') as File | null

    if (!name || !email || !designation || !team || !dob) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    const employees = await readEmployees()

    // Check if email already exists
    if (employees.some((emp) => emp.email === email)) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    let photoUrl = ''
    if (photoFile) {
      const bytes = await photoFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileExtension = photoFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExtension}`
      const filePath = path.join(PHOTOS_DIR, fileName)

      await writeFile(filePath, buffer)
      photoUrl = `/photos/${fileName}`
    }

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      name,
      email,
      designation,
      team,
      dob,
      photo: photoUrl || undefined,
      createdAt: new Date().toISOString(),
    }

    employees.push(newEmployee)
    await writeEmployees(employees)

    return NextResponse.json({ employee: newEmployee }, { status: 201 })
  } catch (error) {
    console.error('Error adding employee:', error)
    return NextResponse.json(
      { error: 'Failed to add employee' },
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
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const employees = await readEmployees()
    const filteredEmployees = employees.filter((emp) => emp.id !== id)

    if (employees.length === filteredEmployees.length) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    await writeEmployees(filteredEmployees)

    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
