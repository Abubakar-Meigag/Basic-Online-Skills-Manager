type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="pb-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#333333]">
        {title}
      </h1>
      <p className="mt-2 text-sm text-[#333333]">{description}</p>
    </header>
  );
}
