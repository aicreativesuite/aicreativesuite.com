
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
            name: 'Starter',
            price: { monthly: 'Free', yearly: 'Free' },
            features: [
                'Access to ImageOS & ScriptOS',
                'Gemini 2.5 Flash Model',
                '10 Image Generations / mo',
                '5 Video Previews (Low Res)',
                'Standard Support',
                'Public Community Access'
            ],
            cta: 'Start Creating'
        },
        {
            name: 'Creator',
            price: { monthly: 29, yearly: 290 },
            features: [
                'Everything in Starter',
                'Unlock AudioOS & VideoOS',
                'Unlimited Script & Text Gen',
                '500 Image Generations / mo',
                '50 High-Res Video Clips (Veo)',
                'Commercial Usage Rights',
                'Priority Processing'
            ],
            cta: 'Join as Creator',
            popular: true
        },
        {
            name: 'Pro Suite',
            price: { monthly: 99, yearly: 990 },
            features: [
                'Everything in Creator',
                'Access to CodeOS & BrandOS',
                'Gemini 1.5 Pro & Ultra Models',
                'Unlimited Image & Audio',
                '200 High-Res Video Clips',
                'Long-form Video Generation',
                'API Access (100k tokens)'
            ],
            cta: 'Go Pro'
        },
        {
            name: 'Agency',
            price: { monthly: 499, yearly: 4990 },
            features: [
                'Everything in Pro Suite',
                '10 Team Seats included',
                'Whitelabel Reports & Portals',
                'Unlimited Brand Kits',
                'Dedicated Success Manager',
                'API Access (5M tokens)',
                'SSO & Advanced Security'
            ],
            cta: 'Contact Sales'
        }
    ];

    const handleChoosePlan = (plan: Plan) => {
        setSelectedPlan(plan);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fadeIn h-full overflow-y-auto custom-scrollbar">
            <PaymentModal 
                show={!!selectedPlan} 
                onClose={() => setSelectedPlan(null)} 
                plan={selectedPlan}
                billingCycle={billingCycle}
            />

            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                    Power your creativity
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Choose the perfect engine for your workflow. From hobbyists to full-scale production studios.
                </p>
                
                {/* Toggle */}
                <div className="flex justify-center items-center mt-8 space-x-4 select-none">
                    <span className={`text-sm font-bold cursor-pointer transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`} onClick={() => setBillingCycle('monthly')}>Monthly</span>
                    <button 
                        onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-16 h-8 bg-slate-800 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-slate-700 hover:border-slate-600"
                    >
                        <div className={`w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`}></div>
                    </button>
                    <span className={`text-sm font-bold cursor-pointer transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`} onClick={() => setBillingCycle('yearly')}>
                        Yearly <span className="text-cyan-400 text-xs ml-1 font-normal bg-cyan-900/30 px-2 py-0.5 rounded-full border border-cyan-800">(2 Months Free)</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                {plans.map((plan, index) => (
                    <div 
                        key={plan.name} 
                        className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 h-full ${plan.popular ? 'bg-slate-900/80 border-cyan-500 shadow-2xl shadow-cyan-900/20 scale-105 z-10' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg tracking-wide uppercase">
                                Recommended
                            </div>
                        )}
                        
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-extrabold text-white">
                                    {typeof plan.price[billingCycle] === 'number' ? `$${plan.price[billingCycle]}` : plan.price[billingCycle]}
                                </span>
                                {typeof plan.price[billingCycle] === 'number' && <span className="text-slate-500 ml-1 text-sm font-medium">/mo</span>}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 h-4">
                                {billingCycle === 'yearly' && typeof plan.price.monthly === 'number' ? `Billed $${(plan.price.yearly as number)} yearly` : ''}
                            </p>
                        </div>

                        <div className="h-px bg-slate-800 w-full mb-6"></div>

                        <ul className="space-y-3 mb-8 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start text-xs text-slate-300">
                                    <div className={`mt-0.5 mr-2 flex-shrink-0 rounded-full p-0.5 ${plan.popular ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
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
                            className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/40 hover:shadow-cyan-900/60' : 'bg-slate-800 hover:bg-slate-700 text-white hover:text-cyan-400 border border-slate-700'}`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            {/* Enterprise / Custom Section */}
            <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col md:flex-row items-center justify-between shadow-xl">
                <div className="mb-6 md:mb-0 md:mr-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Need a custom solution?</h3>
                    <p className="text-slate-400">For large organizations requiring SSO, on-premise deployment, or custom model fine-tuning.</p>
                </div>
                <button className="bg-white text-slate-900 font-bold py-3 px-8 rounded-xl hover:bg-slate-200 transition-colors whitespace-nowrap">
                    Contact Enterprise Sales
                </button>
            </div>

            <div className="mt-16 border-t border-slate-800 pt-12 pb-8">
                <h3 className="text-2xl font-bold text-white text-center mb-10">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {[
                        { q: "What models do you use?", a: "We leverage Google's latest Gemini models (Flash, Pro, Ultra) and Veo for video, alongside specialized fine-tuned layers for specific tasks like coding and branding." },
                        { q: "Can I use generated content commercially?", a: "Yes! Creator plans and above include full commercial rights for all assets generated within the platform." },
                        { q: "How does the 'VideoOS' credit system work?", a: "Video generation is compute-intensive. Credits refresh monthly. Unused credits rollover on Pro and Agency plans." },
                        { q: "Is my data private?", a: "Absolutely. We adhere to strict enterprise-grade security standards. Your inputs and outputs are isolated and never used to train public models without explicit consent." },
                        { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing cycle." },
                        { q: "Do you offer API access?", a: "Yes, API access is available on Pro Suite and Agency plans, allowing you to integrate our engines into your own applications." }
                    ].map((faq, i) => (
                        <div key={i} className="bg-slate-900/30 p-5 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                            <h4 className="font-bold text-sm text-white mb-2">{faq.q}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
