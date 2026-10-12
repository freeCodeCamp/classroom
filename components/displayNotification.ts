import { toast } from 'react-toastify/unstyled';
import type { Id, ToastOptions } from 'react-toastify/unstyled';

const options: ToastOptions = {
  position: 'top-center',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light'
};

export default function DisplayNotification(
  type: string,
  msg: string
): Id | undefined {
  if (type === 'Success') {
    return toast.success(msg, options);
  } else if (type === 'Error') {
    return toast.error(msg, options);
  } else if (type === 'Info') {
    return toast.info(msg, options);
  }
}
