import type { Metadata } from "next"
import { Receipt } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { EmptyState } from "@/components/dashboard/empty-state"
import {
  FilterBar,
  type FilterDefinition,
} from "@/components/dashboard/filter-bar"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { requireRole } from "@/lib/dal/session"
import { listTransactions } from "@/lib/data/admin"
import { formatDateTime } from "@/lib/format"

export const metadata: Metadata = {
  title: "Transactions",
}

type TransactionsSearchParams = {
  q?: string
  status?: string
  page?: string
}

const paymentStatuses = ["paid", "pending", "failed"] as const

const statusFilter: FilterDefinition = {
  key: "status",
  label: "Status",
  allLabel: "All statuses",
  options: [
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ],
}

function pageNumber(value: string | undefined) {
  const parsed = Number(value ?? "1")
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<TransactionsSearchParams>
}) {
  await requireRole("admin")
  const params = await searchParams
  const transactions = await listTransactions({
    q: params.q,
    status: paymentStatuses.find((status) => status === params.status),
    page: pageNumber(params.page),
  })

  return (
    <>
      <PageHeader
        title="Transactions"
        description="A read-only record of Premium subscription payments. Transactions cannot be edited here."
      />

      <FilterBar
        searchPlaceholder="Search vendor or reference…"
        filters={[statusFilter]}
      />

      {transactions.transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try a different search term or clear the status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {transaction.vendorName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {transaction.vendorEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.plan} />
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {transaction.amount}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(transaction.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination
        page={transactions.page}
        pageCount={transactions.pageCount}
        total={transactions.total}
        basePath="/admin/transactions"
        searchParams={params}
      />
    </>
  )
}
