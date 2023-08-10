export function convertTempKelvinToCelsius(tempKelvin: number): number {
    return Math.round(tempKelvin - 273.15);
}

export function capitalized(str: string): string {
    const capitalizedFirst = str[0].toUpperCase();
    const rest = str.slice(1);

    return capitalizedFirst + rest;
}

export function metersToKm(meters: number): string {
    return (meters / 1000).toFixed(1)
}

let typingTimer: ReturnType<typeof setTimeout>;
const DONE_TYPING_INTERVAL_MC = 500;
export const debounds = (cb: (...params: any) => void, ...params: any) => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        cb(...params);
    }, DONE_TYPING_INTERVAL_MC);
};
