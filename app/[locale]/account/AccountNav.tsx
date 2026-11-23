"use client";

import {Link, usePathname} from "../../../i18n/navigation";
import styles from "./account.module.scss";

type AccountNavProps = {
  label: string;
  items: {href: string; label: string}[];
};

// The links with the current section marked. `pathname` is null while it is not known yet.
export function AccountNavLinks({
  label,
  items,
  pathname,
}: AccountNavProps & {pathname: string | null}) {
  return (
    <nav aria-label={label}>
      <ul className={styles.nav}>
        {items.map((item) => {
          // Profile is exact; the others also cover their detail pages.
          const isCurrent =
            pathname !== null &&
            (item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink}${isCurrent ? ` ${styles.navLinkCurrent}` : ""}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Client only to mark the current section: usePathname is the one thing the server cannot see.
// The layout wraps this in Suspense and shows AccountNavLinks without a current marker meanwhile.
export default function AccountNav(props: AccountNavProps) {
  return <AccountNavLinks {...props} pathname={usePathname()} />;
}
