import { toast } from 'react-toastify';

export default function DisplayNotification(type, message) {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message);
  }
}
