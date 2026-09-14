import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { EmployeeDocumentDialog } from '@/components/hr/employee-document-dialog';
import { apiFetch } from '@/lib/api/client';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import { deleteEmployeeDocument } from '@/lib/hr/actions';
import { listAll } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { EmployeeDocument } from '@/lib/hr/types';
import type { Employee } from '@/lib/organization/types';

const CATEGORY_LABELS: Record<EmployeeDocument['category'], string> = {
  nid: 'National ID',
  passport: 'Passport',
  contract: 'Contract',
  offer_letter: 'Offer letter',
  certificate: 'Certificate',
  other: 'Other',
};

export default async function EmployeeDocumentsPage() {
  const [token, me] = await Promise.all([getToken(), getSession()]);
  const canViewAll = hasPermission(me, 'employee_document.view_all');

  const [{ data: documents }, employees] = await Promise.all([
    apiFetch<Paginated<EmployeeDocument>>('/employee-documents?per_page=100', { token }),
    listAll<Employee>('/employees', token ?? ''),
  ]);

  return (
    <div>
      <PageHeader
        title="Employee documents"
        description={canViewAll ? 'Documents on file across the tenant.' : 'Your documents on file.'}
        action={<EmployeeDocumentDialog employees={employees} />}
      />

      <Table>
        <TableHeader>
          <TableRow>
            {canViewAll && <TableHead>Employee</TableHead>}
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              {canViewAll && <TableCell className="font-medium">{document.employee?.full_name ?? '—'}</TableCell>}
              <TableCell className={canViewAll ? undefined : 'font-medium'}>{document.title}</TableCell>
              <TableCell className="text-muted-foreground">{CATEGORY_LABELS[document.category]}</TableCell>
              <TableCell>
                {document.expires_at ? (
                  <span className={document.is_expired ? 'text-destructive' : 'text-muted-foreground'}>
                    {document.expires_at}
                  </span>
                ) : (
                  '—'
                )}
                {document.is_expired && (
                  <Badge variant="destructive" className="ml-2">
                    Expired
                  </Badge>
                )}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <a href={document.download_url}>Download</a>
                </Button>
                <DeleteRowButton
                  label={document.title}
                  confirmMessage={`Delete "${document.title}"?`}
                  action={deleteEmployeeDocument.bind(null, document.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={canViewAll ? 5 : 4} className="text-center text-muted-foreground">
                No documents yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
