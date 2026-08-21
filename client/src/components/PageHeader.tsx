type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="pb-2">
      <h1 className="text-3xl font-bold text-[#333333]">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </header>
  );
}
