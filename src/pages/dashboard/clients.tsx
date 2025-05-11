"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Importar Avatar
import { supabase, Profile } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { PlusCircle, Search, Edit3, Trash2 } from 'lucide-react';
import { Loading } from '@/components/Loading';
import { cn } from '@/lib/utils';

export default function DashboardClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    console.log("[Clients] fetchClients called.");
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, avatar_url, is_vendor, is_admin') // Seleccionar todos los campos relevantes para el filtro
        .eq('is_vendor', false)
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Clients] Error fetching clients:', error);
        toast.error('Failed to load clients: ' + error.message);
        setClients([]);
      } else {
        console.log('[Clients] Successfully fetched clients:', data);
        setClients(data as Profile[] || []);
      }
    } catch (e: any) {
        console.error('[Clients] Exception fetching clients:', e);
        toast.error('An unexpected error occurred while fetching clients.');
        setClients([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    const clientChanges = supabase
      .channel('public:profiles:clients_page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: 'is_vendor=eq.false&is_admin=eq.false' },
        (payload) => {
          console.log('[Clients] Real-time: Client change received!', payload);
          toast.info('Client list updated!'); // Usar info para no ser muy intrusivo
          fetchClients();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Clients] Real-time: Subscribed to profiles changes for clients.');
        } else {
          console.error('[Clients] Real-time: Subscription error:', status, err);
        }
      });

    return () => {
      console.log("[Clients] Unsubscribing from profiles changes.");
      supabase.removeChannel(clientChanges);
    };
  }, []);

  const filteredClients = clients.filter(client => 
    (client.full_name && client.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && clients.length === 0) { // Mostrar loading solo si no hay clientes y está cargando
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Clients</h1>
          <p className="text-muted-foreground">View and manage client accounts.</p>
        </div>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-primary-foreground smooth-hover">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
        </Button>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <CardHeader className="border-b border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Client List</CardTitle>
              <CardDescription>Total Clients: {filteredClients.length}</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
                className="pl-10 bg-input/50 border-border/50 focus:ring-brand-orange"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-border/30">
                  <TableHead className="text-foreground/80">Name</TableHead>
                  <TableHead className="text-foreground/80">Email</TableHead>
                  <TableHead className="text-foreground/80">Joined Date</TableHead>
                  <TableHead className="text-right text-foreground/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-b-border/20 hover:bg-accent/30 smooth-hover">
                    <TableCell className="font-medium text-foreground py-3 flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={client.avatar_url || undefined} alt={client.full_name || 'C'} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {client.full_name ? client.full_name.substring(0, 1).toUpperCase() : (client.email ? client.email.substring(0,1).toUpperCase() : 'C')}
                        </AvatarFallback>
                      </Avatar>
                      {client.full_name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">{client.email}</TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue smooth-hover">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive smooth-hover">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      {isLoading ? 'Loading clients...' : 'No clients found.'}
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