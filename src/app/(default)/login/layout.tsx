
export default function LoginRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    return (
        <div className="w-full h-full flex align-center justify-center">
            <div className="relative" style={ { transform: 'translateY(50%)' } }>
                { children }
            </div>
        </div>
    );
};
