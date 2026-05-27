'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Ticket,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock3,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-lg animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const stats = data?.metrics;

  const charts = data?.charts;

  const cards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },

    {
      title: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },

    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },

    {
      title: 'Completed Orders',
      value: stats?.completedOrders || 0,
      icon: CheckCircle2,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },

    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock3,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },

    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },

    {
      title: 'New Users',
      value: stats?.newUsersThisMonth || 0,
      icon: Users,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },

    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },

    {
      title: 'Low Stock',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },

    {
      title: 'Open Tickets',
      value: stats?.openTickets || 0,
      icon: Ticket,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
  ];

  const pieColors = [
    '#3b82f6',
    '#22c55e',
    '#eab308',
    '#ef4444',
    '#8b5cf6',
  ];

  return (
    <div className="w-full min-h-screen space-y-8 p-6 lg:p-8">
      

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.title}
                  </p>

                  <h3 className="text-3xl font-bold mt-3 break-all">
                    {card.value}
                  </h3>
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}
                >
                  <Icon size={26} className={card.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-8">
        <div className="2xl:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Revenue Overview</h2>

            <p className="text-muted-foreground mt-1">
              Revenue trends across recent months
            </p>
          </div>

          <div className="w-full h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueByMonth || []}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Orders Status</h2>

            <p className="text-muted-foreground mt-1">
              Distribution of order statuses
            </p>
          </div>

          <div className="w-full h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.ordersByStatus || []}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={140}
                  innerRadius={70}
                  paddingAngle={4}
                >
                  {(charts?.ordersByStatus || []).map(
                    (_: any, index: number) => (
                      <Cell
                        key={index}
                        fill={pieColors[index % pieColors.length]}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {(charts?.ordersByStatus || []).map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        pieColors[index % pieColors.length],
                    }}
                  />

                  <span className="text-muted-foreground">
                    {item.status}
                  </span>

                  <span className="font-semibold ml-auto">
                    {item.count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Orders Trend</h2>

            <p className="text-muted-foreground mt-1">
              Monthly order growth analytics
            </p>
          </div>

          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.ordersByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">User Registrations</h2>

            <p className="text-muted-foreground mt-1">
              Monthly user acquisition
            </p>
          </div>

          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.usersByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="users"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold">Top Selling Products</h2>

            <p className="text-muted-foreground mt-1">
              Highest performing products by sales
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold">
                    Product
                  </th>

                  <th className="text-left p-4 font-semibold">
                    SKU
                  </th>

                  <th className="text-left p-4 font-semibold">
                    Units Sold
                  </th>

                  <th className="text-left p-4 font-semibold">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {(charts?.topProducts || []).map(
                  (product: any, index: number) => (
                    <tr
                      key={index}
                      className="border-t border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 font-medium">
                        {product.productName}
                      </td>

                      <td className="p-4 text-muted-foreground">
                        {product.sku}
                      </td>

                      <td className="p-4 font-semibold">
                        {product.totalSold}
                      </td>

                      <td className="p-4 font-bold text-green-500">
                        ${product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold">Latest Orders</h2>

            <p className="text-muted-foreground mt-1">
              Recently placed customer orders
            </p>
          </div>

          <div className="divide-y divide-border">
            {(charts?.latestOrders || []).map(
              (order: any, index: number) => (
                <div
                  key={index}
                  className="p-5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {order.firstName} {order.lastName}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        {order.email}
                      </p>

                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-start xl:items-end">
                      <span className="font-bold text-lg">
                        ${order.amount.toFixed(2)}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {order.currency}
                      </span>

                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium">
                          {order.status}
                        </span>

                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 font-medium">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}