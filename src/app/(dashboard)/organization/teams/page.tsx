import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { TeamDialog } from '@/components/organization/team-dialog';
import { TeamMembersDialog } from '@/components/organization/team-members-dialog';
import { apiFetch } from '@/lib/api/client';
import { getToken } from '@/lib/auth/session';
import { deleteTeam } from '@/lib/organization/actions';
import type { Paginated } from '@/lib/api/types';
import type { Employee, Team } from '@/lib/organization/types';

export default async function TeamsPage() {
  const token = await getToken();
  const [{ data: teamSummaries }, { data: employees }] = await Promise.all([
    apiFetch<Paginated<Team>>('/teams?per_page=100', { token }),
    apiFetch<Paginated<Employee>>('/employees?per_page=100', { token }),
  ]);

  // The index endpoint only counts members (avoids an N+1 there); fetch each
  // team's full detail for the actual member list the "manage members"
  // dialog needs to pre-select correctly.
  const teams = await Promise.all(
    teamSummaries.map((team) => apiFetch<{ data: Team }>(`/teams/${team.id}`, { token }).then((r) => r.data)),
  );

  const leadById = new Map(employees.map((e) => [e.id, e.full_name]));

  return (
    <div>
      <PageHeader title="Teams" description="Cross-functional groups." action={<TeamDialog employees={employees} />} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {team.lead_employee_id ? (leadById.get(team.lead_employee_id) ?? '—') : '—'}
              </TableCell>
              <TableCell>
                <TeamMembersDialog team={team} employees={employees} />
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <DeleteRowButton
                  label={team.name}
                  confirmMessage={`Delete team "${team.name}"?`}
                  action={deleteTeam.bind(null, team.id)}
                />
              </TableCell>
            </TableRow>
          ))}
          {teams.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No teams yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
