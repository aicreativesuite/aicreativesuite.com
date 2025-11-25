

import React, { useState } from 'react';
import PaymentModal from '../common/PaymentModal';
import { Plan } from '../../constants';

interface PricingProps {
    onShare?: (options: any) => void;
}

const Pricing: React.FC<PricingProps> = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const plans: Plan[] = [
        {
            name: 'Hobbyist',
            price: { monthly: 'Free', yearly: 'Free' },
            features: ['Basic AI models', '5 image generations/mo', '1 video generation/mo', 'Community support'],
            cta: 'Start for Free'
        },
        {
            name: 'Creator',
            price: { monthly: 29, yearly: 290 },
            features: ['Standard AI models', '100 image generations/mo', '10 video generations/mo', 'Basic email support'],
            cta: 'Choose Creator'
        },
        {
            name: 'Startup',
            price: { monthly: 79, yearly: 790 },
            features: ['Standard AI models', '250 image generations/mo', '25 video generations/mo', 'Priority email support', 'Marketing Assistant'],
            cta: 'Choose Startup'
        },
        {
            name: 'Pro',
            price: { monthly: 149, yearly: 1490 },
            features: ['Advanced AI models', '500 image generations/mo', '50 video generations/mo', 'Priority chat support', 'Thinking Mode access'],
            cta: 'Choose Pro',
            popular: true
        },
        {
            name: 'Studio',
            price: { monthly: 299, yearly: 2990 },
            features: ['All Pro features', 'Unlimited generations', '2 Team Seats', 'Sound Studio Pro', 'API access'],
            cta: 'Choose Studio'
        },
        {
            name: 'Enterprise',
            price: { monthly: 'Pay on Use', yearly: 'Pay on Use' },
            features: ['All Studio features', 'Dedicated agent', 'Custom model training', 'Integrated Payment Gateway', 'Link Credit/Debit Card'],
            cta: 'Link Payment Method'
        }
    ];
    
    const handleChoosePlan = (plan: Plan) => {
        setSelectedPlan(plan);
    }

    return (
        <div className="max-w-7xl mx-auto text-center">
            <PaymentModal 
                show={!!selectedPlan} 
                onClose={() => setSelectedPlan(null)} 
                plan={selectedPlan}
                billingCycle={billingCycle}
            />

            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-slate-400 mb-8">Select the perfect plan for your creative needs. Enterprise options now support flexible pay-on-use billing.</p>
            
            <div className="flex justify-center items-center space-x-4 mb-10">
                <span className={billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}>Monthly</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" onChange={() => setBillingCycle(p => p === 'monthly' ? 'yearly' : 'monthly')} />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
                <span className={billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}>
                    Yearly <span className="text-xs text-cyan-400">(Save 2 months)</span>
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <div key={plan.name} className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border ${plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-700'} flex flex-col`}>
                        {plan.popular && (
                            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                <span className="bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">Most Popular</span>
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="mb-6 min-h-[64px] flex items-center justify-center">
                            { (typeof plan.price[billingCycle] === 'number' || plan.price[billingCycle] === 'Free') ? (
                                <p className="text-4xl font-extrabold text-white">
                                    {plan.price[billingCycle] === 'Free' ? 'Free' : `$${plan.price[billingCycle]}`}
                                    {plan.price[billingCycle] !== 'Free' && <span className="text-base font-medium text-slate-400">/mo</span>}
                                </p>
                            ) : (
                                <p className="text-3xl font-extrabold text-white">{plan.price[billingCycle]}</p>
                            )}
                        </div>
                        <ul className="text-left space-y-3 text-slate-300 flex-grow mb-8">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start">
                                    <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => handleChoosePlan(plan)}
                            className="w-full py-3 px-4 rounded-lg font-bold text-white transition-colors duration-300 bg-cyan-500 hover:bg-cyan-600"
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
             <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700 inline-block">
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Integrated Payment Gateway supports Visa, Mastercard, Amex, and corporate cards.</span>
                </div>
             </div>
        </div>
    );
};

export default Pricing;
