import { Suspense } from "react";

export default function LoginRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    return (
        <div className="w-full h-full flex align-center justify-center">
            <div className="relative" style={ { transform: 'translateY(50%)' } }>
                <Suspense>
                    { children }
                </Suspense>
            </div>
        </div>
    );
};
