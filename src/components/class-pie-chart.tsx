
"use client";

import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ClassPieChartProps {
  chartData: {
    renewed: number;
    notRenewed: number;
  };
  classLevelName: string;
}

const chartConfig = {
  renewed: { label: "Kayıt Yenileyen", color: "hsl(var(--chart-2))" }, // Green
  notRenewed: { label: "Kayıt Yenilemeyen", color: "hsl(var(--chart-4))" }, // Red
} satisfies ChartConfig;

export function ClassPieChart({ chartData, classLevelName }: ClassPieChartProps) {
  const { renewed, notRenewed } = chartData;
  const total = renewed + notRenewed;

  if (total === 0) {
    return (
      <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{classLevelName}</CardTitle> {/* Adjusted title size */}
          <CardDescription className="text-xs">Bu sınıfta öğrenci bulunmamaktadır.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Veri yok</p>
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: 'renewed', value: renewed, fill: 'var(--color-renewed)' },
    { name: 'notRenewed', value: notRenewed, fill: 'var(--color-notRenewed)' },
  ].filter(item => item.value > 0); // Filter out zero values for cleaner pie, Recharts handles 0 values okay but this is safer

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{classLevelName}</CardTitle>
        <CardDescription className="text-xs">
          Toplam: {total} öğrenci
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-2 pt-0"> {/* Adjusted padding */}
        <ChartContainer config={chartConfig} className="w-full aspect-square max-h-[220px] mx-auto"> {/* Constrained height */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}> {/* Added small margins */}
              <ChartTooltip
                cursor={{fill: 'hsl(var(--muted))', stroke: 'hsl(var(--border))'}}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                        const configEntry = chartConfig[name as keyof typeof chartConfig];
                        return (
                            <div className="flex items-center text-xs">
                                <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: configEntry.color, marginRight: '4px'}}></span>
                                <span>{configEntry.label}: {value}</span>
                            </div>
                        )
                    }}
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="75%" // Adjusted for better fit
                innerRadius="50%" // Make it a Donut chart
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                  if (percent === 0) return null; // Don't show label for 0%
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11px" fontWeight="500">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                paddingAngle={pieData.length > 1 ? 2 : 0} // Add paddingAngle if more than one slice
              >
                {pieData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={'hsl(var(--background))'} strokeWidth={1} /> // Added stroke for separation
                ))}
              </Pie>
              <Legend
                content={({ payload }) => (
                    <div className="flex items-center justify-center gap-x-3 gap-y-1 mt-2 text-xs flex-wrap px-1"> {/* Adjusted styling */}
                    {payload?.map((entry) => {
                        const itemConfig = chartConfig[entry.value as keyof typeof chartConfig];
                        if (!itemConfig) return null;
                        return (
                        <div key={`item-${entry.value}`} className="flex items-center gap-1">
                            <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: itemConfig.color }} />
                            <span className="text-muted-foreground">{itemConfig.label}</span>
                        </div>
                        );
                    })}
                    </div>
                )}
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '0px', paddingBottom: '5px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
