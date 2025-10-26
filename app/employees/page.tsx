'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Employee {
  id: string
  name: string
  email: string
  designation: string
  team: string
  dob: string
  photo?: string
}

export default function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      setMessage('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return

    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('Employee deleted successfully')
        fetchEmployees()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to delete employee')
      }
    } catch (error) {
      setMessage('An error occurred')
    }
  }

  const getUpcomingBirthday = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    )

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1)
    }

    const daysUntil = Math.ceil(
      (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysUntil
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
        <div className="mb-6 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
          <Link
            href="/employees/add"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Employee
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Employee Birthday List
          </h1>

          {message && (
            <div className="mb-4 p-4 rounded-lg bg-blue-50 text-blue-800">
              {message}
            </div>
          )}

          {employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No employees added yet
              </p>
              <Link
                href="/employees/add"
                className="text-blue-600 hover:text-blue-800"
              >
                Add your first employee
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {employees.map((employee) => {
                const daysUntil = getUpcomingBirthday(employee.dob)
                const isToday = daysUntil === 0

                return (
                  <div
                    key={employee.id}
                    className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                      isToday ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {employee.photo ? (
                          <img
                            src={employee.photo}
                            alt={employee.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                            👤
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {employee.name}
                            {isToday && <span className="ml-2">🎉</span>}
                          </h3>
                          <p className="text-gray-600">{employee.designation}</p>
                          <p className="text-gray-500 text-sm">
                            Team: {employee.team}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Email: {employee.email}
                          </p>
                          <p className="text-gray-700 mt-2">
                            Birthday: {format(new Date(employee.dob), 'MMMM d')}
                            {isToday && (
                              <span className="ml-2 text-yellow-700 font-semibold">
                                TODAY!
                              </span>
                            )}
                            {!isToday && (
                              <span className="ml-2 text-gray-500">
                                (in {daysUntil} days)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-800 px-4 py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
