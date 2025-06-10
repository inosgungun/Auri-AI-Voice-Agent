'use client';

import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        email: formData.email,
        password: formData.password,
        newPassword: formData.newPassword,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          {user?.username || 'Unnamed User'}
        </h1>
        <div className="h-1 w-24 mx-auto bg-blue-600 dark:bg-blue-400 rounded-full mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Welcome to your profile</p>
      </div>

      {/* Details */}
      <div className="bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-5 shadow space-y-4">
        <div>
          <p className="text-sm text-gray-400">Email</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Phone</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{user?.phone || 'Not Provided'}</p>
        </div>
        <Button
          onClick={() => setIsEditing(prev => !prev)}
          className="mt-4"
          variant={isEditing ? 'outline' : 'default'}
        >
          {isEditing ? 'Cancel' : 'Update Info'}
        </Button>
      </div>

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 dark:bg-[#1e1e1e] rounded-lg p-6 shadow space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Profile</h2>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      )}
    </div>
  );
}
