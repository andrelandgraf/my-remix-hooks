import type { MetaFunction, LinksFunction } from '@remix-run/node';
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import styles from './styles/tailwind.css';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

function Navigation() {
  return (
    <nav className="w-full flex flex-row flex-wrap gap-y-2 gap-x-6 p-4">
      <Link className="underline hover:bg-red-700" to="/">
        Homepage
      </Link>
      <Link className="underline hover:bg-red-700" to="/message-board">
        Message Board
      </Link>
      <Link className="underline hover:bg-red-700" to="/message-board-final">
        Message Board (final)
      </Link>
      <Link className="underline hover:bg-red-700" to="/message-board-ludicrous">
        Message Board (ludicrous)
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <Navigation />
        </header>
        <main className="mb-20">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
