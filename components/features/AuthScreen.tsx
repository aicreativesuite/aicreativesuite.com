
import React, { useState } from 'react';
import Loader from '../common/Loader';
import { COUNTRY_CODES } from '../../constants';

interface AuthScreenProps {
    onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [method, setMethod] = useState<'email' | 'mobile'>('email');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].dial_code);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState<string | null>(null);

    const handleSocialLogin = (provider: string) => {
        if (loading || socialLoading) return;
        setSocialLoading(provider);
        setError(null);
        setTimeout(() => {
            setSocialLoading(null);
            onLogin();
        }, 1500);
    };

    const handleEmailAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || (isRegistering && !name)) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        setError(null);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 1500);
    };

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || mobile.length < 5) {
            setError("Please enter a valid mobile number.");
            return;
        }
        setLoading(true);
        setError(null);
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1000);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.join('').length !== 4) {
            setError("Please enter the 4-digit code.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin();
        }, 1500);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-slate-800/20 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>

            <div className="relative z-10 w-full max-w-md p-4">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-8 pb-0 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6">
                            <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.75 2.06733L16.2045 9.42933L22.929 10.3958L17.8395 15.3443L19.0215 22.0403L12.75 18.2143L6.4785 22.0403L7.6605 15.3443L2.571 10.3958L9.2955 9.42933L12.75 2.06733ZM12.75 5.51133L10.6695 9.89733L5.9445 10.6013L9.348 13.9103L8.514 18.6053L12.75 16.1463L16.986 18.6053L16.152 13.9103L19.5555 10.6013L14.8305 9.89733L12.75 5.51133Z"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
                        <p className="text-slate-400 text-sm">{isRegistering ? 'Join the AI Creative Suite today' : 'Sign in to access your Creative Suite'}</p>
                    </div>

                    {/* Method Tabs */}
                    <div className="flex p-6 pb-0 gap-4">
                        <button 
                            onClick={() => { setMethod('email'); setStep('input'); setError(null); }}
                            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${method === 'email' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            Email
                        </button>
                        <button 
                            onClick={() => { setMethod('mobile'); setStep('input'); setError(null); }}
                            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${method === 'mobile' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            Mobile
                        </button>
                    </div>

                    <div className="p-8 pt-6">
                        {/* Email Form */}
                        {method === 'email' && (
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {isRegistering && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                        placeholder="name@example.com"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase">Password</label>
                                        {!isRegistering && <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300">Forgot?</button>}
                                    </div>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20 flex justify-center">
                                    {loading ? <Loader /> : (isRegistering ? 'Create Account' : 'Sign In')}
                                </button>
                            </form>
                        )}

                        {/* Mobile Form */}
                        {method === 'mobile' && (
                            <form onSubmit={step === 'input' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                                {step === 'input' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mobile Number</label>
                                        <div className="flex gap-3">
                                            <select 
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none w-28 text-center appearance-none cursor-pointer"
                                            >
                                                {COUNTRY_CODES.map((c) => (
                                                    <option key={c.code} value={c.dial_code}>
                                                        {c.flag} {c.dial_code}
                                                    </option>
                                                ))}
                                            </select>
                                            <input 
                                                type="tel" 
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                className="flex-grow bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                                placeholder="555-0123"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm text-slate-300 mb-4">Enter the code sent to <span className="text-cyan-400">{countryCode} {mobile}</span></p>
                                        <div className="flex justify-center gap-3 mb-6">
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    id={`otp-${idx}`}
                                                    type="text"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                                                />
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => setStep('input')} className="text-xs text-slate-500 hover:text-white mb-4">Change Number</button>
                                    </div>
                                )}
                                
                                <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-900/20 flex justify-center">
                                    {loading ? <Loader /> : (step === 'input' ? 'Send Verification Code' : 'Verify & Sign In')}
                                </button>
                            </form>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center animate-fadeIn">
                                {error}
                            </div>
                        )}

                        {/* Social Divider */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="h-px bg-slate-800 flex-grow"></div>
                            <span className="text-xs text-slate-500 uppercase font-bold">Or continue with</span>
                            <div className="h-px bg-slate-800 flex-grow"></div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                type="button"
                                disabled={loading || !!socialLoading}
                                onClick={() => handleSocialLogin('google')} 
                                className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-3 rounded-xl transition flex justify-center items-center ${socialLoading === 'google' ? 'ring-2 ring-cyan-500' : ''}`}
                            >
                                {socialLoading === 'google' ? <Loader /> : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                                )}
                            </button>
                            <button 
                                type="button"
                                disabled={loading || !!socialLoading}
                                onClick={() => handleSocialLogin('twitter')} 
                                className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-3 rounded-xl transition flex justify-center items-center ${socialLoading === 'twitter' ? 'ring-2 ring-cyan-500' : ''}`}
                            >
                                {socialLoading === 'twitter' ? <Loader /> : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                )}
                            </button>
                            <button 
                                type="button"
                                disabled={loading || !!socialLoading}
                                onClick={() => handleSocialLogin('github')} 
                                className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-3 rounded-xl transition flex justify-center items-center ${socialLoading === 'github' ? 'ring-2 ring-cyan-500' : ''}`}
                            >
                                {socialLoading === 'github' ? <Loader /> : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-400">
                                {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
                                <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="text-cyan-400 font-bold hover:text-cyan-300 ml-1 underline decoration-2 underline-offset-2">
                                    {isRegistering ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <p className="text-center text-[10px] text-slate-600 mt-8">
                    &copy; 2024 AI Creative Suite. Secure Login.
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
