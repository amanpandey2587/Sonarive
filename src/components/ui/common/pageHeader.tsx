interface PageHeaderProps{
    title:string;
    description?:string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6 md:p-10">
        <h1 className="text-3xl md:text-5xl font-bold text-indigo-200">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-lg md:text-xl text-teal-100">
            {description}
          </p>
        )}
      </div>
    );
  }
  