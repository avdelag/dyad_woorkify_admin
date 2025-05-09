"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { PlusCircle, Search, Filter, Package, Edit3, Trash2 } from 'lucide-react';
import { Loading } from '@/components/Loading';
import { cn } from '@/lib/utils';

// Definir un tipo para las órdenes basado en tu esquema
interface Order {
  id: string;
  client_id: string; // Podrías hacer un join para obtener el nombre del cliente
  vendor_id: string; // Podrías hacer un join para obtener el nombre del vendor
  status: string;
  amount: number | null; // Usando 'amount' como en tu esquema
  created_at: string;
  // Podrías añadir campos de cliente/vendor si haces join
  client_name?: string;
  vendor_name?: string;
  service?: string; // Del esquema de orders
}

export default function DashboardOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid', 'delivered'

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      let query = supabase
        .from('orders')
        .select(`
          id, 
          client_id, 
          vendor_id, 
          status, 
          amount, 
          created_at,
          service,
          client:profiles!orders_client_id_fkey(full_name),
          vendor:profiles!orders_vendor_id_fkey(full_name)
        `) // Asumiendo FKs correctas
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders: ' + error.message);
        setOrders([]);
      } else {
        const formattedData = data?.map(d => ({
            ...d,
            client_name: (d.client as any)?.full_name || d.client_id,
            vendor_name: (d.vendor as any)?.full_name || d.vendor_id,
        })) || [];
        setOrders(formattedData as Order[]);
      }
      setIsLoading(false);
    };

    fetchOrders();

    const ordersChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Order change received!', payload);
          toast.info('Order list updated!');
          fetchOrders(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [statusFilter]);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.service?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
          <p className="text-muted-foreground">View and manage all platform orders.</p>
        </div>
        {/* <Button className="bg-brand-orange hover:bg-brand-orange/90 text-primary-foreground smooth-hover">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Order (Manual)
        </Button> */}
      </div>

      <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <CardHeader className="border-b border-border/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-grow">
              <CardTitle>Order List</CardTitle>
              <CardDescription>Total Orders: {filteredOrders.length}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by ID, client, vendor..." 
                  className="pl-10 bg-input/50 border-border/50 focus:ring-brand-orange"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-input/50 border border-border/50 text-foreground rounded-md px-3 py-2 focus:ring-brand-orange focus:border-brand-orange text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-border/30">
                  <TableHead className="text-foreground/80">Order ID</TableHead>
                  <TableHead className="text-foreground/80">Service</TableHead>
                  <TableHead className="text-foreground/80">Client</TableHead>
                  <TableHead className="text-foreground/80">Vendor</TableHead>
                  <TableHead className="text-foreground/80">Amount</TableHead>
                  <TableHead className="text-foreground/80">Status</TableHead>
                  <TableHead className="text-foreground/80">Date</TableHead>
                  <TableHead className="text-right text-foreground/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-b-border/20 hover:bg-accent/30 smooth-hover">
                    <TableCell className="font-medium text-foreground py-3 text-xs">{order.id}</TableCell>
                    <TableCell className="text-muted-foreground py-3">{order.service || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground py-3">{order.client_name}</TableCell>
                    <TableCell className="text-muted-foreground py-3">{order.vendor_name}</TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {order.amount !== null ? `$${order.amount.toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell className="py-3">
                       <span className={cn("px-2 py-1 text-xs font-semibold rounded-full",
                        order.status === 'paid' || order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                        'bg-gray-500/20 text-gray-500'
                      )}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue smooth-hover">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {/* <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive smooth-hover">
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      No orders found for the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}