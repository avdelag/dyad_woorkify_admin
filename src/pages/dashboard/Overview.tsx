"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, ShoppingCart, DollarSign, LucideIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import P5Sketch from '@/components/P5Sketch'; // Import the p5 sketch

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor = "text-brand-orange", isLoading }) => (
  <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl hover:shadow-2xl smooth-hover overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </CardHeader>
    <CardContent className="pb-4 px-4">
      {isLoading ? (
        <div className="h-8 bg-muted/50 rounded animate-pulse w-3/4"></div>
      ) : (
        <div className="text-3xl font-bold text-foreground">{value}</div>
      )}
      {/* Optional: Add a small change indicator or description here */}
    </CardContent>
  </Card>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    ordersToday: 0,
    earningsThisWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const { count: usersCount, error: usersError } = await supabase
          .from('profiles') // Assuming 'profiles' table holds all users (clients and vendors)
          .select('*', { count: 'exact', head: true });
        if (usersError) throw usersError;

        const { count: vendorsCount, error: vendorsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_vendor', true); // Assuming 'is_vendor' field in profiles
        if (vendorsError) throw vendorsError;
        
        const { count: ordersTodayCount, error: ordersTodayError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());
        if (ordersTodayError) throw ordersTodayError;

        const { data: weeklyOrders, error: weeklyOrdersError } = await supabase
          .from('orders')
          .select('total_price')
          .gte('created_at', oneWeekAgo.toISOString());
        if (weeklyOrdersError) throw weeklyOrdersError;
        
        const totalEarnings = weeklyOrders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

        setStats({
          totalUsers: usersCount || 0,
          totalVendors: vendorsCount || 0,
          ordersToday: ordersTodayCount || 0,
          earningsThisWeek: totalEarnings,
        });
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Setup real-time listeners if needed, e.g., for new orders
    // const ordersChannel = supabase.channel('public:orders')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
    //     console.log('New order!', payload)
    //     fetchStats(); // Re-fetch stats on new order
    //   })
    //   .subscribe()

    // return () => {
    //   supabase.removeChannel(ordersChannel);
    // }

  }, []);

  return (
    <div className="relative min-h-full"> {/* Ensure this container allows p5 sketch to be behind */}
      <P5Sketch />
      <div className="relative z-10 space-y-8"> {/* Content on top of p5 sketch */}
        <div className="text-center md:text-left mb-10 pt-8">
          <h1 className="text-5xl md:text-6xl">
            <span className="font-extrabold text-brand-orange">Woorkify</span>
            <span className="font-extrabold text-foreground"> Admin</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Oversee and manage your platform with precision.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} isLoading={isLoading} iconColor="text-brand-blue" />
          <StatCard title="Total Vendors" value={stats.totalVendors} icon={Briefcase} isLoading={isLoading} iconColor="text-brand-purple" />
          <StatCard title="Orders Today" value={stats.ordersToday} icon={ShoppingCart} isLoading={isLoading} iconColor="text-brand-green" />
          <StatCard title="Earnings This Week" value={`$${stats.earningsThisWeek.toFixed(2)}`} icon={DollarSign} isLoading={isLoading} />
        </div>

        {/* Placeholder for more dashboard components like charts or recent activity feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
                <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Message component placeholder...</p></CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
                <CardHeader><CardTitle>Admin Notifications</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Notification component placeholder...</p></CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}