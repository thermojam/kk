export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        return nextResolve(new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }

    try {
        return await nextResolve(specifier, context);
    } catch (error) {
        if (specifier.startsWith('.') && !specifier.match(/\.[a-z]+$/i)) {
            return nextResolve(`${specifier}.ts`, context);
        }

        throw error;
    }
}
