import "./globals.css";
export const metadata = {
  title: "ДЕВИОНТ — интегратор 1С в Москве",
  description: "Внедрение и доработка решений 1С.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}