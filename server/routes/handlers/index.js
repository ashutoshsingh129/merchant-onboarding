/**
 * Router to route direct-onboard requests to country-specific handlers
 */
const USAHandler = require('./USA');
const SwedenHandler = require('./Sweden');
const FranceHandler = require('./France');

const getHandler = (countryCode) => {
  const country = (countryCode || 'US').toUpperCase();
  
  switch (country) {
    case 'SE':
      return new SwedenHandler();
    case 'FR':
      return new FranceHandler();
    case 'US':
    default:
      return new USAHandler();
  }
};

const routeDirectOnboard = async (stripe, accountId, reqBody, reqIp) => {
  // Determine country from company_address_country or individual_address_country
  const country = reqBody.company_address_country || 
                  reqBody.individual_address_country || 
                  reqBody.external_account_country || 
                  'US';
  
  const handler = getHandler(country);
  return await handler.handleDirectOnboard(stripe, accountId, reqBody, reqIp);
};

module.exports = {
  routeDirectOnboard,
  getHandler,
};

