import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../lib/emailService';
import { Button, Spinner, Label, TextInput } from 'flowbite-react';
import { toast } from 'react-toastify';

export function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      // Update the user's password
      await updatePassword(password);

      toast.success('Password updated successfully');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Password</h1>
        <p className="text-gray-600 mb-6 text-center">
          Please enter your new password below.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="New Password" />
            </div>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your new password"
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value="Confirm Password" />
            </div>
            <TextInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
            />
          </div>

          <Button
            type="submit"
            color="blue"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Set New Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 