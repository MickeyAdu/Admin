import React from 'react';

interface Props {
    color: 'blue' | 'red' | 'yellow'; // Define possible colors
}

const colorClasses: Record<Props['color'], string> = {
    blue: 'bg-blue-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
};

const FuelBox: React.FC<Props> = ({ color }) => {
    const bgColorClass = colorClasses[color];

    return (
        <div className={`w-12 h-30 ${bgColorClass}`}>
            
        </div>
    );
};

export default FuelBox;
