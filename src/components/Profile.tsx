import React, { useState, useMemo } from 'react';
import { BodyMetric } from '../types';
import { Card, Button, Input } from './UI';
import { 
  User, 
  Scale, 
  Ruler, 
  Droplets,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';

export function Profile({ 
  bodyMetrics, 
  userHeight,
  onUpdateHeight,
  onAddMetric, 
  onDeleteMetric 
}: { 
  bodyMetrics: BodyMetric[];
  userHeight: number | null;
  onUpdateHeight: (height: number) => void;
  onAddMetric: (metric: BodyMetric) => void;
  onDeleteMetric: (id: string) => void;
}) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [localHeight, setLocalHeight] = useState(userHeight?.toString() || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedMetrics = useMemo(() => {
    return [...bodyMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bodyMetrics]);

  const chartData = useMemo(() => {
    return sortedMetrics.map(m => ({
      ...m,
      formattedDate: format(new Date(m.date), 'dd/MM'),
    }));
  }, [sortedMetrics]);

  const stats = useMemo(() => {
    if (bodyMetrics.length === 0) return null;
    const latest = sortedMetrics[sortedMetrics.length - 1];
    const first = sortedMetrics[0];
    const diff = latest.weight - first.weight;
    
    // BMI = weight (kg) / height^2 (m)
    let bmi = null;
    if (latest.weight && userHeight) {
      bmi = Number((latest.weight / Math.pow(userHeight / 100, 2)).toFixed(1));
    }

    return { latest, diff, bmi };
  }, [sortedMetrics, bodyMetrics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    onAddMetric({
      id: crypto.randomUUID(),
      date,
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
    });

    setWeight('');
    setBodyFat('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-4xl text-white bebas tracking-wider">Profil & Poids</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* Global Height Card */}
          <Card className="p-6 bg-gradient-to-br from-dark-surface to-black/20">
            <h2 className="text-xl text-white font-display uppercase tracking-tight flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 text-neon" /> Ma Taille
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Taille (cm)</label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Ex: 180"
                    value={localHeight} 
                    onChange={(e) => setLocalHeight(e.target.value)}
                    className="font-mono flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => {
                      if (localHeight) onUpdateHeight(parseFloat(localHeight));
                    }}
                  >
                    OK
                  </Button>
                </div>
              </div>
              <p className="text-[9px] text-gray-600 uppercase tracking-wider italic">
                Ta taille est enregistrée une fois pour calculer ton IMC.
              </p>
            </div>
          </Card>

          {/* Input Card */}
          <Card className="p-6 h-fit bg-gradient-to-br from-dark-surface to-black/20">
            <h2 className="text-xl text-white font-display uppercase tracking-tight flex items-center gap-2 mb-6">
              <Scale className="w-5 h-5 text-neon" /> Nouvelle Mesure
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Date</label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Poids (kg)</label>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0"
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Graisse Corporelle (%)</label>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="0.0"
                  value={bodyFat} 
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button variant="neon" type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" /> Enregistrer mesure
              </Button>
            </form>
          </Card>
        </div>

        {/* Stats & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {stats ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Poids Actuel</p>
                  <p className="text-3xl text-neon font-mono">{stats.latest.weight}kg</p>
                  <div className="flex items-center gap-1">
                    {stats.diff !== 0 && (
                      <>
                        {stats.diff > 0 ? <TrendingUp className="w-3 h-3 text-red-500" /> : <TrendingDown className="w-3 h-3 text-green-500" />}
                        <span className={`text-[10px] font-bold ${stats.diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {stats.diff > 0 ? '+' : ''}{stats.diff.toFixed(1)}kg
                        </span>
                      </>
                    )}
                  </div>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">IMC (BMI)</p>
                  <p className="text-3xl text-white font-mono">{stats.bmi || '--'}</p>
                  <span className="text-[8px] text-gray-600 font-bold uppercase">Indice de masse corporelle</span>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Masse Grasse</p>
                  <p className="text-3xl text-sport-orange font-mono">{stats.latest.bodyFat ? stats.latest.bodyFat + '%' : '--'}</p>
                  <span className="text-[8px] text-gray-600 font-bold uppercase">Estimation du taux de gras</span>
                </Card>
              </div>

              <Card className="p-6 h-[400px]">
                <h3 className="text-lg text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon" /> Évolution du Poids
                </h3>
                <div className="w-full h-full pb-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e8ff47" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e8ff47" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
                      <XAxis dataKey="formattedDate" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={10} 
                        axisLine={false} 
                        tickLine={false} 
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#12121a', border: '1px solid #2d2d3d', borderRadius: '8px' }}
                        itemStyle={{ color: '#e8ff47' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#e8ff47" 
                        fillOpacity={1} 
                        fill="url(#colorWeight)" 
                        strokeWidth={3}
                      />
                      {sortedMetrics.some(m => m.bodyFat) && (
                        <Line 
                          type="monotone" 
                          dataKey="bodyFat" 
                          stroke="#ff6b35" 
                          strokeWidth={2} 
                          dot={{ fill: '#ff6b35', r: 3 }}
                          name="Taux de Gras %"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* History Table */}
              <Card className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Poids</th>
                      <th className="px-4 py-3">Taux Gras</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...sortedMetrics].reverse().map(m => (
                      <tr key={m.id} className="text-white text-sm hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-400">{format(new Date(m.date), 'dd MMM yyyy')}</td>
                        <td className="px-4 py-3 font-mono text-neon font-bold">{m.weight}kg</td>
                        <td className="px-4 py-3 font-mono text-sport-orange">{m.bodyFat ? m.bodyFat + '%' : '--'}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => onDeleteMetric(m.id)}
                            className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          ) : (
             <Card className="p-20 text-center flex flex-col items-center justify-center">
                <Activity className="w-12 h-12 text-gray-800 mb-4" />
                <p className="text-gray-500 font-display text-xl uppercase italic tracking-widest">Aucune donnée de poids enregistrée</p>
                <p className="text-sm text-gray-600 mt-2">Commencez par ajouter votre poids sur la gauche</p>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
