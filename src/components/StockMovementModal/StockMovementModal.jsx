import React, { useState } from 'react';
import './StockMovementModal.css';

const StockMovementModal = ({ isOpen, onClose, onSave, product }) => {
    const [quantityChange, setQuantityChange] = useState('');
    const [notes, setNotes] = useState('');
    const [movementType, setMovementType] = useState('ENTRY'); // ENTRY para entrada, ADJUST para saída

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalQuantity =
            movementType === 'ENTRY'
                ? parseFloat(quantityChange)
                : -Math.abs(parseFloat(quantityChange));

        onSave(product.id, { quantity_change: finalQuantity, notes });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Movimentar Estoque: {product.name}</h2>
                <p>
                    Estoque Atual: <strong>{product.quantity}</strong>
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tipo de Movimentação</label>
                        <select
                            value={movementType}
                            onChange={(e) => setMovementType(e.target.value)}>
                            <option value="ENTRY">Entrada (Aumentar)</option>
                            <option value="ADJUST">
                                Saída/Ajuste (Diminuir)
                            </option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="quantityChange">Quantidade</label>
                        <input
                            type="number"
                            id="quantityChange"
                            value={quantityChange}
                            onChange={(e) => setQuantityChange(e.target.value)}
                            required
                            min="0.01"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notes">Motivo / Observação</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            placeholder="Ex: Recebimento de nova remessa do fornecedor X"></textarea>
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save">
                            Registrar Movimentação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockMovementModal;
