import { useRouter } from 'next/router';

export default function DashboardWithCode() {
  const router = useRouter();
  const { classCode } = router.query;

  return <p>classCode: {classCode}</p>;
}
