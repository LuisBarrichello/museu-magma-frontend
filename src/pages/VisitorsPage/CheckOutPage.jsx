import React, { useState } from 'react';
import apiClient from '../../services/api';
import './VisitorsPage.css';

const CheckOutPage = () => {
    const [ticketCode, setTicketCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [visitInfo, setVisitInfo] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await apiClient.post('/visits/check-out/', {
                ticket_code: ticketCode,
            });

            setVisitInfo(response.data);
            setSuccess(true);

        } catch (err) {
            if (err.response?.status === 404) {
                setError('Ticket não encontrado. Verifique o código e tente novamente.');
            } else if (err.response?.status === 400) {
                setError('Saída já foi registrada para este ticket.');
            } else {
                setError('Erro ao registrar saída. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNovo = () => {
        setTicketCode('');
        setSuccess(false);
        setVisitInfo(null);
        setError(null);
    };

    return (
        <div className="visitors-page">
            <header className="page-header">
                <h1>Check-out de Visitante</h1>
            </header>

            <div className="checkin-container">
                <div className="form-card">

                    {/* TELA DE SUCESSO */}
                    {success ? (
                        <div className="checkout-success">
                            <div className="success-icon">✅</div>
                            <h2>Saída Registrada!</h2>

                            {/* Mostra informações da visita se o back-end retornar */}
                            {visitInfo && (
                                <div className="visit-summary">
                                    <div className="summary-row">
                                        <span>Ticket:</span>
                                        <strong>{ticketCode}</strong>
                                    </div>
                                    {visitInfo.visitor_name && (
                                        <div className="summary-row">
                                            <span>Visitante:</span>
                                            <strong>{visitInfo.visitor_name}</strong>
                                        </div>
                                    )}
                                    {visitInfo.check_in_at && visitInfo.check_out_at && (
                                        <div className="summary-row">
                                            <span>Duração:</span>
                                            <strong>
                                                {Math.round(
                                                    (new Date(visitInfo.check_out_at) - new Date(visitInfo.check_in_at)) / 60000
                                                )} min
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button className="btn-secondary" onClick={handleNovo}>
                                Registrar Outra Saída
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2>Registrar Saída</h2>
                            <p className="form-description">
                                Digite o código do ticket gerado no check-in.
                            </p>

                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleSubmit} className="checkin-form">
                                <div className="form-group">
                                    <label htmlFor="ticketCode">Código do Ticket *</label>
                                    <input
                                        id="ticketCode"
                                        name="ticketCode"
                                        type="text"
                                        placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                                        value={ticketCode}
                                        onChange={(e) => setTicketCode(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading || !ticketCode}
                                >
                                    {loading ? 'Registrando...' : 'Registrar Saída'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckOutPage;