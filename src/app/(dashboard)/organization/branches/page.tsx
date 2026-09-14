import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BranchDialog } from '@/components/organization/branch-dialog';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteBranch } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Branch } from '@/lib/organization/types';

export default async function BranchesPage() {
  const token = await getToken();
  const { data: branches } = await apiFetch<Paginated<Branch>>('/branches?per_page=100', { token });

  return (
    <div>
      <PageHeader title="Branches" description="Company locations." action={<BranchDialog />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell className="font-medium">
                {branch.name}
                {branch.is_head_office && (
                  <Badge variant="secondary" className="ml-2">
                    HQ
                  </Badge>
                )}
              </TableCell>
              <TableCell>{branch.code}</TableCell>
              <TableCell className="text-muted-foreground">{branch.email ?? branch.phone ?? '—'}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <BranchDialog branch={branch} />
                <DeleteRowButton
                  label={branch.name}
                  confirmMessage={`Delete branch "${branch.name}"?`}
                  action={deleteBranch.bind(null, branch.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {branches.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No branches yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
