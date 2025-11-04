export const DIRECTOR_EXECUTIVE_COUNTRIES = ['SE', 'FR'];
export const IBAN_COUNTRIES = ['SE', 'FR'];

export const getDefaultCurrencyForCountry = (countryCode?: string) => {
    const code = (countryCode || '').toUpperCase();
    if (code === 'SE') return 'sek';
    if (code === 'FR') return 'eur';
    return 'usd';
};

export const getDefaultCountry = (countryCode?: string) => {
    return countryCode || 'US';
};
