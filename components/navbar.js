import navbarStyles from './navbar.module.css';

export default function Navbar({ children }) {
  return <div className={navbarStyles.navbar}>{children}</div>;
}
