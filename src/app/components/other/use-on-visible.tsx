import { RefObject, useState, useLayoutEffect } from "react";

const useOnVisible = (ref: RefObject<HTMLDivElement>) =>
{
    const [ isVisible, setIsVisible ] = useState(false);

    useLayoutEffect(() =>
    {
        const observer = new IntersectionObserver(
            ([ entry ]) =>
            {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.5 } // You can adjust this threshold as needed
        );

        const currentRef = ref.current; // Capture the current value of the ref

        if (currentRef)
        {
            observer.observe(currentRef);
        }

        return () =>
        {
            if (currentRef)
            {
                observer.unobserve(currentRef);
            }
        };
    }, [ ref ]);

    return isVisible;
};

export default useOnVisible;