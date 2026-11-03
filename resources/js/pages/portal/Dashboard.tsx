import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CreditCard, FileText, Calendar } from 'lucide-react';

export default function Dashboard({ buyer, customer, booking }: any) {
    const formatCurrency = (amount: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount || 0));

    return (
        <>
            <Head title="Buyer Dashboard" />
            <div className="min-h-screen bg-background">
                <header className="border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <h1 className="text-xl font-bold">QREX Buyer Portal</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{buyer.email}</span>
                            <form method="post" action={route('portal.logout')}>
                                <input type="hidden" name="_token" value={(window as any).csrf_token || ''} />
                                <Button variant="outline" size="sm">Logout</Button>
                            </form>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-6 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Welcome{customer?.name ? `, ${customer.name}` : ''}</h2>
                        <p className="text-muted-foreground">Track your booking, payments and documents</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Booking</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{booking ? 'Active' : 'None'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Payments</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{booking?.payment_plan ? formatCurrency(booking.payment_plan.total_amount) : '-'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Site Visits</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">-</div>
                            </CardContent>
                        </Card>
                    </div>

                    {booking && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Property</span>
                                    <span className="font-medium">{booking.property?.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge>{booking.status}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-medium">{formatCurrency(booking.amount)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </>
    );
}
