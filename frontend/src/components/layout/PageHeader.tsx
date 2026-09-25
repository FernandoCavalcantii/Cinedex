type PageHeaderProps = {
  eyebrow: string;
  title: string;
};

export function PageHeader({ eyebrow, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p className="page-header__eyebrow">{eyebrow}</p>
      <h1 className="page-header__title">{title}</h1>
    </header>
  );
}
