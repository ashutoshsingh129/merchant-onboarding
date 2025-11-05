import React from 'react';
import { DirectOnboardFormProps } from './types';
import USAForm from './USA';
import SwedenForm from './Sweden';
import FranceForm from './France';
import UKForm from './UK';

const DirectOnboardFormRouter: React.FC<DirectOnboardFormProps> = props => {
    const country = (props.country || 'US').toUpperCase();

    switch (country) {
        case 'SE':
            return <SwedenForm {...props} />;
        case 'FR':
            return <FranceForm {...props} />;
        case 'GB':
        case 'UK':
            return <UKForm {...props} />;
        case 'US':
        default:
            return <USAForm {...props} />;
    }
};

export default DirectOnboardFormRouter;
