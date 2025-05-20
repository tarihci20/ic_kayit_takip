
"use client";

import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface ClassRenewalData {
  name: string; // e.g., "5. Sınıflar"
  renewed: number;
  notRenewed: number;
}

interface ClassRenewalChartProps {
  data: ClassRenewalData[];
}

const chartConfig = {
  renewed: {
    label: "Kayıt Yenileyen",
    color: "hsl(var(--chart-2))", // Green
  },
  notRenewed: {
    label: "Kayıt Yenilemeyen",
    color: "hsl(var(--chart-4))", // Red
  },
} satisfies ChartConfig;

export function ClassRenewalChart({ data }: ClassRenewalChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-4">Sınıf bazlı kayıt durumu grafiği için veri bulunmamaktadır.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-auto sm:aspect-[2/1] md:aspect-[3/1] lg:aspect-[4/1]">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            // tickFormatter={(value) => value.slice(0, 3)} // Abbreviate if needed
          />
          <YAxis 
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false}
            label={{ value: 'Öğrenci Sayısı', angle: -90, position: 'insideLeft', offset:0, style:{textAnchor: 'middle'} }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent 
                        indicator="dot" 
                        labelKey="name" 
                        nameKey="value"
                        formatter={(value, name, props) => {
                            const configEntry = chartConfig[props.dataKey as keyof typeof chartConfig];
                            return (
                                <>
                                    <span style={{color: configEntry.color}}>{configEntry.label}: </span>
                                    {value}
                                </>
                            )
                        }}
                    />}
          />
          <Legend 
            content={({ payload }) => (
                <div className="flex items-center justify-center gap-4 mt-4">
                {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs text-muted-foreground">{entry.value === 'renewed' ? chartConfig.renewed.label : chartConfig.notRenewed.label}</span>
                    </div>
                ))}
                </div>
            )}
          />
          <Bar dataKey="renewed" stackId="a" fill="var(--color-renewed)" radius={[4, 4, 0, 0]} barSize={40} />
          <Bar dataKey="notRenewed" stackId="a" fill="var(--color-notRenewed)" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
