"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, Profile } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { PlusCircle, Search, Edit3, Trash2, Briefcase } from 'lucide-react';
import { Loading } from '@/components/Loading';
import { cn } from '@/lib/utils'; // Asegurarse de que cn esté importado

export default function DashboardVendors() {
  const [vendors, setVendors] = useState<Profile[]>([]); // Usaremos el tipo Profile
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles') // Obtenemos de la tabla profiles
        .select('id, full_name, email, created_at, business_name, business_description') // Ajusta los campos según tu tabla profiles
        .eq('is_vendor', true) // Filtramos por vendors
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendors: ' + error.message);
        setVendors([]);
      } else {
        setVendors(data as Profile[] || []);
      }
      setIsLoading(false);
    };

    fetchVendors();

    const vendorsChannel = supabase
      .channel('public:profiles:vendors')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: 'is_vendor=eq.true' },
        (payload) => {
          console.log('Vendor change received!', payload);
          fetchVendors(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vendorsChannel);
    };
  }, []);

  const filteredVendors = vendors.filter(vendor => 
    vendor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Vendors</h1>
          <p className="text-muted-foreground">View and manage vendor accounts.</p>
        </div>
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-primary-foreground smooth-hover">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Vendor
        </Button>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm border-border/30 shadow-xl">
        <CardHeader className="border-b border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Vendor List</CardTitle>
              <CardDescription>Total Vendors: {filteredVendors.length}</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors..." 
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
                  <TableHead className="text-foreground/80">Business Name</TableHead>
                  <TableHead className="text-foreground/80">Email</TableHead>
                  <TableHead className="text-foreground/80">Joined Date</TableHead>
                  <TableHead className="text-right text-foreground/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="border-b-border/20 hover:bg-accent/30 smooth-hover">
                    <TableCell className="font-medium text-foreground py-3">{vendor.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground py-3">{vendor.business_name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground py-3">{vendor.email}</TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {new Date(vendor.created_at).toLocaleDateString()}
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      No vendors found.
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