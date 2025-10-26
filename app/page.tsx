'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎂 Birthday Wishing App
          </h1>
          <p className="text-xl text-gray-600">
            Manage team birthdays and send automated wishes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link href="/employees/add">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-semibold mb-2">Add Employee</h2>
              <p className="text-gray-600">
                Register new employee with birthday details
              </p>
            </div>
          </Link>

          <Link href="/employees">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold mb-2">View Employees</h2>
              <p className="text-gray-600">
                Manage employee list and birthday data
              </p>
            </div>
          </Link>

          <Link href="/templates">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <div className="text-4xl mb-4">🎨</div>
              <h2 className="text-2xl font-semibold mb-2">Templates</h2>
              <p className="text-gray-600">
                Upload and manage birthday card templates
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How It Works
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Add employees with their name, designation, team, and DOB</li>
            <li>✓ Upload employee photos and birthday card templates</li>
            <li>✓ Automatic emails sent on birthdays via Outlook</li>
            <li>✓ Personalized messages with employee details</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
