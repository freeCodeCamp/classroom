import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Navbar from '../../components/navbar';

import prisma from '../../prisma/prisma';
import dynamic from 'next/dynamic';
import { requireRole } from '../../util/protectRoute';

export async function getServerSideProps(context) {
  const sessionCheck = await requireRole(context, ['admin']);
  if (sessionCheck.redirect) return sessionCheck;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  return {
    props: {
      users,
      session: sessionCheck.props.session
    }
  };
}

export default function AdminPage({ users }) {
  const AdminTable = dynamic(() => import('../../components/adminTable'), {
    ssr: false
  });

  async function updateRole(email, role) {
    const res = await fetch('/api/admin/updateRole', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: role.toLowerCase() })
    });

    if (res.ok) {
      alert(`Updated ${email} to ${role}`);
      window.location.reload();
    } else {
      alert('Error updating role');
    }
  }

  async function deleteUser(email) {
    if (!confirm(`Delete ${email}?`)) return;

    const res = await fetch('/api/admin/deleteUser', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      alert(`Deleted ${email}`);
      window.location.reload();
    } else {
      alert('Error deleting user');
    }
  }

  const usersWithActions = users.map(u => ({
    name: u.name,
    email: u.email,
    role: u.role,
    adminActions: (
      <div className='flex gap-2'>
        <button
          onClick={() => updateRole(u.email, 'student')}
          className='px-2 py-1 bg-blue-500 text-white rounded'
        >
          Student
        </button>
        <button
          onClick={() => updateRole(u.email, 'teacher')}
          className='px-2 py-1 bg-green-500 text-white rounded'
        >
          Teacher
        </button>
        <button
          onClick={() => updateRole(u.email, 'admin')}
          className='px-2 py-1 bg-red-500 text-white rounded'
        >
          Admin
        </button>
        <button
          onClick={() => deleteUser(u.email)}
          className='px-2 py-1 bg-gray-700 text-white rounded'
        >
          Delete
        </button>
      </div>
    )
  }));

  const columns = [
    { name: 'Name', selector: r => r.name },
    { name: 'Email', selector: r => r.email },
    { name: 'Role', selector: r => r.role },
    { name: 'Actions', selector: r => r.adminActions }
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard</title>
      </Head>

      <Navbar />

      <div className={styles.boxx}>
        <h1 className='text-[40px] text-center big-heading underline'>Admin</h1>
      </div>

      <AdminTable columns={columns} data={usersWithActions} />
    </div>
  );
}
