export function parseCookies(cookies: string): Record<string, string> {
    return cookies.split('; ').reduce<Record<string, string>>((acc, current) => {
        const [name, ...value] = current.split('=');
        acc[name] = value.join('=');
        return acc;
    }, {});
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
