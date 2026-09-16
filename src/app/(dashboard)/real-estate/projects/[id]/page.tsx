import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/organization/delete-row-button';
import { PageHeader } from '@/components/organization/page-header';
import { AmenityForm } from '@/components/realestate/amenity-form';
import { BuildingDialog } from '@/components/realestate/building-dialog';
import { DocumentUploadDialog } from '@/components/realestate/document-upload-dialog';
import { LandRecordDialog } from '@/components/realestate/land-record-dialog';
import { LandShareDialog } from '@/components/realestate/land-share-dialog';
import { PaymentPlanDialog } from '@/components/realestate/payment-plan-dialog';
import { ProjectDialog } from '@/components/realestate/project-dialog';
import { ProjectLocationForm } from '@/components/realestate/project-location-form';
import { ProjectPricingForm } from '@/components/realestate/project-pricing-form';
import { ProjectSubmitButton } from '@/components/realestate/project-submit-button';
import { UnitDialog } from '@/components/realestate/unit-dialog';
import { UnitPriceDialog } from '@/components/realestate/unit-price-dialog';
import { apiFetch } from '@/lib/api/client';
import { getSession, getToken, hasPermission } from '@/lib/auth/session';
import { deleteAmenity, deleteBuilding, deleteUnit } from '@/lib/realestate/actions';
import type { Project, ProjectDocument, ProjectStatus } from '@/lib/realestate/types';
import type { Paginated } from '@/lib/api/types';

const STATUS_VARIANT: Record<ProjectStatus, 'secondary' | 'default' | 'destructive' | 'outline'> = {
  draft: 'outline',
  pending_verification: 'secondary',
  verified: 'default',
  rejected: 'destructive',
};

export default async function RealEstateProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  const [token, user] = await Promise.all([getToken(), getSession()]);
  const canManageLandRecords = hasPermission(user, 'land_record.manage');

  const [{ data: project }, documents] = await Promise.all([
    apiFetch<{ data: Project }>(`/real-estate/projects/${projectId}`, { token }),
    apiFetch<Paginated<ProjectDocument>>(`/real-estate/projects/${projectId}/documents`, { token }),
  ]);

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description ?? 'No description'}
        action={
          <div className="flex gap-1">
            {project.status === 'draft' && <ProjectSubmitButton projectId={project.id} />}
            <ProjectDialog project={project} />
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant={STATUS_VARIANT[project.status]} className="capitalize">
          {project.status.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {project.project_type.replace('_', ' ')}
        </Badge>
        {project.total_land_area && <span className="text-sm text-muted-foreground">Land area: {project.total_land_area}</span>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectLocationForm projectId={project.id} location={project.locations?.[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectPricingForm projectId={project.id} pricing={project.pricing} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment plans</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <PaymentPlanDialog projectId={project.id} />
            <div className="flex flex-col gap-2">
              {project.payment_plans?.map((plan) => (
                <div key={plan.id} className="border-t pt-2 text-sm">
                  <span className="font-medium">{plan.name}</span> — {plan.down_payment_percent}% down,{' '}
                  {plan.installment_count} × {plan.installment_frequency}
                </div>
              ))}
              {(!project.payment_plans || project.payment_plans.length === 0) && (
                <p className="text-sm text-muted-foreground">No payment plans yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {project.project_type === 'land_share' && (
          <Card>
            <CardHeader>
              <CardTitle>Land shares</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <LandShareDialog projectId={project.id} />
              <div className="flex flex-col gap-2">
                {project.land_shares?.map((share) => (
                  <div key={share.id} className="border-t pt-2 text-sm">
                    {share.total_shares} shares @ {share.share_value}
                  </div>
                ))}
                {(!project.land_shares || project.land_shares.length === 0) && (
                  <p className="text-sm text-muted-foreground">No land shares yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {canManageLandRecords && (
          <Card>
            <CardHeader>
              <CardTitle>Land records</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <LandRecordDialog projectId={project.id} />
              <p className="text-sm text-muted-foreground">Legal land records on file (mouza, JL/khatian/dag) — owner/admin only.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <DocumentUploadDialog projectId={project.id} />
            <div className="flex flex-col gap-2">
              {documents.data.map((document) => (
                <div key={document.id} className="flex items-center justify-between border-t pt-2 text-sm">
                  <span className="capitalize">{document.document_type.replace('_', ' ')}</span>
                  {document.is_private && <Badge variant="outline">Private</Badge>}
                </div>
              ))}
              {documents.data.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <AmenityForm projectId={project.id} />
            <div className="flex flex-wrap gap-2">
              {project.amenities?.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                  {amenity.name}
                  <DeleteRowButton
                    label={amenity.name}
                    confirmMessage={`Remove amenity "${amenity.name}"?`}
                    action={deleteAmenity.bind(null, project.id, amenity.id)}
                  />
                </div>
              ))}
              {(!project.amenities || project.amenities.length === 0) && (
                <p className="text-sm text-muted-foreground">No amenities yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Buildings &amp; units</CardTitle>
            <BuildingDialog projectId={project.id} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {project.buildings?.map((building) => (
              <div key={building.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{building.name}</p>
                    <p className="text-sm text-muted-foreground">{building.total_floors} floors</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <UnitDialog projectId={project.id} buildingId={building.id} />
                    <DeleteRowButton
                      label={building.name}
                      confirmMessage={`Delete building "${building.name}"?`}
                      action={deleteBuilding.bind(null, project.id, building.id)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {building.units?.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{unit.unit_number}</span> — floor {unit.floor}, {unit.size_sqft} sqft
                        {unit.bedrooms !== null && `, ${unit.bedrooms}BR`}
                        <Badge variant="outline" className="ml-2 capitalize">
                          {unit.status}
                        </Badge>
                        {unit.prices && unit.prices.length > 0 && (
                          <span className="ml-2 text-muted-foreground">
                            {unit.prices[unit.prices.length - 1]?.price}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <UnitPriceDialog projectId={project.id} unitId={unit.id} />
                        <DeleteRowButton
                          label={unit.unit_number}
                          confirmMessage={`Delete unit "${unit.unit_number}"?`}
                          action={deleteUnit.bind(null, project.id, unit.id)}
                        />
                      </div>
                    </div>
                  ))}
                  {(!building.units || building.units.length === 0) && (
                    <p className="text-sm text-muted-foreground">No units yet.</p>
                  )}
                </div>
              </div>
            ))}
            {(!project.buildings || project.buildings.length === 0) && (
              <p className="text-sm text-muted-foreground">No buildings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/real-estate/projects" className="text-sm text-muted-foreground hover:underline">
          ← Back to projects
        </Link>
      </div>
    </div>
  );
}
