import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const categoryData = [
  { name: 'Sala de estar', value: 25, color: '#6366f1' },
  { name: 'Quarto', value: 17, color: '#3b82f6' },
  { name: 'Escritório', value: 13, color: '#8b5cf6' },
  { name: 'Cozinha', value: 9, color: '#d946ef' },
  { name: 'Banheiro', value: 8, color: '#ec4899' },
  { name: 'Sala de jantar', value: 6, color: '#f43f5e' },
  { name: 'Decoração', value: 5, color: '#f97316' },
  { name: 'Iluminação', value: 3, color: '#10b981' },
]

const countryData = [
  { name: 'Brasil', value: '35%', color: '#22c55e' },
  { name: 'Argentina', value: '19%', color: '#3b82f6' },
  { name: 'Colômbia', value: '15%', color: '#8b5cf6' },
  { name: 'Chile', value: '13%', color: '#f97316' },
  { name: 'Peru', value: '12%', color: '#ec4899' },
]

export function BottomWidgets() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Category Chart */}
      <Card className="glass-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Vendas por categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4 w-full">
            {categoryData.map((cat, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm bg-muted/30 px-3 py-2 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-foreground">{cat.name}</span>
                </div>
                <span className="font-bold text-muted-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>

          <div className="w-[200px] h-[200px] shrink-0">
            <ChartContainer config={{}} className="h-full w-full">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Country List */}
      <Card className="glass-card flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Vendas por país</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            {countryData.map((country, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: country.color }}
                  />
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {country.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">{country.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 h-[100px] w-full bg-[url('https://img.usecurling.com/i?q=world-map&shape=outline&color=gray')] bg-no-repeat bg-contain bg-center opacity-30" />
        </CardContent>
      </Card>
    </div>
  )
}
