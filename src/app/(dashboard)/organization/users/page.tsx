import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { UserDialog } from '@/components/organization/user-dialog';
import { UserRolesDialog } from '@/components/organization/user-roles-dialog';
import { apiFetch } from '@/lib/api/client';
import { getSession, getToken } from '@/lib/auth/session';
import { deleteUser } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { OrgUser } from '@/lib/organization/types';

export default async function UsersPage() {
  const [token, me] = await Promise.all([getToken(), getSession()]);
  const { data: users } = await apiFetch<Paginated<OrgUser>>('/users?per_page=100', { token });

  return (
    <div>
      <PageHeader title="Users" description="People with login access to this tenant." action={<UserDialog />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell className="flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role}
                  </Badge>
                ))}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <UserRolesDialog user={user} />
                {user.id !== me?.id && (
                  <DeleteRowButton
                    label={user.name}
                    confirmMessage={`Remove "${user.name}" from this tenant?`}
                    action={deleteUser.bind(null, user.id)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No users yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
