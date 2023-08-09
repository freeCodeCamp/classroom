import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DisplayNotification(type, msg) {
  if (type === 'Success') {
    return toast.success(msg, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark'
    });
  } else if (type === 'Error') {
    return toast.error(msg, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark'
    });
  }
}
