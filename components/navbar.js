import navbarStyles from './navbar.module.css';
import Image from 'next/image';

export default function Navbar({ children }) {
  return (
    <div className={navbarStyles.navbar}>
      <Image
        className={navbarStyles.navimage}
        priority
        layout='fixed'
        src='/images/fcc_primary_large.png'
        alt='FreeCodecamp Logo'
        width={330}
        height={40}
      ></Image>
      <ul className={navbarStyles.navLinks}>{children}</ul>
    </div>
  );
}
