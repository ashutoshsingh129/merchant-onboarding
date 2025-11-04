import React from 'react';
import { DirectOnboardFormProps } from './types';
import USAForm from './USA';
import SwedenForm from './Sweden';
import FranceForm from './France';

const DirectOnboardFormRouter: React.FC<DirectOnboardFormProps> = props => {
    const country = (props.country || 'US').toUpperCase();

    switch (country) {
        case 'SE':
            return <SwedenForm {...props} />;
        case 'FR':
            return <FranceForm {...props} />;
        case 'US':
        default:
            return <USAForm {...props} />;
    }
};

export default DirectOnboardFormRouter;
