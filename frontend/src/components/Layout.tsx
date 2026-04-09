import { Navbar } from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">{children}</main>
    </div>
  );
}
