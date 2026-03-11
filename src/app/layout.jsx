import './globals.css';

export const metadata = {
  title: 'HR AI Diagnostic',
  description: 'Discover your HR maturity, identify priority bottlenecks, and get a tailored AI transformation roadmap.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
