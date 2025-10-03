import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend} from 'recharts';
import type {Voter} from "../../components/table/columns"

interface BarChartProps {
  stateName: string;
  barData: Voter[]; // modify based on how data is stored
}

export function DataBarChart({stateName, barData}: BarChartProps) {
    const total = barData.length;
    const registeredCount = barData.filter(voter => voter.registered === "true").length;
    const unregisteredCount = total - registeredCount;

    const data = [{name: `${stateName}`, registered: registeredCount, unregistered: unregisteredCount, amt: total}];
    return (
        <BarChart width={500} height={250} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="registered" fill="#8884d8" />
            <Bar dataKey="unregistered" fill="#82ca9d" />
        </BarChart>
    )
}