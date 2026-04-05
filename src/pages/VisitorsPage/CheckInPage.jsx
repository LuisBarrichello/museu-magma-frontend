import React, { useState } from 'react';
import apiClient from '../../services/api';
import Spinner from '../../components/common/Spinner/Spinner';
import './VisitorsPage.css';

const CheckInPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        visitor_type: 'INDIVIDUAL',
        email: '',
        phone: '',
        notes: '',
    });

    const [qrCode, setQrCode] = useState(null);
    const [ticketCode, setTicketCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setQrCode(null);

        try {
            const response = await apiClient.post('/visits/check-in/', {
                name: formData.name,
                document: formData.document,
                visitor_type: formData.visitor_type,
                email: formData.email,
                phone: formData.phone,
                notes: formData.notes,
            });

            // O back-end retorna o QR Code em base64 e o ticket_code
            setQrCode(response.data.qr_code_base64);
            setTicketCode(response.data.ticket_code);

        } catch (err) {
            setError('Erro ao registrar entrada. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleNovoVisitante = () => {
        setFormData({
            name: '',
            document: '',
            visitor_type: 'INDIVIDUAL',
            email: '',
            phone: '',
            notes: '',
        });
        setQrCode(null);
        setTicketCode(null);
        setError(null);
    };

    return (
        <div className="visitors-page">
            <header className="page-header">
                <h1>Check-in de Visitante</h1>
            </header>

            <div className="checkin-container">

                {/* FORMULÁRIO */}
                {!qrCode && (
                    <div className="form-card">
                        <h2>Dados do Visitante</h2>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="checkin-form">

                            <div className="form-group">
                                <label htmlFor="name">Nome completo *</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Ex: João da Silva"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="document">Documento (CPF ou RG) *</label>
                                <input
                                    id="document"
                                    name="document"
                                    type="text"
                                    placeholder="Ex: 123.456.789-00"
                                    value={formData.document}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Telefone *</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="Ex: (11) 99999-9999"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitor_type">Tipo de visita</label>
                                <select
                                    id="visitor_type"
                                    name="visitor_type"
                                    value={formData.visitor_type}
                                    onChange={handleChange}
                                >
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="GROUP">Grupo Escolar</option>
                                    <option value="SCHOOL">Tour Guiado</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">E-mail (opcional)</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Ex: joao@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Observações (opcional)</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Informações adicionais..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? <Spinner /> : 'Registrar Entrada'}
                            </button>

                        </form>
                    </div>
                )}

                {/* QR CODE após registro bem-sucedido */}
                {qrCode && (
                    <div className="qrcode-card">
                        <div className="success-icon">✅</div>
                        <h2>Entrada Registrada!</h2>
                        <p>Apresente o QR Code abaixo na saída do museu.</p>

                        <div className="qrcode-wrapper">
                            <img
                                src={`data:image/png;base64,${qrCode}`}
                                alt="QR Code da visita"
                                className="qrcode-img"
                            />
                        </div>

                        <div className="ticket-code">
                            <span>Código do ticket:</span>
                            <strong>{ticketCode}</strong>
                        </div>

                        <button className="btn-secondary" onClick={handleNovoVisitante}>
                            Registrar Novo Visitante
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CheckInPage;