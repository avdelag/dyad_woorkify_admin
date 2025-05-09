"use client";
import React from 'react';
import { Moon, Sun, UserCircle, LogOut, Menu, X, Settings, User } from 'lucide-react'; // Added Settings, User
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const Navbar = ({ toggleMobileSidebar, isMobileSidebarOpen }: { toggleMobileSidebar: () => void; isMobileSidebarOpen: boolean; }) => {
  const { theme, setTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login'); // Redirect after sign out
  };

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"> {/* Increased height */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden text-foreground/80 hover:text-foreground smooth-hover" onClick={toggleMobileSidebar}>
            {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            {/* You can add a logo SVG here if you have one */}
            <span className="text-3xl font-extrabold text-brand-orange">Woorkify</span>
            <span className="text-3xl font-extrabold text-foreground">Admin</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' || theme === 'system' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="text-foreground/80 hover:text-foreground hover:bg-accent/50 smooth-hover rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-accent/50 smooth-hover">
                <Avatar className="h-9 w-9"> {/* Slightly larger Avatar */}
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'Admin'} />
                  <AvatarFallback className="bg-brand-orange text-primary-foreground">
                    {profile?.full_name ? profile.full_name.substring(0, 1).toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-foreground/90">{profile?.full_name || 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-xl rounded-lg mt-2">
              <DropdownMenuLabel className="text-foreground/90">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="hover:bg-accent/50 smooth-hover text-foreground/80">
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="hover:bg-accent/50 smooth-hover text-foreground/80">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/20 focus:text-destructive hover:!bg-destructive/20 hover:!text-destructive-foreground smooth-hover"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

// Dummy Avatar component if not using shadcn/ui Avatar
const Avatar = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>
    {children}
  </div>
);
const AvatarImage = ({ src, alt, className }: { src?: string, alt: string, className?: string }) => (
  src ? <img src={src} alt={alt} className={cn("aspect-square h-full w-full", className)} /> : null
);
const AvatarFallback = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}>
    {children}
  </span>
);