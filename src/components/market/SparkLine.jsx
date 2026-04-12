import { ResponsiveContainer, LineChart, Line } from 'recharts'

export default function SparkLine({ data, positive }) {
  const color = positive ? '#00D68F' : '#FF6B6B'
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
