"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loading } from '@/components/Loading';
import { Camera } from 'lucide-react';

export default function DashboardProfile() {
  const { user, profile: currentProfile, isLoading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  // const [currentPassword, setCurrentPassword] = useState(''); // Para cambio de contraseña
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setFullName(currentProfile.full_name || '');
      setAvatarUrl(currentProfile.avatar_url || null);
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [currentProfile, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);

    const updates = {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      toast.error('Failed to update profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
      // Podrías forzar una recarga del perfil en AuthContext si es necesario
    }
    setIsSavingProfile(false);
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Asegúrate de que este bucket exista y tenga las políticas correctas
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      toast.success('Avatar uploaded! Save profile to apply.');

    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };


  if (authLoading || !currentProfile) {
    return <Loading />;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
      
      <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 mb-8">
              <div className="relative">
                <Avatar className="h-32 w-32 border-2 border-brand-orange">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName || user?.email?.charAt(0).toUpperCase()} />
                  <AvatarFallback className="text-4xl bg-muted">
                    {fullName ? fullName.substring(0, 2).toUpperCase() : user?.email?.substring(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatarUpload" 
                  className="absolute bottom-0 right-0 bg-card p-2 rounded-full shadow-md cursor-pointer hover:bg-accent transition-colors"
                >
                  <Camera className="h-5 w-5 text-brand-orange" />
                  <input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-foreground/80">Full Name</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="mt-1 bg-input/50 border-border/50 focus:ring-brand-orange" 
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled 
                  className="mt-1 bg-input/30 border-border/30 text-muted-foreground cursor-not-allowed" 
                />
                 <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-brand-orange hover:bg-brand-orange/90 text-primary-foreground" disabled={isSavingProfile || uploading}>
                {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sección de cambio de contraseña (opcional, requiere más lógica) */}
      {/* <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
             Inputs para currentPassword, newPassword, confirmNewPassword 
            <div className="flex justify-end">
              <Button type="submit" variant="outline">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card> */}
    </div>
  );
}