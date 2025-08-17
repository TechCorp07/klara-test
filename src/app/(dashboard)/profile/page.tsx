// src/app/(dashboard)/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormButton, FormAlert } from '@/components/ui/common';
import { Spinner } from '@/components/ui/spinner';
import { User, Camera, Mail, Phone, MapPin, Calendar, Shield, Upload, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { getImageUrl } from '@/lib/utils/image';

// Profile validation schema
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUserProfileImage } = useAuth();
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'general';
  
  const [activeSection, setActiveSection] = useState(section);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [formJustUpdated, setFormJustUpdated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Load user data into form
  useEffect(() => {
    if (user && !formJustUpdated) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zip_code: user.zip_code || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        emergency_contact_relationship: user.emergency_contact_relationship || '',
      });
      setProfilePhoto(user.profile_image || null);
    }
     if (formJustUpdated) {
      const timer = setTimeout(() => {
        setFormJustUpdated(false);
      }, 1000); // 1 second delay
      return () => clearTimeout(timer);
    }
  }, [user, reset, formJustUpdated]);

    // Handle section change from URL
    useEffect(() => {
      setActiveSection(section);
    }, [section]);

  const onSubmit = async (data: ProfileFormValues) => {
  try {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    interface ProfileUpdateResponse {
      detail: string;
      user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        date_of_birth: string;
        address: string;
        city: string;
        state: string;
        zip_code: string;
        profile_image?: string;
      };
      profile: {
        id: number;
        emergency_contact_name: string;
        emergency_contact_phone: string;
        emergency_contact_relationship: string;
      };
      updated_fields: {
        user_updated: boolean;
        profile_updated: boolean;
      };
    }

    const response = await apiClient.patch<ProfileUpdateResponse>(ENDPOINTS.PATIENT.PROFILE, data);
    
    const responseData = response.data;
    
    if (responseData) {
      if (responseData.user) {
        setFormJustUpdated(true);

        const newFormData = {
          first_name: responseData.user.first_name || '',
          last_name: responseData.user.last_name || '',
          email: responseData.user.email || '',
          phone_number: responseData.user.phone_number || '',
          date_of_birth: responseData.user.date_of_birth || '',
          address: responseData.user.address || '',
          city: responseData.user.city || '',
          state: responseData.user.state || '',
          zip_code: responseData.user.zip_code || '',
          emergency_contact_name: responseData.profile.emergency_contact_name || '',
          emergency_contact_phone: responseData.profile.emergency_contact_phone || '',
          emergency_contact_relationship: responseData.profile.emergency_contact_relationship || '',
        };

        reset(newFormData);

        Object.keys(newFormData).forEach(key => {
          setValue(key as keyof ProfileFormValues, newFormData[key as keyof ProfileFormValues]);
        });
      }

      setSuccessMessage(responseData.detail || 'Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      throw new Error('No response data received');
    }

  } catch (error) {
    console.error('❌ Profile update error:', error);
    
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object'
    ) {
      const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response;
      if (response?.status === 405) {
        setErrorMessage('Update method not supported. Please contact support.');
      } else if (response?.status === 404) {
        setErrorMessage('Profile endpoint not found. Please contact support.');
      } else if (response?.data?.detail) {
        setErrorMessage(response.data.detail);
      } else {
        setErrorMessage('Failed to update profile');
      }
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrorMessage('Image file size must be less than 5MB');
      return;
    }

    try {
      setPhotoUploading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await apiClient.post(ENDPOINTS.PATIENT.UPLOAD_PROFILE_PHOTO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      interface UploadPhotoResponse {
        profile_photo_url: string;
      }
      const responseData = response.data as UploadPhotoResponse;
      setProfilePhoto(responseData.profile_photo_url);

      updateUserProfileImage(responseData.profile_photo_url);

      setSuccessMessage('Profile photo updated successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Photo upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      setPhotoUploading(true);
      setErrorMessage(null);

      await apiClient.delete(ENDPOINTS.PATIENT.DELETE_PROFILE_PHOTO);
      
      setProfilePhoto(null);
      updateUserProfileImage(null);
      
      setSuccessMessage('Profile photo removed successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Photo removal error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Section Navigation */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'general', label: 'General Information', icon: User },
              { id: 'photo', label: 'Profile Photo', icon: Camera },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Alerts */}
      {(errorMessage || successMessage) && (
        <div className="mb-6">
          <FormAlert
            type={errorMessage ? 'error' : 'success'}
            message={errorMessage || successMessage || ''}
          />
        </div>
      )}

      {/* General Information Section */}
      {activeSection === 'general' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormInput
                  id="first_name"
                  label="First Name"
                  type="text"
                  icon={<User className="w-4 h-4" />}
                  required
                  {...register('first_name')}
                  error={errors.first_name}
                />

                <FormInput
                id="last_name"
                  label="Last Name"
                  type="text"
                  icon={<User className="w-4 h-4" />}
                  required
                  {...register('last_name')}
                  error={errors.last_name}
                />

                <FormInput
                  id="email"
                  label="Email Address"
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  required
                  {...register('email')}
                  error={errors.email}
                />

                <FormInput
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  icon={<Phone className="w-4 h-4" />}
                  {...register('phone_number')}
                  error={errors.phone_number}
                />

                <FormInput
                  id="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  icon={<Calendar className="w-4 h-4" />}
                  {...register('date_of_birth')}
                  error={errors.date_of_birth}
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 gap-6">
                  <FormInput
                    id="address"
                    label="Street Address"
                    type="text"
                    icon={<MapPin className="w-4 h-4" />}
                    {...register('address')}
                    error={errors.address}
                  />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <FormInput
                      id="city"
                      label="City"
                      type="text"
                      {...register('city')}
                      error={errors.city}
                    />

                    <FormInput
                      id="state"
                      label="State"
                      type="text"
                      {...register('state')}
                      error={errors.state}
                    />

                    <FormInput
                      id="zip_code"
                      label="ZIP Code"
                      type="text"
                      {...register('zip_code')}
                      error={errors.zip_code}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <FormInput
                    id="emergency_contact_name"
                    label="Contact Name"
                    type="text"
                    icon={<User className="w-4 h-4" />}
                    {...register('emergency_contact_name')}
                    error={errors.emergency_contact_name}
                  />

                  <FormInput
                    id="emergency_contact_phone"
                    label="Contact Phone"
                    type="tel"
                    icon={<Phone className="w-4 h-4" />}
                    {...register('emergency_contact_phone')}
                    error={errors.emergency_contact_phone}
                  />

                  <FormInput
                    id="emergency_contact_relationship"
                    label="Relationship"
                    type="text"
                    {...register('emergency_contact_relationship')}
                    error={errors.emergency_contact_relationship}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <FormButton
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Update Profile
                </FormButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Photo Section */}
      {activeSection === 'photo' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Profile Photo
            </h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profilePhoto ? (
                    <img
                      src={getImageUrl(profilePhoto) || '/default-avatar.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">
                  {profilePhoto ? 'Update your photo' : 'Upload a profile photo'}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  JPG, GIF or PNG. Maximum file size: 5MB.
                </p>

                <div className="mt-4 flex space-x-3">
                  <label className="relative cursor-pointer bg-white rounded-md border border-gray-300 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>{photoUploading ? 'Uploading...' : profilePhoto ? 'Change Photo' : 'Upload Photo'}</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={photoUploading}
                      className="sr-only"
                    />
                  </label>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={photoUploading}
                      className="inline-flex items-center space-x-2 px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* HIPAA Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Privacy Notice
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your profile photo is protected health information (PHI) under HIPAA. 
                      It will only be shared with your healthcare providers and authorized personnel 
                      as necessary for your care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}