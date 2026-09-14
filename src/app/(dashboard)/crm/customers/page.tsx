import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { CustomerDialog } from '@/components/crm/customer-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteCustomer } from '@/lib/crm/actions';
import type { Customer } from '@/lib/crm/types';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Employee } from '@/lib/organization/types';

export default async function CustomersPage() {
  const token = await getToken();
  const [{ data: customers }, employees] = await Promise.all([
    apiFetch<Paginated<Customer>>('/customers?per_page=100', { token }),
    listAll<Employee>('/employees', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader title="Customers" description="Converted leads and directly added customers." action={<CustomerDialog employees={employees} />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                <Link href={`/crm/customers/${customer.id}`} className="hover:underline">
                  {customer.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{customer.company ?? '—'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {customer.type}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{customer.email ?? customer.phone ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{customer.owner?.full_name ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <CustomerDialog customer={customer} employees={employees} />
                <DeleteRowButton
                  label={customer.name}
                  confirmMessage={`Delete "${customer.name}"?`}
                  action={deleteCustomer.bind(null, customer.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No customers yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
