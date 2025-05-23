interface PageHeaderProps{
    title:string;
    description?:string;
}

export function PageHeader({title,description}:PageHeaderProps){
    return (
        <div>
            <h1>
                {title}
            </h1>
            {description && (
                <p className="mt-3 text-lg text-muted-foreground md:text-xl">
                    {description}
                </p>
            )}
        </div>
    );
}