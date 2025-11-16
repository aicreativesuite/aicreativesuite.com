import React, { useState, useEffect } from 'react';
import { Plan } from '../../constants';
import Loader from './Loader';

interface PaymentModalProps {
    show: boolean;
    onClose: () => void;
    plan: Plan | null;
    billingCycle: 'monthly' | 'yearly';
}

const PaymentModal: React.FC<PaymentModalProps> = ({ show, onClose, plan, billingCycle }) => {
    const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvc: '' });
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Reset state when modal is opened for a new plan
        if (show) {
            setCardDetails({ name: '', number: '', expiry: '', cvc: '' });
            setError('');
            setProcessing(false);
            setSuccess(false);
        }
    }, [show]);

    if (!show || !plan) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        }
        if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }
        setCardDetails(prev => ({ ...prev, [name]: formattedValue.slice(0, name === 'number' ? 19 : (name === 'expiry' ? 5 : 40)) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
            setError('Please fill out all card details.');
            return;
        }
        setError('');
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
        }, 2000);
    };
    
    const handleFreeSubmit = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
        }, 1000);
    };

    const price = plan.price[billingCycle];
    const displayPrice = price === 'Free' ? '$0' : (typeof price === 'number' ? `$${price}` : 'Custom');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl shadow-cyan-500/10 transform transition-all" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {success ? (
                    <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-2xl font-bold text-white mb-2">Subscription Active!</h2>
                        <p className="text-slate-400 mb-6">Welcome to the {plan.name} plan. You can now access your new features.</p>
                        <button onClick={onClose} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition-colors">Get Started</button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-2">{price === 'Free' ? 'Start with' : 'Upgrade to'} {plan.name}</h2>
                        <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">{plan.name} ({billingCycle})</span>
                                <span className="font-bold text-white text-lg">{displayPrice}{typeof price === 'number' && '/mo'}</span>
                            </div>
                        </div>

                        {price === 'Free' ? (
                             <div className="text-center">
                                 <p className="text-slate-400 mb-6">You are about to start your free Hobbyist plan. No payment details required.</p>
                                 <button
                                    type="button"
                                    onClick={handleFreeSubmit}
                                    disabled={processing}
                                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {processing ? <Loader /> : 'Get Started'}
                                </button>
                             </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                                    <input type="text" id="name" name="name" value={cardDetails.name} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="Demo User" />
                                </div>
                                <div>
                                    <label htmlFor="number" className="block text-sm font-medium text-slate-300 mb-2">Card Details</label>
                                    <div className="relative">
                                        <input type="text" id="number" name="number" value={cardDetails.number} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="0000 0000 0000 0000" />
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="w-1/2">
                                        <label htmlFor="expiry" className="block text-sm font-medium text-slate-300 mb-2">Expiry</label>
                                        <input type="text" id="expiry" name="expiry" value={cardDetails.expiry} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="MM/YY" />
                                    </div>
                                    <div className="w-1/2">
                                        <label htmlFor="cvc" className="block text-sm font-medium text-slate-300 mb-2">CVC</label>
                                        <input type="text" id="cvc" name="cvc" value={cardDetails.cvc} onChange={handleInputChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500" placeholder="123" />
                                    </div>
                                </div>
                                {error && <p className="text-red-400 text-sm">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {processing ? <Loader /> : `Pay ${displayPrice}`}
                                </button>
                                <div className="text-xs text-slate-500 text-center space-y-2 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center justify-center space-x-2 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Secure Payment Gateway</span>
                                    </div>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;