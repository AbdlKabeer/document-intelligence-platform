'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Building, Users, Lock, Check, X, Loader2 } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [accountType, setAccountType] = useState('individual');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    employees: ''
  });

  // Password strength criteria - moved outside component state
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false,
    capital: false
  });

  // Email validation pattern - moved outside component
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Memoized password strength calculation
  const calculatePasswordStrength = useCallback((password) => {
    const criteria = {
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      capital: /[A-Z]/.test(password)
    };
    return Object.values(criteria).filter(Boolean).length;
  }, []);

  // Update password criteria when password changes
  useEffect(() => {
    const criteria = {
      length: formData.password.length >= 8,
      number: /\d/.test(formData.password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      capital: /[A-Z]/.test(formData.password)
    };
    setPasswordCriteria(criteria);
  }, [formData.password]);

  const getPasswordStrengthColor = useCallback((strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  }, []);

  // Memoized employee count validation
  const validateEmployeeCount = useCallback((count) => {
    const num = parseInt(count);
    return num >= 1 && num <= 1000000;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const passwordStrength = calculatePasswordStrength(formData.password);
    if (passwordStrength < 3) {
      setError('Please create a stronger password');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (accountType === 'company') {
      if (!formData.companyName.trim()) {
        setError('Please enter a company name');
        return;
      }
      if (!validateEmployeeCount(formData.employees)) {
        setError('Please enter a valid number of employees (1-1,000,000)');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create a new object for the request body
      const requestBody = {
        ...formData,
        accountType,
        companyName: accountType === 'individual' ? null : formData.companyName || null, // set to null if individual
        employees: accountType === 'individual' ? null : formData.employees || null // set to null if individual
      };

      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        router.push('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized PasswordCriteriaItem component
  const PasswordCriteriaItem = useCallback(({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-red-500" />
      )}
      <span className={met ? 'text-green-700' : 'text-red-700'}>
        {text}
      </span>
    </div>
  ), []);

  // Handle form field changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  return (
    <div className="min-h-screen bg-green-50/40 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">Register</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-4">
            <button
              type="button"
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                accountType === 'individual' 
                  ? 'bg-amber-100 text-stone-700' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setAccountType('individual')}
            >
              Individual
            </button>
            <button
              type="button"
              disabled={isLoading}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                accountType === 'company' 
                  ? 'bg-amber-100 text-stone-700' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => setAccountType('company')}
            >
              Company
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-600 mb-1">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  name="firstName"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 focus:outline-none"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-600 mb-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  name="lastName"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 focus:outline-none"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 focus:outline-none"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                required
                disabled={isLoading}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 focus:outline-none"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Choose a password"
              />
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    getPasswordStrengthColor(calculatePasswordStrength(formData.password))
                  }`}
                  style={{ width: `${(calculatePasswordStrength(formData.password) / 4) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <PasswordCriteriaItem met={passwordCriteria.length} text="At least 8 characters" />
                <PasswordCriteriaItem met={passwordCriteria.number} text="Contains a number" />
                <PasswordCriteriaItem met={passwordCriteria.capital} text="Contains uppercase" />
                <PasswordCriteriaItem met={passwordCriteria.special} text="Contains special char" />
              </div>
            </div>
          </div>

          {accountType === 'company' && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                  <input
                    type="text"
                    name="companyName"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 focus:outline-none"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Number of Employees</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                  <input
                    type="number"
                    name="employees"
                    required
                    min="1"
                    max="1000000"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 disabled:opacity-50 focus:outline-none"
                    value={formData.employees}
                    onChange={handleInputChange}
                    placeholder="Enter number of employees"
                  />
                </div>
                <p className="mt-1 text-xs text-stone-500">Enter a number between 1 and 1,000,000</p>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              disabled={isLoading}
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="terms" className="text-sm text-stone-600">
              I accept the{' '}
              <button
                type="button"
                onClick={() => window.open('/terms', '_blank')}
                className="text-amber-600 hover:text-amber-700 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-200 rounded"
              >
                terms and conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !acceptedTerms}
            className="w-full bg-amber-100 text-stone-600 py-2 rounded-lg hover:bg-amber-200 transition-colors focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>

          <p className="text-center text-sm text-stone-600">
            Already have an account?{' '}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => router.push('/login')}
              className="text-amber-600 hover:text-amber-700 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-200 rounded disabled:opacity-50"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}