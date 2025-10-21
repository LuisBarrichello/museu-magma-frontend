import React from 'react';
import './KPICard.css';

const KPICard = ({ title, value, unit }) => {
    return (
        <div className="kpi-card">
            <h3 className="kpi-title">{title}</h3>
            <p className="kpi-value">
                {unit && <span className="kpi-unit">{unit}</span>}
                {value}
            </p>
        </div>
    );
};

export default KPICard;
