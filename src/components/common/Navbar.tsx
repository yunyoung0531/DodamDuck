'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NavbarAuthActions } from './NavbarAuthActions';
import { NavbarDrawer } from './NavbarDrawer';
import { NAV_LINKS, isActivePath } from './nav-links';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 justify-center border-b border-gray-200 bg-white">
      <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-8 lg:px-20">
        <Link href="/" className="flex shrink-0 items-center gap-2 no-underline">
          <Image
            src="/images/도담덕로고.png"
            alt="도담덕 로고"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-dodam-500">도담덕</span>
        </Link>

        <nav className="pointer-events-none absolute inset-x-0 hidden items-center justify-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="pointer-events-auto no-underline"
            >
              <span
                className={`text-sm ${
                  isActivePath(pathname, link.href)
                    ? 'font-bold text-dodam-500'
                    : 'text-gray-800'
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <NavbarAuthActions />

        <NavbarDrawer />
      </div>
    </header>
  );
}
