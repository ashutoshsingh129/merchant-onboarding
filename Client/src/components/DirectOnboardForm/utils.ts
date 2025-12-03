export const DIRECTOR_EXECUTIVE_COUNTRIES = ['SE', 'FR'];
export const IBAN_COUNTRIES = ['SE', 'FR', 'CY', 'GR'];

export const getDefaultCurrencyForCountry = (countryCode?: string) => {
    const code = (countryCode || '').toUpperCase();
    if (code === 'SE') return 'sek';
    if (code === 'FR') return 'eur';
    if (code === 'GB' || code === 'UK') return 'gbp';
    if (code === 'JP') return 'jpy';
    if (code === 'CY') return 'eur';
    if (code === 'GR') return 'eur';
    return 'usd';
};

export const getDefaultCountry = (countryCode?: string) => {
    return countryCode || 'US';
};
