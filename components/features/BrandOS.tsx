
import React, { useState } from 'react';
import MarketingAssistant from './MarketingAssistant';
import BrandKit from './BrandKit';
import StrandsGenerator from './StrandsGenerator';
import TrafficBooster from './TrafficBooster';
import AiTrafficBooster from './AiTrafficBooster';
import AutomationHub from './AutomationHub';
import TrendForecaster from './TrendForecaster';

interface BrandOSProps {
    onShare: (options: any) => void;
}

const BrandOS: React.FC<BrandOSProps> = ({ onShare }) => {
    const [activeTab, setActiveTab] = useState<'marketing' | 'brand' | 'strands' | 'traffic' | 'strategy' | 'auto' | 'trend'>('marketing');

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 overflow-x-auto max-w-full scrollbar-hide">
                    <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'marketing' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Assistant</button>
                    <button onClick={() => setActiveTab('brand')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'brand' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Brand Kit</button>
                    <button onClick={() => setActiveTab('strands')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'strands' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Identity</button>
                    <button onClick={() => setActiveTab('traffic')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'traffic' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Traffic</button>
                    <button onClick={() => setActiveTab('strategy')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'strategy' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Strategy</button>
                    <button onClick={() => setActiveTab('auto')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'auto' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Automations</button>
                    <button onClick={() => setActiveTab('trend')} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'trend' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Trends</button>
                </div>
            </div>
            
            <div className="flex-grow">
                {activeTab === 'marketing' && <MarketingAssistant onShare={onShare} />}
                {activeTab === 'brand' && <BrandKit onShare={onShare} />}
                {activeTab === 'strands' && <StrandsGenerator onShare={onShare} />}
                {activeTab === 'traffic' && <TrafficBooster onShare={onShare} />}
                {activeTab === 'strategy' && <AiTrafficBooster onShare={onShare} />}
                {activeTab === 'auto' && <AutomationHub onShare={onShare} />}
                {activeTab === 'trend' && <TrendForecaster onShare={onShare} />}
            </div>
        </div>
    );
};

export default BrandOS;
