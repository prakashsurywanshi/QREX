export const statusColors: Record<string, string> = {
    Available: 'bg-emerald-100 text-emerald-700',
    Reserved: 'bg-amber-100 text-amber-700',
    'Under Negotiation': 'bg-orange-100 text-orange-700',
    Sold: 'bg-gray-100 text-gray-600',
    Draft: 'bg-blue-100 text-blue-700',
    Rented: 'bg-cyan-100 text-cyan-700',
    Inactive: 'bg-red-100 text-red-700',

    New: 'bg-blue-100 text-blue-700',
    Contacted: 'bg-indigo-100 text-indigo-700',
    Qualified: 'bg-violet-100 text-violet-700',
    'Site Visit Scheduled': 'bg-amber-100 text-amber-700',
    'Site Visit Completed': 'bg-cyan-100 text-cyan-700',
    Negotiation: 'bg-orange-100 text-orange-700',
    Converted: 'bg-emerald-100 text-emerald-700',
    Lost: 'bg-red-100 text-red-700',

    Scheduled: 'bg-blue-100 text-blue-700',
    Confirmed: 'bg-emerald-100 text-emerald-700',
    Completed: 'bg-gray-100 text-gray-600',
    Rescheduled: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-red-100 text-red-700',

    Paid: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Overdue: 'bg-red-100 text-red-700',
    'Partially Paid': 'bg-blue-100 text-blue-700',

    Active: 'bg-emerald-100 text-emerald-700',
    Prospect: 'bg-blue-100 text-blue-700',
    Buyer: 'bg-emerald-100 text-emerald-700',
    Investor: 'bg-purple-100 text-purple-700',
    'Past Customer': 'bg-gray-100 text-gray-600',

    'Super Admin': 'bg-red-100 text-red-700',
    Admin: 'bg-purple-100 text-purple-700',
    'Sales Executive': 'bg-blue-100 text-blue-700',
    'Senior Agent': 'bg-indigo-100 text-indigo-700',
    'Marketing User': 'bg-amber-100 text-amber-700',
    Accountant: 'bg-emerald-100 text-emerald-700',

    'Agreement Signed': 'bg-emerald-100 text-emerald-700',
    'Under Agreement': 'bg-amber-100 text-amber-700',
    'Booking Pending': 'bg-blue-100 text-blue-700',
};

interface BadgeProps {
    label: string;
    className?: string;
}

export default function Badge({ label, className = '' }: BadgeProps) {
    const color = statusColors[label] || 'bg-gray-100 text-gray-600';
    return <span className={`status-badge ${color} ${className}`}>{label}</span>;
}
