
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
            features: ['Gemini 2.5 Flash Access', '50 daily text queries', '5 image generations/mo', 'Standard processing speed', 'Community support'],
            cta: 'Start for Free'
        },
        {
            name: 'Creator',
            price: { monthly: 29, yearly: 290 },
            features: ['Gemini 2.5 Pro Access', '500 image generations/mo', '50 video generations/mo', 'Remove watermarks', 'Commercial License'],
            cta: 'Choose Creator'
        },
        {
            name: 'Pro',
            price: { monthly: 99, yearly: 990 },
            features: ['Gemini 1.5 Pro & Ultra', 'Unlimited image generations', '200 video generations/mo', 'Thinking Mode (32k tokens)', 'Early access to new features'],
            cta: 'Choose Pro',
            popular: true
        },
        {
            name: 'Studio',
            price: { monthly: 299, yearly: 2990 },
            features: ['All Pro features', 'Video Dubbing & Translation', 'Custom Voice Clones', 'API Access (1M tokens)', '3 Team Seats', 'Shared Workspace'],
            cta: 'Choose Studio'
        },
        {
            name: 'Agency',
            price: { monthly: 499, yearly: 4990 },
            features: ['All Studio features', '10 Team Seats', 'White-label Reports', 'Dedicated Account Manager', 'API Access (5M tokens)', 'SSO Integration'],
            cta: 'Choose Agency'
        },
        {
            name: 'Pay on Use',
            price: { monthly: 'Usage', yearly: 'Usage' },
            features: ['Pay per token', 'No monthly fee', 'Full API Access', 'Auto-scaling limits', 'Real-time billing dashboard'],
            cta: 'Link Payment Method'
        }
    ];

    const handleChoosePlan = (plan: Plan) => {
        setSelectedPlan(plan);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fadeIn">
            <PaymentModal 
                show={!!selectedPlan} 
                onClose={() => setSelectedPlan(null)} 
                plan={selectedPlan}
                billingCycle={billingCycle}
            />

            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                    Simple, transparent pricing
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Unlock the full potential of generative AI. Choose the plan that fits your creative workflow.
                </p>
                
                {/* Toggle */}
                <div className="flex justify-center items-center mt-8 space-x-4 select-none">
                    <span className={`text-sm font-bold cursor-pointer ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`} onClick={() => setBillingCycle('monthly')}>Monthly</span>
                    <button 
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-16 h-8 bg-slate-800 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-slate-700"
                    >
                        <div className={`w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`}></div>
                    </button>
                    <span className={`text-sm font-bold cursor-pointer ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`} onClick={() => setBillingCycle('yearly')}>
                        Yearly <span className="text-cyan-400 text-xs ml-1 font-normal">(Save 20%)</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
                {plans.map((plan, index) => (
                    <div 
                        key={plan.name} 
                        className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${plan.popular ? 'bg-slate-900/90 border-cyan-500 shadow-2xl shadow-cyan-900/30 scale-105 z-10' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                                Most Popular
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline">
                                <span className="text-4xl font-extrabold text-white">
                                    {typeof plan.price[billingCycle] === 'number' ? `$${plan.price[billingCycle]}` : plan.price[billingCycle]}
                                </span>
                                {typeof plan.price[billingCycle] === 'number' && <span className="text-slate-500 ml-2 font-medium">/mo</span>}
                            </div>
                            <p className="text-sm text-slate-400 mt-2 h-5">
                                {billingCycle === 'yearly' && typeof plan.price.monthly === 'number' ? `Billed $${(plan.price.yearly as number)} yearly` : ''}
                            </p>
                        </div>

                        <div className="h-px bg-slate-800 w-full mb-6"></div>

                        <ul className="space-y-4 mb-8 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-300">
                                    <div className={`mt-0.5 mr-3 flex-shrink-0 rounded-full p-0.5 ${plan.popular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="leading-5">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => handleChoosePlan(plan)}
                            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/40 hover:shadow-cyan-900/60' : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-cyan-400'}`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-24 border-t border-slate-800 pt-16 pb-8">
                <h3 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {[
                        { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period." },
                        { q: "What happens to my data?", a: "Your data is private. We do not use your private generations to train our public models on the Enterprise plan." },
                        { q: "Do you offer student discounts?", a: "Yes! Students with a valid .edu email can get 50% off the Creator plan. Contact support to apply." },
                        { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and Google Pay via our secure payment gateway." },
                        { q: "Can I change plans later?", a: "Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Prorated charges will apply." },
                        { q: "Is there a free trial for Pro?", a: "We offer a 7-day money-back guarantee on the Pro plan so you can try it risk-free." }
                    ].map((faq, i) => (
                        <div key={i} className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <h4 className="font-bold text-lg text-white mb-3">{faq.q}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
