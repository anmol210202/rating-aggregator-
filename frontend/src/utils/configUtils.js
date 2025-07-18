export const generateManifestUrl = (config) => {
    const origin = window.location.origin

    // Default rating order
    const defaultOrder = [
        'age',
        'imdb',
        'tmdb',
        'metacritic',
        'mcUsers',
        'rt',
        'rtUsers',
        'cringemdb',
    ]

    const enabled = Object.entries(config.ratings)
        .filter(([, v]) => v.enabled)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([id]) => id)

    // Build path-based manifest URL
    let manifestPath = '/manifest.json'

    if (
        enabled.length !== defaultOrder.length ||
        !enabled.every((id, i) => id === defaultOrder[i])
    ) {
        manifestPath = `/ratings=${encodeURIComponent(enabled.join(','))}/manifest.json`
    }

    // Optional query string
    const params = new URLSearchParams()
    if (config.mdbList.enabled && config.mdbList.apiKey) {
        params.set('mdbListKey', config.mdbList.apiKey)
    }

    const qs = params.toString()
    return `${origin}${manifestPath}${qs ? '?' + qs : ''}`
}
