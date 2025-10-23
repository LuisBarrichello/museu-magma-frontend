import React from 'react';
import PropTypes from 'prop-types';
import './DetailsModal.css';

const DetailsModal = ({ isOpen, onClose, title, data, config }) => {
    if (!isOpen || !data) return null;

    const calculateSubtotal = (item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return (quantity * unitPrice).toFixed(2);
    };

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
                                    : data[item.key] ?? 'N/A'}
                            </span>
                        </div>
                    ))}
                    {data &&
                        Array.isArray(data.items) &&
                        data.items.length > 0 && (
                            <div className="sale-items-section">
                                <h3 className="items-title">Itens da Venda:</h3>
                                <ul className="items-list">
                                    {data.items.map((saleItem) => (
                                        <li
                                            key={saleItem.id}
                                            className="sale-item">
                                            <span className="item-name">
                                                {saleItem.product_name}
                                            </span>
                                            <span className="item-details">
                                                {`${saleItem.quantity} x R$ ${saleItem.unit_price} = `}
                                                <strong>
                                                    R$
                                                    {calculateSubtotal(
                                                        saleItem,
                                                    )}
                                                </strong>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
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