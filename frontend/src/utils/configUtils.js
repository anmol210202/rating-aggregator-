export const generateManifestUrl = (config) => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();

    // Default order + enabled for clean check
    const defaultRatings = [
        'commonSense',
        'imdb',
        'tmdb',
        'metacritic',
        'cringemdb'
    ];

    const enabledRatings = Object.entries(config.ratings)
        .filter(([_, val]) => val.enabled)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([key]) => key);

    const isDefault =
        enabledRatings.length === defaultRatings.length &&
        enabledRatings.every((id, i) => id === defaultRatings[i]);

    if (!isDefault) {
        params.append('ratings', enabledRatings.join(','));
    }

    if (config.mdbList.enabled && config.mdbList.apiKey) {
        params.append('mdbListKey', config.mdbList.apiKey);
    }

    const paramString = params.toString();
    return paramString
        ? `${baseUrl}/manifest.json?${paramString}`
        : `${baseUrl}/manifest.json`;
};
