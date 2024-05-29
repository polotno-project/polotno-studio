import {useEffect} from "react";

function useIntersectionObserver(options) {

    const {
        root = null,
        target,
        onIntersect,
        threshold = 0.9,
        rootMargin = "0px",
        isLoading,
        enabled = true,
    } = options;

    useEffect(() => {
        if (isLoading) return;
        const observer = new IntersectionObserver((entries) =>
                entries.forEach((entry) => entry.isIntersecting && onIntersect()),
            {
                root: root && root.current,
                rootMargin,
                threshold,
            }
        );

        const el = target && target.current;
        if (!el) {
            return;
        }
        setTimeout(() => {
            observer.observe(el);
        })
        return () => {
            observer.unobserve(el);
        };
    }, [target.current,enabled, isLoading]);

}

export default useIntersectionObserver
