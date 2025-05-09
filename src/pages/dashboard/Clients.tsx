"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, Profile } from '@/integrations/supabase/client'; // Assuming Profile type is exported or defined here
import { toast } from 'react-hot-toast';
import { PlusCircle, Search, Edit3, Trash2 } from 'lucide-react';
import { Loading } from '@/components/Loading';

// If Profile type is not in client.ts, define it here or import from AuthContext
// interface Profile {
//   id: string;
//   full_name?: string | null;
//   email?: string | null;
//   created_at: string;
//   is_vendor?: boolean | null;
// }


export default function DashboardClients() {
  const [clients, setClients] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('is_vendor', false) // Fetch only clients
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients: ' + error.message);
        setClients([]);
      } else {
        setClients(data as Profile[] || []);
      }
      setIsLoading(false);
    };

    fetchClients();

    // Real-time updates for clients
    const clientChanges = supabase
      .channel('public:profiles:clients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: 'is_vendor=eq.false' },
        (payload) => {
          console.log('Client change received!', payload);
          // A more sophisticated update would be better (update/insert/delete specific row)
          fetchClients(); // Re-fetch for simplicity
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientChanges);
    };
  }, []);

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
                    <TableCell className="font-medium text-foreground py-3">{client.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground py-3">{client.email}</TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {new Date(client.created_at).toLocaleDateString()}
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
                      No clients found.
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