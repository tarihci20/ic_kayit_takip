"use client";

import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { School, Users, TrendingUp } from 'lucide-react';

interface SchoolProgressProps {
  totalStudents: number;
  overallPercentage: number;
}

export function SchoolProgress({ totalStudents, overallPercentage }: SchoolProgressProps) {
  const percentageColor = overallPercentage >= 80 ? 'text-accent' : overallPercentage >= 50 ? 'text-primary' : 'text-destructive';
  const progressVariant = overallPercentage >= 80 ? 'bg-accent' : overallPercentage >= 50 ? 'bg-primary' : 'bg-destructive';


  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 md:p-10 rounded-lg ">
        <div className="flex items-center space-x-3 text-primary">
             <TrendingUp className="h-8 w-8" />
            <h2 className="text-2xl font-semibold">Okul Geneli İlerleme</h2>
        </div>

      <div className="w-full max-w-md text-center space-y-4">
        <div className="flex justify-around items-center p-4 bg-secondary rounded-lg border">
             <div className="flex flex-col items-center">
                <Users className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-primary">{totalStudents}</p>
            </div>
             <div className="flex flex-col items-center">
                <School className="h-6 w-6 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Yenileme Oranı</p>
                <p className={`text-4xl font-bold ${percentageColor} transition-colors duration-300`}>
                    {overallPercentage}%
                </p>
            </div>
        </div>


        <div className="w-full pt-4">
           <Label htmlFor="school-progress-bar" className="sr-only">Okul Geneli Kayıt Yenileme İlerlemesi</Label>
            <Progress
                id="school-progress-bar"
                value={overallPercentage}
                className="h-4 w-full"
                indicatorClassName={progressVariant + ' transition-all duration-500 ease-out'} // Apply color and transition
                aria-label={`Okul geneli kayıt yenileme oranı %${overallPercentage}`}
            />
        </div>
      </div>

       <p className="text-sm text-muted-foreground text-center max-w-md">
         Bu bölüm, okuldaki tüm öğrencilerin kayıt yenileme durumunu genel bir bakış açısıyla sunar.
       </p>
    </div>
  );
}

// Extend Progress component props if needed for indicatorClassName
declare module "@/components/ui/progress" {
  interface ProgressProps {
    indicatorClassName?: string;
  }
}

// Update Progress component to accept indicatorClassName
// NOTE: This modification assumes you can alter the existing Progress component.
// If not, you might need a custom Progress component or different styling approach.

// In src/components/ui/progress.tsx (Modify the existing component)
/*
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string } // Add indicatorClassName prop
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)} // Use indicatorClassName
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

*/
