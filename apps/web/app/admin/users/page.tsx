import type { Metadata } from "next"
import { ShieldCheck, ShieldX, Users } from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { UserAvatar } from "@/components/auth/user-avatar"
import { ConfirmAction } from "@/components/dashboard/confirm-action"
import { EmptyState } from "@/components/dashboard/empty-state"
import { FilterBar, type FilterDefinition } from "@/components/dashboard/filter-bar"
import { PageHeader } from "@/components/dashboard/page-header"
import { PremiumBadge } from "@/components/dashboard/premium-badge"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { setUserBlocked } from "@/lib/actions/admin"
import { requireRole } from "@/lib/dal/session"
import { listAdminUsers } from "@/lib/data/admin"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Manage users",
}

type UsersSearchParams = {
  q?: string
  role?: string
  page?: string
}

const roleLabels: Record<string, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
}

const roleFilter: FilterDefinition = {
  key: "role",
  label: "Role",
  allLabel: "All roles",
  options: [
    { label: "Customer", value: "customer" },
    { label: "Vendor", value: "vendor" },
    { label: "Admin", value: "admin" },
  ],
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<UsersSearchParams>
}) {
  const session = await requireRole("admin")
  const params = await searchParams
  const users = await listAdminUsers({
    q: params.q,
    role: params.role,
    page: pageNumber(params.page),
  })

  return (
    <>
      <PageHeader
        title="Manage users"
        description="Search every account, filter by role, and block abusive users. Blocking signs them out immediately."
      />

      <FilterBar searchPlaceholder="Search name or email…" filters={[roleFilter]} />

      {users.users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try a different search term or clear the role filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.users.map((user) => {
                const isSelf = user.id === session.user.id
                const canModerate = user.role !== "admin" && !isSelf

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} image={user.image} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {user.name}
                            {isSelf ? (
                              <span className="ml-1 text-xs text-muted-foreground">
                                (you)
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.restaurantName ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{user.restaurantName}</span>
                          {user.plan === "premium" ? <PremiumBadge /> : null}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 bg-destructive/10 text-destructive"
                        >
                          Blocked
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canModerate ? (
                        <ConfirmAction
                          action={setUserBlocked.bind(null, user.id, !user.banned)}
                          triggerLabel={user.banned ? "Unblock" : "Block"}
                          title={
                            user.banned
                              ? `Unblock ${user.name}?`
                              : `Block ${user.name}?`
                          }
                          description={
                            user.banned
                              ? "The user will be able to sign in and use the platform again."
                              : "The user is signed out of every device and cannot sign in until unblocked."
                          }
                          confirmLabel={user.banned ? "Unblock user" : "Block user"}
                          variant={user.banned ? "outline" : "destructive"}
                          icon={user.banned ? ShieldCheck : ShieldX}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Protected
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination
        page={users.page}
        pageCount={users.pageCount}
        total={users.total}
        basePath="/admin/users"
        searchParams={params}
      />
    </>
  )
}
