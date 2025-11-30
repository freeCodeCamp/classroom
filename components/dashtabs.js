// components/dashtabs.js
import React from 'react';
import Link from 'next/link';

export default function DashTabs({ columns, certificationNames, students }) {
  return (
    <div className='p-4'>
      <h2 className='text-lg font-bold mb-4'>Joined Students</h2>

      <table className='table-auto border-collapse border border-gray-300 w-full'>
        <thead className='bg-gray-100'>
          <tr>
            <th className='border px-4 py-2 text-left'>Email</th>
            <th className='border px-4 py-2 text-left'>Activity</th>
            <th className='border px-4 py-2 text-left'>Progress</th>
            <th className='border px-4 py-2 text-left'>Details</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan='4' className='text-center py-4 text-gray-500'>
                No students joined yet
              </td>
            </tr>
          ) : (
            students.map(s => (
              <tr key={s.id} className='hover:bg-gray-50'>
                <td className='border px-4 py-2'>{s.email}</td>
                <td className='border px-4 py-2'>
                  {/* placeholder until you track student activity */}0
                </td>
                <td className='border px-4 py-2'>
                  {/* placeholder until you track real progress */}
                  0/100
                </td>
                <td className='border px-4 py-2 text-blue-600 underline'>
                  <Link
                    href={`/dashboard/details/${encodeURIComponent(s.email)}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ✅ Example dashboard summary below */}
      <div className='mt-6'>
        <h3 className='text-md font-semibold mb-2'>Class Certifications</h3>
        <ul className='list-disc pl-6'>
          {certificationNames.map((name, i) => (
            <li key={i} className='mb-1'>
              {name} ({columns[i]?.length || 0} challenges)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
