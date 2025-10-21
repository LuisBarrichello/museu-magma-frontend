import React from 'react';
import PropTypes from 'prop-types';
import './DetailsModal.css';

const DetailsModal = ({ isOpen, onClose, title, data, config }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content details-modal"
                onClick={(e) => e.stopPropagation()}>
                <div className="details-modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-btn">
                        &times;
                    </button>
                </div>
                <div className="details-modal-body">
                    {config.map((item) => (
                        <div className="detail-item" key={item.key}>
                            <span className="detail-label">{item.label}:</span>
                            <span className="detail-value">
                                {item.format
                                    ? item.format(data[item.key], data)
                                    : data[item.key]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

DetailsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    data: PropTypes.object,
    config: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            format: PropTypes.func,
        }),
    ).isRequired,
};

export default DetailsModal;