"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, ShoppingCart, DollarSign, LucideIcon, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import P5Sketch from '@/components/P5Sketch';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  isLoading: boolean;
  gradient?: string; // For gradient background
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor = "text-white/80", isLoading, gradient }) => (
  <Card className={cn(
    "shadow-xl hover:shadow-2xl smooth-hover overflow-hidden text-white/90 hover:scale-105 transform transition-all duration-300",
    gradient || "bg-card/70 backdrop-blur-sm border-border/30"
  )}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
      <CardTitle className="text-sm font-medium text-white/70">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </CardHeader>
    <CardContent className="pb-4 px-4">
      {isLoading ? (
        <div className="h-8 bg-white/20 rounded animate-pulse w-3/4"></div>
      ) : (
        <div className="text-3xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalClients: 0, // Changed from totalUsers
    totalVendors: 0,
    ordersToday: 0,
    earningsThisWeek: 0,
    messagesToday: 0, // New stat
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayISO = todayStart.toISOString();

        const oneWeekAgo = new Date(todayStart);
        oneWeekAgo.setDate(todayStart.getDate() - 7);
        const oneWeekAgoISO = oneWeekAgo.toISOString();

        // Total Clients
        const { count: clientsCount, error: clientsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_vendor', false)
          .eq('is_admin', false);
        if (clientsError) throw clientsError;

        // Total Vendors
        const { count: vendorsCount, error: vendorsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_vendor', true);
        if (vendorsError) throw vendorsError;
        
        // Orders Today
        const { count: ordersTodayCount, error: ordersTodayError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayISO);
        if (ordersTodayError) throw ordersTodayError;

        // Earnings This Week (using 'amount' from orders table)
        const { data: weeklyOrders, error: weeklyOrdersError } = await supabase
          .from('orders')
          .select('amount') // Changed from total_price to amount
          .gte('created_at', oneWeekAgoISO)
          .eq('status', 'paid'); // Consider only paid orders for earnings
        if (weeklyOrdersError) throw weeklyOrdersError;
        
        const totalEarnings = weeklyOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Messages Today
        const { count: messagesTodayCount, error: messagesTodayError } = await supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayISO);
        if (messagesTodayError) throw messagesTodayError;

        setStats({
          totalClients: clientsCount || 0,
          totalVendors: vendorsCount || 0,
          ordersToday: ordersTodayCount || 0,
          earningsThisWeek: totalEarnings,
          messagesToday: messagesTodayCount || 0,
        });
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Real-time listeners
    const profilesChannel = supabase.channel('public:profiles:overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
      .subscribe();
    const ordersChannel = supabase.channel('public:orders:overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchStats())
      .subscribe();
    const messagesChannel = supabase.channel('public:contact_messages:overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchStats())
      .subscribe();
      
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(messagesChannel);
    };

  }, []);

  return (
    <div className="relative min-h-full">
      <P5Sketch />
      <div className="relative z-10 space-y-8">
        <div className="text-center md:text-left mb-10 pt-8">
          <h1 className="text-5xl md:text-6xl drop-shadow-md">
            <span className="font-extrabold text-brand-orange">Woorkify</span>
            <span className="font-extrabold text-foreground"> Admin Portal</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Oversee and manage your platform with precision.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard title="Clients Registered" value={stats.totalClients} icon={Users} isLoading={isLoading} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
          <StatCard title="Total Vendors" value={stats.totalVendors} icon={Briefcase} isLoading={isLoading} gradient="bg-gradient-to-br from-purple-500 to-purple-700" />
          <StatCard title="Orders Today" value={stats.ordersToday} icon={ShoppingCart} isLoading={isLoading} gradient="bg-gradient-to-br from-green-500 to-green-700" />
          <StatCard title="Messages Today" value={stats.messagesToday} icon={MessageCircle} isLoading={isLoading} gradient="bg-gradient-to-br from-yellow-500 to-yellow-700" />
          <StatCard title="Revenue This Week" value={stats.earningsThisWeek > 0 ? `$${stats.earningsThisWeek.toFixed(2)}` : (isLoading ? '...' : 'No revenue data')} icon={DollarSign} isLoading={isLoading} gradient="bg-gradient-to-br from-brand-orange to-red-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
                <CardHeader><CardTitle>Recent Messages (Placeholder)</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">A list of recent messages will appear here...</p></CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
                <CardHeader><CardTitle>Admin Notifications (Placeholder)</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Important admin notifications will be shown here...</p></CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}