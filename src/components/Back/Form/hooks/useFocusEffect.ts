import { useEffect, useRef } from 'react';

export const useFocusEffect = (isFirst?: boolean) => {
    const fieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!fieldRef.current || !isFirst) return;

        fieldRef.current.focus();
    }, []);

    return fieldRef;
};
