"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FilterIcon } from 'lucide-react'; // Usar FilterIcon o SlidersHorizontal

export const GlobalFilters = () => {
  const [selectedFilter, setSelectedFilter] = useState("all_time");

  const handleApplyFilters = () => {
    // Lógica para aplicar filtros globalmente (puede usar Context API o Zustand)
    console.log("Applying global filter:", selectedFilter);
    toast.info(`Global filter set to: ${selectedFilter.replace("_", " ")}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-card/80 hover:bg-accent/70 smooth-hover">
          <FilterIcon className="h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Global Data Filters</DialogTitle>
          <DialogDescription>
            Apply a time range to filter data across the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup defaultValue={selectedFilter} onValueChange={setSelectedFilter}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="today" id="today" />
              <Label htmlFor="today">Today</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="this_week" id="this_week" />
              <Label htmlFor="this_week">This Week</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="this_month" id="this_month" />
              <Label htmlFor="this_month">This Month</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all_time" id="all_time" />
              <Label htmlFor="all_time">All Time</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleApplyFilters} className="bg-brand-orange hover:bg-brand-orange/90">Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};