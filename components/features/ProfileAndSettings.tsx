
import React, { useState } from 'react';

interface ProfileAndSettingsProps {
    onShare?: (options: any) => void;
    onSignOut?: () => void;
}

const ProfileAndSettings: React.FC<ProfileAndSettingsProps> = ({ onSignOut }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    // Verification States
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    // Toggle States
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('profile');
        setTimeout(() => {
            setLoading(null);
            showToast("Profile information updated successfully!");
        }, 1500);
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading('address');
        setTimeout(() => {
            setLoading(null);
            showToast("Address details saved!");
        }, 1500);
    };

    const handleVerify = (type: 'email' | 'phone') => {
        setLoading(`verify-${type}`);
        setTimeout(() => {
            setLoading(null);
            if (type === 'email') setEmailVerified(true);
            if (type === 'phone') setPhoneVerified(true);
            showToast(`${type === 'email' ? 'Email' : 'Phone number'} verified!`);
        }, 1500);
    };

    const handleSignOut = () => {
        setLoading('signout');
        setTimeout(() => {
            setLoading(null);
            if (onSignOut) onSignOut();
        }, 1000);
    };

    const handleDeleteAccount = () => {
        if(window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
             setLoading('delete');
             setTimeout(() => {
                setLoading(null);
                showToast("Account scheduled for deletion.", "error");
            }, 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-xl transform transition-all duration-300 z-50 flex items-center space-x-3 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* --- Profile Information --- */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Profile Information</h3>
                <p className="text-sm text-slate-400 mb-6">Manage your account information and password.</p>
                <form onSubmit={handleSaveProfile} className="divide-y divide-slate-700">
                    <div className="py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                <input type="text" id="name" defaultValue="Demo User" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 transition" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                <div className="flex items-center space-x-2">
                                    <input type="email" id="email" defaultValue="demo@example.com" className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                                    <button 
                                        type="button" 
                                        onClick={() => handleVerify('email')}
                                        disabled={emailVerified || loading === 'verify-email'}
                                        className={`text-sm font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center min-w-[100px] ${emailVerified ? 'bg-green-900/50 text-green-400 cursor-default border border-green-800' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        {loading === 'verify-email' ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : emailVerified ? (
                                            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Verified</span>
                                        ) : 'Verify'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
                                <div className="flex items-center space-x-2">
                                    <input type="tel" id="phone" placeholder="Add mobile number" className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                                    <button 
                                        type="button" 
                                        onClick={() => handleVerify('phone')}
                                        disabled={phoneVerified || loading === 'verify-phone'}
                                        className={`text-sm font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center min-w-[100px] ${phoneVerified ? 'bg-cyan-900/50 text-cyan-400 cursor-default border border-cyan-800' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                                    >
                                         {loading === 'verify-phone' ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : phoneVerified ? (
                                            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Verified</span>
                                        ) : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="py-6">
                        <h4 className="text-lg font-semibold text-slate-200 mb-4">Change Password</h4>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                                <input type="password" id="current_password" placeholder="••••••••" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                            </div>
                             <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                <input type="password" id="new_password" placeholder="••••••••" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={loading === 'profile'}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading === 'profile' && <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            <span>{loading === 'profile' ? 'Saving...' : 'Save Profile'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Address Details --- */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Address Details</h3>
                 <form onSubmit={handleSaveAddress} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label htmlFor="door_number" className="block text-sm font-medium text-slate-300 mb-2">Door/House Number</label>
                            <input type="text" id="door_number" placeholder="Apt 42" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">Street Address</label>
                            <input type="text" id="address" placeholder="123 AI Avenue" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">City</label>
                            <input type="text" id="city" placeholder="Metropolis" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                        </div>
                        <div>
                            <label htmlFor="county" className="block text-sm font-medium text-slate-300 mb-2">County</label>
                            <input type="text" id="county" placeholder="Innovation County" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                        </div>
                         <div>
                            <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-2">State / Province</label>
                            <input type="text" id="state" placeholder="CA" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                        </div>
                         <div>
                            <label htmlFor="zip" className="block text-sm font-medium text-slate-300 mb-2">ZIP / Postal Code</label>
                            <input type="text" id="zip" placeholder="90210" className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white transition" />
                        </div>
                    </div>
                     <button 
                        type="submit" 
                        disabled={loading === 'address'}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading === 'address' && <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        <span>{loading === 'address' ? 'Saving...' : 'Save Address'}</span>
                    </button>
                 </form>
            </div>

            {/* --- Application Settings --- */}
             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Application Settings</h3>
                 <div className="space-y-4 divide-y divide-slate-700">
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                         <span className="text-slate-300">Enable Email Notifications</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={emailNotifs} 
                                onChange={() => {
                                    setEmailNotifs(!emailNotifs);
                                    showToast(`Email notifications ${!emailNotifs ? 'enabled' : 'disabled'}`);
                                }}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                         </label>
                    </div>
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                         <span className="text-slate-300">Theme</span>
                         <div className="bg-slate-700 p-1 rounded-lg flex">
                            <button 
                                onClick={() => setTheme('dark')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${theme === 'dark' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white'}`}
                            >Dark</button>
                            <button 
                                onClick={() => setTheme('light')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${theme === 'light' ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white'}`}
                            >Light</button>
                         </div>
                    </div>
                     <div className="flex items-center justify-between pt-4 first:pt-0">
                         <span className="text-slate-300">Language</span>
                         <select className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500 cursor-pointer">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                         </select>
                    </div>
                 </div>
            </div>
            
            {/* --- Account Actions --- */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                 <h3 className="text-xl font-bold mb-4">Account Actions</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-slate-200">Sign Out</h4>
                            <p className="text-sm text-slate-400">You will be logged out of your account on this device.</p>
                        </div>
                         <button 
                            onClick={handleSignOut} 
                            disabled={loading === 'signout'}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading === 'signout' ? 'Signing out...' : 'Sign Out'}
                        </button>
                    </div>
                     <div className="flex items-center justify-between p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-red-400">Delete Account</h4>
                            <p className="text-sm text-slate-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        </div>
                         <button 
                            onClick={handleDeleteAccount}
                            disabled={loading === 'delete'}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading === 'delete' ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default ProfileAndSettings;
