import navbarStyles from './navbar.module.css';
import Image from 'next/image';

export default function Navbar({ children }) {
  return (
    <div className={navbarStyles.navbar}>
      <div className={navbarStyles.container}>
        <div></div>
        <div className={navbarStyles.logo}>
          <Image
            className={navbarStyles.navimage}
            priority
            layout='fixed'
            src='/images/fcc_primary_large.png'
            alt='FreeCodecamp Logo'
            width={330}
            height={40}
          ></Image>
        </div>
        <div>
          {children.map(children => (
            <div key={children}>
              <p>{children}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
