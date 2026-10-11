import React, { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Coins,
  FileEdit,
  Files,
  RefreshCcw,
  RotateCcw,
  Send,
  Undo2,
  UploadCloud,
  Wallet,
  Bitcoin,
} from 'lucide-react'
import { useAuthStore } from '../../../stores/authStore'
import * as ledgerApi from '../../../api/ledger'
import * as batchApi from '../../../api/batch'
import * as reversalApi from '../../../api/reversal'
import * as retryApi from '../../../api/retry'
import * as walletApi from '../../../api/wallet'
import * as paymentsApi from '../../../api/payments'
import { isApprovalInterceptedResponse } from '../../../api/client'
import { parseUploadTable } from '../../../utils/uploadParsers'

interface PostingsHubProps {
  triggerToast: (msg: string) => void;
}

type AwaitedReturn<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>

type WorkbenchType = 
  | 'wallet-transfer' 
  | 'local-transfer' 
  | 'single-journal' 
  | 'qcoin-exchange' 
  | 'crypto-payment' 
  | 'manual-batch' 
  | 'batch-upload' 
  | 'reversal-upload' 
  | 'manual-reversal' 
  | 'retry-ops'
  | 'gl-postings' 
  | null;

export default function PostingsHub({ triggerToast }: PostingsHubProps) {
  const [activeWorkbench, setActiveWorkbench] = useState<WorkbenchType>(null);
  const tenantId = useAuthStore((s) => s.tenantId)
  const userId = useAuthStore((s) => s.userId)
  const [fetchId, setFetchId] = useState('')
  const [fetchRef, setFetchRef] = useState('')
  const [subLedgerId, setSubLedgerId] = useState('')
  const [resultText, setResultText] = useState('')
  const [postText, setPostText] = useState(() => {
    const seed: ledgerApi.PostingDto = {
      reference: 'REF-0001',
      description: 'Manual journal entry',
      postingDate: new Date().toISOString(),
      tenantId: '',
      entries: [
        { glAccountId: '', amount: 0, side: 'DEBIT' },
        { glAccountId: '', amount: 0, side: 'CREDIT' },
      ],
    }
    return JSON.stringify(seed, null, 2)
  })
  const [isBusy, setIsBusy] = useState(false)

  const [ledgerHistoryPage, setLedgerHistoryPage] = useState(1)
  const [ledgerHistoryPageSize, setLedgerHistoryPageSize] = useState(25)
  const [ledgerHistoryFromDate, setLedgerHistoryFromDate] = useState('')
  const [ledgerHistoryToDate, setLedgerHistoryToDate] = useState('')
  const [ledgerHistoryRef, setLedgerHistoryRef] = useState('')
  const [ledgerHistorySubLedger, setLedgerHistorySubLedger] = useState('')
  const [ledgerHistoryGl, setLedgerHistoryGl] = useState('')
  const [ledgerHistoryRes, setLedgerHistoryRes] = useState<AwaitedReturn<typeof ledgerApi.listTransactions> | null>(null)

  const [batchHistoryPage, setBatchHistoryPage] = useState(1)
  const [batchHistoryPageSize, setBatchHistoryPageSize] = useState(25)
  const [batchHistoryName, setBatchHistoryName] = useState('')
  const [batchHistoryStatus, setBatchHistoryStatus] = useState<batchApi.BatchJobStatus | ''>('')
  const [batchHistoryFromDate, setBatchHistoryFromDate] = useState('')
  const [batchHistoryToDate, setBatchHistoryToDate] = useState('')
  const [batchHistoryRes, setBatchHistoryRes] = useState<AwaitedReturn<typeof batchApi.listBatchHistory> | null>(null)

  const [reversalHistoryPage, setReversalHistoryPage] = useState(1)
  const [reversalHistoryPageSize, setReversalHistoryPageSize] = useState(25)
  const [reversalHistoryStatus, setReversalHistoryStatus] = useState<reversalApi.ReversalStatus | ''>('')
  const [reversalHistoryType, setReversalHistoryType] = useState<reversalApi.ReversalType | ''>('')
  const [reversalHistoryOriginalId, setReversalHistoryOriginalId] = useState('')
  const [reversalHistoryFromDate, setReversalHistoryFromDate] = useState('')
  const [reversalHistoryToDate, setReversalHistoryToDate] = useState('')
  const [reversalHistoryRes, setReversalHistoryRes] = useState<AwaitedReturn<typeof reversalApi.listReversalHistory> | null>(null)

  const [retryHistoryPage, setRetryHistoryPage] = useState(1)
  const [retryHistoryPageSize, setRetryHistoryPageSize] = useState(25)
  const [retryHistoryStatus, setRetryHistoryStatus] = useState<retryApi.RetryRecordStatus | ''>('')
  const [retryHistoryTargetType, setRetryHistoryTargetType] = useState<retryApi.RetryTargetType | ''>('')
  const [retryHistoryFromDate, setRetryHistoryFromDate] = useState('')
  const [retryHistoryToDate, setRetryHistoryToDate] = useState('')
  const [retryHistoryRes, setRetryHistoryRes] = useState<AwaitedReturn<typeof retryApi.listRetryHistory> | null>(null)

  const [walletHistoryPage, setWalletHistoryPage] = useState(1)
  const [walletHistoryPageSize, setWalletHistoryPageSize] = useState(25)
  const [walletHistoryType, setWalletHistoryType] = useState<walletApi.WalletTransactionType | ''>('')
  const [walletHistoryStatus, setWalletHistoryStatus] = useState<walletApi.WalletTransactionStatus | ''>('')
  const [walletHistoryAccount, setWalletHistoryAccount] = useState('')
  const [walletHistoryRef, setWalletHistoryRef] = useState('')
  const [walletHistoryFromDate, setWalletHistoryFromDate] = useState('')
  const [walletHistoryToDate, setWalletHistoryToDate] = useState('')
  const [walletHistoryRes, setWalletHistoryRes] = useState<AwaitedReturn<typeof walletApi.listWalletTransactions> | null>(null)

  const [paymentHistoryPage, setPaymentHistoryPage] = useState(1)
  const [paymentHistoryPageSize, setPaymentHistoryPageSize] = useState(25)
  const [paymentHistorySourceAccount, setPaymentHistorySourceAccount] = useState('')
  const [paymentHistoryStatus, setPaymentHistoryStatus] = useState<paymentsApi.PaymentStatus | ''>('')
  const [paymentHistoryRail, setPaymentHistoryRail] = useState<paymentsApi.PaymentRail | ''>('')
  const [paymentHistoryFromDate, setPaymentHistoryFromDate] = useState('')
  const [paymentHistoryToDate, setPaymentHistoryToDate] = useState('')
  const [paymentHistoryRes, setPaymentHistoryRes] = useState<AwaitedReturn<typeof paymentsApi.listPaymentHistory> | null>(null)

  const [walletTransferFrom, setWalletTransferFrom] = useState('')
  const [walletTransferTo, setWalletTransferTo] = useState('')
  const [walletTransferAmount, setWalletTransferAmount] = useState('')
  const [walletTransferCurrency, setWalletTransferCurrency] = useState('NGN')
  const [walletTransferDesc, setWalletTransferDesc] = useState('')

  const [walletFundingAccount, setWalletFundingAccount] = useState('')
  const [walletFundingAmount, setWalletFundingAmount] = useState('')
  const [walletFundingCurrency, setWalletFundingCurrency] = useState('NGN')
  const [walletFundingDesc, setWalletFundingDesc] = useState('')

  const [walletWithdrawalAccount, setWalletWithdrawalAccount] = useState('')
  const [walletWithdrawalAmount, setWalletWithdrawalAmount] = useState('')
  const [walletWithdrawalCurrency, setWalletWithdrawalCurrency] = useState('NGN')
  const [walletWithdrawalDesc, setWalletWithdrawalDesc] = useState('')

  const [qcoinCustomerId, setQcoinCustomerId] = useState('')
  const [qcoinDirection, setQcoinDirection] = useState<walletApi.QCoinExchangeDirection>('BUY_QCOIN')
  const [qcoinFiatAmount, setQcoinFiatAmount] = useState('')
  const [qcoinQcoinAmount, setQcoinQcoinAmount] = useState('')
  const [qcoinFiatCurrency, setQcoinFiatCurrency] = useState('NGN')
  const [qcoinQcoinCurrency, setQcoinQcoinCurrency] = useState('QCN')
  const [qcoinDesc, setQcoinDesc] = useState('')

  const [localTransferSource, setLocalTransferSource] = useState('')
  const [localTransferDestination, setLocalTransferDestination] = useState('')
  const [localTransferAmount, setLocalTransferAmount] = useState('')
  const [localTransferCurrency, setLocalTransferCurrency] = useState('NGN')
  const [localTransferReference, setLocalTransferReference] = useState('')

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,184,0,0.2)',
    borderRadius: '0.5rem',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.85rem',
  }

  const labelStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--foreground-muted)',
    fontWeight: '800',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '1rem',
    padding: '1.5rem',
  }

  const modules = useMemo(
    () => [
    { id: 'wallet-transfer', title: 'Wallet Fund Transfer', icon: <Wallet size={20} />, description: 'Execute instant peer-to-peer wallet transfers.' },
    { id: 'local-transfer', title: 'Local Funds Transfer', icon: <Building2 size={20} />, description: 'Route fiat to local financial institutions.' },
    { id: 'single-journal', title: 'Single Journal Entry', icon: <FileEdit size={20} />, description: 'Direct single-leg and double-leg ledger postings.' },
    { id: 'qcoin-exchange', title: 'Queens Coin Exchange', icon: <Coins size={20} />, description: ' digital asset liquidation & swap.' },
    { id: 'crypto-payment', title: 'Crypto Payment', icon: <Bitcoin size={20} />, description: 'On-chain settlement & wallet disbursement.' },
    { id: 'manual-batch', title: 'Manual Batch Journal Entry', icon: <Files size={20} />, description: 'Form-based multi-row ledger updates.' },
    { id: 'batch-upload', title: 'Batch Journal Posting Upload', icon: <UploadCloud size={20} />, description: 'CSV/XLSX bulk journal entry execution.' },
    { id: 'reversal-upload', title: 'Batch Reversals Upload', icon: <RotateCcw size={20} />, description: 'Bulk transaction clawbacks via CSV.' },
    { id: 'manual-reversal', title: 'Manual Reversal Entry', icon: <Undo2 size={20} />, description: 'Individual transaction rollback tools.' },
    { id: 'retry-ops', title: 'Retry Operations', icon: <RefreshCcw size={20} />, description: 'Recovery queue, due retries, and state actions.' },
    { id: 'gl-postings', title: 'GL Postings Viewer', icon: <BookOpen size={20} />, description: 'Direct access to ledger transaction blocks.' }
    ],
    [],
  )

  const handleOpenWorkbench = (id: WorkbenchType) => {
    setActiveWorkbench(id);
  };

  const getActiveTitle = () => {
    return modules.find(m => m.id === activeWorkbench)?.title || 'Workbench';
  };

  const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

  const pickHeaderIndex = (headers: string[], candidates: string[]) => {
    const normalized = headers.map(normalizeHeader)
    for (const cand of candidates) {
      const idx = normalized.indexOf(normalizeHeader(cand))
      if (idx >= 0) return idx
    }
    return -1
  }

  const coerceAmount = (v: string) => {
    const n = Number(String(v ?? '').replace(/,/g, '').trim())
    if (!Number.isFinite(n)) return null
    return n
  }

  const toIso = (value: string) => {
    if (!value.trim()) return undefined
    const d = new Date(value)
    if (!Number.isFinite(d.getTime())) return undefined
    return d.toISOString()
  }

  const showResult = (res: unknown, successMsg: string) => {
    setResultText(JSON.stringify(res, null, 2))
    if (isApprovalInterceptedResponse(res)) {
      triggerToast(`${successMsg} Submitted for approval (${res.requestId}).`)
      return
    }
    triggerToast(successMsg)
  }

  const loadLedgerHistory = async (page = ledgerHistoryPage, pageSize = ledgerHistoryPageSize) => {
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this session.')
      return
    }
    setIsBusy(true)
    try {
      const res = await ledgerApi.listTransactions({
        tenantId,
        page,
        pageSize,
        fromDate: toIso(ledgerHistoryFromDate),
        toDate: toIso(ledgerHistoryToDate),
        reference: ledgerHistoryRef.trim() || undefined,
        subLedgerId: ledgerHistorySubLedger.trim() || undefined,
        glAccountId: ledgerHistoryGl.trim() || undefined,
      })
      setLedgerHistoryPage(page)
      setLedgerHistoryPageSize(pageSize)
      setLedgerHistoryRes(res)
      triggerToast('Ledger history loaded.')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load ledger history.')
    } finally {
      setIsBusy(false)
    }
  }

  const loadBatchHistory = async (page = batchHistoryPage, pageSize = batchHistoryPageSize) => {
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this session.')
      return
    }
    setIsBusy(true)
    try {
      const res = await batchApi.listBatchHistory({
        tenantId,
        page,
        pageSize,
        status: batchHistoryStatus || undefined,
        name: batchHistoryName.trim() || undefined,
        fromDate: toIso(batchHistoryFromDate),
        toDate: toIso(batchHistoryToDate),
      })
      setBatchHistoryPage(page)
      setBatchHistoryPageSize(pageSize)
      setBatchHistoryRes(res)
      triggerToast('Batch history loaded.')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load batch history.')
    } finally {
      setIsBusy(false)
    }
  }

  const loadReversalHistory = async (page = reversalHistoryPage, pageSize = reversalHistoryPageSize) => {
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this session.')
      return
    }
    setIsBusy(true)
    try {
      const res = await reversalApi.listReversalHistory({
        tenantId,
        page,
        pageSize,
        status: reversalHistoryStatus || undefined,
        type: reversalHistoryType || undefined,
        originalTransactionId: reversalHistoryOriginalId.trim() || undefined,
        fromDate: toIso(reversalHistoryFromDate),
        toDate: toIso(reversalHistoryToDate),
      })
      setReversalHistoryPage(page)
      setReversalHistoryPageSize(pageSize)
      setReversalHistoryRes(res)
      triggerToast('Reversal history loaded.')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load reversal history.')
    } finally {
      setIsBusy(false)
    }
  }

  const loadRetryHistory = async (page = retryHistoryPage, pageSize = retryHistoryPageSize) => {
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this session.')
      return
    }
    setIsBusy(true)
    try {
      const res = await retryApi.listRetryHistory({
        tenantId,
        page,
        pageSize,
        status: retryHistoryStatus || undefined,
        targetType: retryHistoryTargetType || undefined,
        fromDate: toIso(retryHistoryFromDate),
        toDate: toIso(retryHistoryToDate),
      })
      setRetryHistoryPage(page)
      setRetryHistoryPageSize(pageSize)
      setRetryHistoryRes(res)
      triggerToast('Retry history loaded.')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load retry history.')
    } finally {
      setIsBusy(false)
    }
  }

  const loadWalletHistory = async (page = walletHistoryPage, pageSize = walletHistoryPageSize, overrides?: { type?: walletApi.WalletTransactionType | ''; status?: walletApi.WalletTransactionStatus | '' }) => {
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this session.')
      return
    }
    const t = overrides?.type ?? walletHistoryType
    const s = overrides?.status ?? walletHistoryStatus
    setIsBusy(true)
    try {
      const res = await walletApi.listWalletTransactions({
        tenantId,
        page,
        pageSize,
        type: t || undefined,
        status: s || undefined,
        accountNumber: walletHistoryAccount.trim() || undefined,
        reference: walletHistoryRef.trim() || undefined,
        fromDate: toIso(walletHistoryFromDate),
        toDate: toIso(walletHistoryToDate),
      })
      setWalletHistoryPage(page)
      setWalletHistoryPageSize(pageSize)
      setWalletHistoryRes(res)
      triggerToast('Wallet history loaded.')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load wallet history.')
    } finally {
      setIsBusy(false)
    }
  }

  const loadPaymentHistory = async (page = paymentHistoryPage, pageSize = paymentHistoryPageSize) => {
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this session.')
      return
    }
    setIsBusy(true)
    try {
      const res = await paymentsApi.listPaymentHistory({
        tenantId,
        page,
        pageSize,
        sourceAccountId: paymentHistorySourceAccount.trim() || undefined,
        status: paymentHistoryStatus || undefined,
        rail: paymentHistoryRail || undefined,
        fromDate: toIso(paymentHistoryFromDate),
        toDate: toIso(paymentHistoryToDate),
      })
      setPaymentHistoryPage(page)
      setPaymentHistoryPageSize(pageSize)
      setPaymentHistoryRes(res)
      triggerToast('Payment history loaded.')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load payment history.')
    } finally {
      setIsBusy(false)
    }
  }

  const pagerButtonStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.55rem',
    color: '#fff',
    padding: '0.5rem 0.7rem',
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  }

  const renderPager = (opts: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
    onPage: (page: number) => void
    onPageSize: (pageSize: number) => void
  }) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
        <div style={{ color: 'var(--foreground-muted)', fontWeight: 800, fontSize: '0.78rem' }}>
          Page {opts.page} / {opts.totalPages} · {opts.totalItems} items
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            disabled={isBusy || opts.page <= 1}
            style={{ ...pagerButtonStyle, opacity: isBusy || opts.page <= 1 ? 0.5 : 1 }}
            onClick={() => opts.onPage(1)}
          >
            <ArrowLeft size={14} />
            First
          </button>
          <button
            disabled={isBusy || opts.page <= 1}
            style={{ ...pagerButtonStyle, opacity: isBusy || opts.page <= 1 ? 0.5 : 1 }}
            onClick={() => opts.onPage(Math.max(1, opts.page - 1))}
          >
            <ArrowLeft size={14} />
            Prev
          </button>
          <button
            disabled={isBusy || opts.page >= opts.totalPages}
            style={{ ...pagerButtonStyle, opacity: isBusy || opts.page >= opts.totalPages ? 0.5 : 1 }}
            onClick={() => opts.onPage(Math.min(opts.totalPages, opts.page + 1))}
          >
            Next
            <ArrowRight size={14} />
          </button>
          <button
            disabled={isBusy || opts.page >= opts.totalPages}
            style={{ ...pagerButtonStyle, opacity: isBusy || opts.page >= opts.totalPages ? 0.5 : 1 }}
            onClick={() => opts.onPage(opts.totalPages)}
          >
            Last
            <ArrowRight size={14} />
          </button>
          <select
            value={opts.pageSize}
            disabled={isBusy}
            onChange={(e) => opts.onPageSize(Number(e.target.value))}
            style={{ ...inputStyle, width: 'auto', minWidth: '92px', padding: '0.5rem 0.7rem' }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n} style={{ background: '#111', color: '#fff' }}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  const [batchName, setBatchName] = useState('')
  const [batchItems, setBatchItems] = useState<batchApi.BatchItemDto[]>([
    { sourceAccountId: '', targetAccountId: '', targetBankCode: '', amount: 0, currency: 'NGN' },
  ])
  const [batchId, setBatchId] = useState('')

  const [batchUploadName, setBatchUploadName] = useState('')
  const [batchUploadFileLabel, setBatchUploadFileLabel] = useState('')
  const [batchUploadItems, setBatchUploadItems] = useState<batchApi.BatchItemDto[]>([])

  const [reversalOriginalTransactionId, setReversalOriginalTransactionId] = useState('')
  const [reversalReason, setReversalReason] = useState<reversalApi.ReversalReason>('TECHNICAL_ERROR')
  const [reversalReasonDescription, setReversalReasonDescription] = useState('')
  const [reversalType, setReversalType] = useState<reversalApi.ReversalType>('FULL_REVERSAL')
  const [reversalAmount, setReversalAmount] = useState('')
  const [reversalBypassApproval, setReversalBypassApproval] = useState(false)
  const [reversalId, setReversalId] = useState('')

  const [reversalUploadFileLabel, setReversalUploadFileLabel] = useState('')
  const [reversalUploadItems, setReversalUploadItems] = useState<
    Array<Pick<reversalApi.CreateReversalDto, 'originalTransactionId' | 'reason' | 'reasonDescription' | 'type' | 'amount'>>
  >([])
  const [reversalUploadSummary, setReversalUploadSummary] = useState<{
    total: number
    succeeded: number
    failed: number
    errors: string[]
  } | null>(null)

  const [retryDashboard, setRetryDashboard] = useState<string>('')
  const [retryDue, setRetryDue] = useState<retryApi.RetryRecord[]>([])
  const [retryAll, setRetryAll] = useState<retryApi.RetryRecord[]>([])
  const [retryRecordId, setRetryRecordId] = useState('')
  const [retrySelected, setRetrySelected] = useState<retryApi.RetryRecord | null>(null)
  const [retryFailureError, setRetryFailureError] = useState('')
  const [retryCompensateReason, setRetryCompensateReason] = useState('')

  const upsertRetry = (rec: retryApi.RetryRecord) => {
    setRetryAll((prev) => {
      const idx = prev.findIndex((p) => p.id === rec.id)
      if (idx === -1) return [rec, ...prev]
      const next = prev.slice()
      next[idx] = rec
      return next
    })
    setRetryDue((prev) => {
      const next = prev.filter((p) => p.id !== rec.id)
      if (rec.status === 'PENDING' || rec.status === 'RETRYING') return [rec, ...next]
      return next
    })
  }

  const parseReversalReason = (value: string): reversalApi.ReversalReason | null => {
    const n = normalizeHeader(value)
    if (n === 'duplicatepayment') return 'DUPLICATE_PAYMENT'
    if (n === 'wrongrecipient') return 'WRONG_RECIPIENT'
    if (n === 'fraudsuspected') return 'FRAUD_SUSPECTED'
    if (n === 'technicalerror') return 'TECHNICAL_ERROR'
    if (n === 'customerrequest') return 'CUSTOMER_REQUEST'
    return null
  }

  const parseReversalType = (value: string): reversalApi.ReversalType | null => {
    const n = normalizeHeader(value)
    if (n === 'fullreversal') return 'FULL_REVERSAL'
    if (n === 'partialreversal') return 'PARTIAL_REVERSAL'
    if (n === 'chargeback') return 'CHARGEBACK'
    return null
  }

  const renderWorkbench = () => {
    if (activeWorkbench === 'gl-postings') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>FETCH BY TRANSACTION ID</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  value={fetchId}
                  onChange={(e) => setFetchId(e.target.value)}
                  placeholder="journal entry id"
                  style={{ flex: 1, padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
                />
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
                  disabled={isBusy || !fetchId.trim()}
                  onClick={async () => {
                    setIsBusy(true)
                    try {
                      const res = await ledgerApi.getTransaction(fetchId.trim())
                      setResultText(JSON.stringify(res, null, 2))
                      triggerToast('Transaction loaded.')
                    } catch {
                      triggerToast('Failed to fetch transaction.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                >
                  Fetch
                </button>
              </div>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>FETCH BY REFERENCE</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  value={fetchRef}
                  onChange={(e) => setFetchRef(e.target.value)}
                  placeholder="reference"
                  style={{ flex: 1, padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
                />
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
                  disabled={isBusy || !fetchRef.trim()}
                  onClick={async () => {
                    setIsBusy(true)
                    try {
                      const res = await ledgerApi.getTransactionByReference(fetchRef.trim())
                      setResultText(JSON.stringify(res, null, 2))
                      triggerToast('Transaction loaded.')
                    } catch {
                      triggerToast('Failed to fetch transaction by reference.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                >
                  Fetch
                </button>
              </div>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>SUB-LEDGER DAILY TOTAL (DEBIT)</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                value={subLedgerId}
                onChange={(e) => setSubLedgerId(e.target.value)}
                placeholder="sub-ledger id (e.g. customer account id)"
                style={{ flex: 1, padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
              />
              <button
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
                disabled={isBusy || !subLedgerId.trim()}
                onClick={async () => {
                  if (!tenantId) {
                    triggerToast('Tenant is not resolved for this session.')
                    return
                  }
                  setIsBusy(true)
                  try {
                    const res = await ledgerApi.getSubLedgerDailyTotal(tenantId, subLedgerId.trim())
                    setResultText(JSON.stringify({ subLedgerId: subLedgerId.trim(), dailyTotal: res }, null, 2))
                    triggerToast('Daily total loaded.')
                  } catch {
                    triggerToast('Failed to load daily total.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                Fetch
              </button>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>RESPONSE</p>
            <pre style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1rem', overflowX: 'auto', minHeight: '240px', whiteSpace: 'pre-wrap', color: '#fff' }}>
              {resultText || 'No response loaded yet.'}
            </pre>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Ledger Posting History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Filter journal entries and validate the ledger impact (GL + sub-ledger references).
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => loadLedgerHistory(1, ledgerHistoryPageSize)}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>REFERENCE</p>
                <input value={ledgerHistoryRef} onChange={(e) => setLedgerHistoryRef(e.target.value)} placeholder="REF-..." style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>SUB LEDGER ID</p>
                <input value={ledgerHistorySubLedger} onChange={(e) => setLedgerHistorySubLedger(e.target.value)} placeholder="customer account number" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>GL ACCOUNT ID</p>
                <input value={ledgerHistoryGl} onChange={(e) => setLedgerHistoryGl(e.target.value)} placeholder="glAccountId" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>FROM DATE</p>
                <input value={ledgerHistoryFromDate} onChange={(e) => setLedgerHistoryFromDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>TO DATE</p>
                <input value={ledgerHistoryToDate} onChange={(e) => setLedgerHistoryToDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Posting Date</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Reference</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Description</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Total</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Entries</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(ledgerHistoryRes?.data ?? []).map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{new Date(r.postingDate).toLocaleString()}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.reference}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.description}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{String(r.totalAmount ?? '-')} {r.currency ?? ''}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.entries?.length ?? 0}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <button
                          disabled={isBusy}
                          onClick={async () => {
                            setIsBusy(true)
                            try {
                              const full = await ledgerApi.getTransaction(r.id)
                              setResultText(JSON.stringify(full, null, 2))
                              triggerToast('Transaction loaded.')
                            } catch {
                              triggerToast('Failed to fetch transaction.')
                            } finally {
                              setIsBusy(false)
                            }
                          }}
                          style={{ ...pagerButtonStyle, padding: '0.45rem 0.65rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!((ledgerHistoryRes?.data ?? []).length) && (
                    <tr>
                      <td colSpan={6} style={{ padding: '0.9rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No ledger entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPager({
              page: ledgerHistoryRes?.page ?? ledgerHistoryPage,
              pageSize: ledgerHistoryRes?.pageSize ?? ledgerHistoryPageSize,
              totalPages: ledgerHistoryRes?.totalPages ?? 1,
              totalItems: ledgerHistoryRes?.totalItems ?? (ledgerHistoryRes?.data ?? []).length,
              onPage: (p) => loadLedgerHistory(p, ledgerHistoryPageSize),
              onPageSize: (ps) => loadLedgerHistory(1, ps),
            })}
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'wallet-transfer') {
      const rows = walletHistoryRes?.data ?? []
      const totalPages = walletHistoryRes?.totalPages ?? 1
      const totalItems = walletHistoryRes?.totalItems ?? rows.length
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Transfer</div>
              <div style={{ marginTop: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>FROM ACCOUNT</p>
                  <input value={walletTransferFrom} onChange={(e) => setWalletTransferFrom(e.target.value)} placeholder="account number" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>TO ACCOUNT</p>
                  <input value={walletTransferTo} onChange={(e) => setWalletTransferTo(e.target.value)} placeholder="account number" style={inputStyle} />
                </div>
                <div>
                  <p style={labelStyle}>AMOUNT</p>
                  <input value={walletTransferAmount} onChange={(e) => setWalletTransferAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <p style={labelStyle}>CURRENCY</p>
                  <input value={walletTransferCurrency} onChange={(e) => setWalletTransferCurrency(e.target.value)} placeholder="NGN" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>DESCRIPTION</p>
                  <input value={walletTransferDesc} onChange={(e) => setWalletTransferDesc(e.target.value)} placeholder="optional" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  disabled={isBusy}
                  onClick={async () => {
                    if (!tenantId) {
                      triggerToast('Tenant is not resolved for this session.')
                      return
                    }
                    const amount = coerceAmount(walletTransferAmount)
                    if (!walletTransferFrom.trim() || !walletTransferTo.trim() || amount === null) {
                      triggerToast('from, to, and amount are required.')
                      return
                    }
                    setIsBusy(true)
                    try {
                      const res = await walletApi.walletTransfer({
                        tenantId,
                        fromAccountNumber: walletTransferFrom.trim(),
                        toAccountNumber: walletTransferTo.trim(),
                        amount,
                        currency: walletTransferCurrency.trim() || undefined,
                        description: walletTransferDesc.trim() || undefined,
                      })
                      showResult(res, 'Wallet transfer submitted.')
                      await loadWalletHistory(1, walletHistoryPageSize)
                    } catch (e) {
                      triggerToast((e as { message?: string } | undefined)?.message ?? 'Wallet transfer failed.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={{ padding: '0.65rem 1.1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 900 }}
                >
                  <Send size={16} />
                  Execute
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Fund</div>
              <div style={{ marginTop: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>ACCOUNT</p>
                  <input value={walletFundingAccount} onChange={(e) => setWalletFundingAccount(e.target.value)} placeholder="account number" style={inputStyle} />
                </div>
                <div>
                  <p style={labelStyle}>AMOUNT</p>
                  <input value={walletFundingAmount} onChange={(e) => setWalletFundingAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <p style={labelStyle}>CURRENCY</p>
                  <input value={walletFundingCurrency} onChange={(e) => setWalletFundingCurrency(e.target.value)} placeholder="NGN" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>DESCRIPTION</p>
                  <input value={walletFundingDesc} onChange={(e) => setWalletFundingDesc(e.target.value)} placeholder="optional" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  disabled={isBusy}
                  onClick={async () => {
                    if (!tenantId) {
                      triggerToast('Tenant is not resolved for this session.')
                      return
                    }
                    const amount = coerceAmount(walletFundingAmount)
                    if (!walletFundingAccount.trim() || amount === null) {
                      triggerToast('account and amount are required.')
                      return
                    }
                    setIsBusy(true)
                    try {
                      const res = await walletApi.walletFund({
                        tenantId,
                        accountNumber: walletFundingAccount.trim(),
                        amount,
                        currency: walletFundingCurrency.trim() || undefined,
                        description: walletFundingDesc.trim() || undefined,
                      })
                      showResult(res, 'Wallet funding submitted.')
                      await loadWalletHistory(1, walletHistoryPageSize)
                    } catch (e) {
                      triggerToast((e as { message?: string } | undefined)?.message ?? 'Wallet funding failed.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={{ padding: '0.65rem 1.1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 900 }}
                >
                  <Send size={16} />
                  Execute
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Withdraw</div>
              <div style={{ marginTop: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>ACCOUNT</p>
                  <input value={walletWithdrawalAccount} onChange={(e) => setWalletWithdrawalAccount(e.target.value)} placeholder="account number" style={inputStyle} />
                </div>
                <div>
                  <p style={labelStyle}>AMOUNT</p>
                  <input value={walletWithdrawalAmount} onChange={(e) => setWalletWithdrawalAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <p style={labelStyle}>CURRENCY</p>
                  <input value={walletWithdrawalCurrency} onChange={(e) => setWalletWithdrawalCurrency(e.target.value)} placeholder="NGN" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={labelStyle}>DESCRIPTION</p>
                  <input value={walletWithdrawalDesc} onChange={(e) => setWalletWithdrawalDesc(e.target.value)} placeholder="optional" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  disabled={isBusy}
                  onClick={async () => {
                    if (!tenantId) {
                      triggerToast('Tenant is not resolved for this session.')
                      return
                    }
                    const amount = coerceAmount(walletWithdrawalAmount)
                    if (!walletWithdrawalAccount.trim() || amount === null) {
                      triggerToast('account and amount are required.')
                      return
                    }
                    setIsBusy(true)
                    try {
                      const res = await walletApi.walletWithdraw({
                        tenantId,
                        accountNumber: walletWithdrawalAccount.trim(),
                        amount,
                        currency: walletWithdrawalCurrency.trim() || undefined,
                        description: walletWithdrawalDesc.trim() || undefined,
                      })
                      showResult(res, 'Wallet withdrawal submitted.')
                      await loadWalletHistory(1, walletHistoryPageSize)
                    } catch (e) {
                      triggerToast((e as { message?: string } | undefined)?.message ?? 'Wallet withdrawal failed.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={{ padding: '0.65rem 1.1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 900 }}
                >
                  <Send size={16} />
                  Execute
                </button>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Wallet Transaction History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Filter and validate wallet postings (customer accounts).
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => loadWalletHistory(1, walletHistoryPageSize)}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>TYPE</p>
                <select value={walletHistoryType} onChange={(e) => setWalletHistoryType(e.target.value as walletApi.WalletTransactionType | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['TRANSFER', 'FUNDING', 'WITHDRAWAL', 'QCOIN_EXCHANGE'] as walletApi.WalletTransactionType[]).map((t) => (
                    <option key={t} value={t} style={{ background: '#111', color: '#fff' }}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>STATUS</p>
                <select value={walletHistoryStatus} onChange={(e) => setWalletHistoryStatus(e.target.value as walletApi.WalletTransactionStatus | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['PENDING', 'POSTED', 'FAILED'] as walletApi.WalletTransactionStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: '#111', color: '#fff' }}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>ACCOUNT</p>
                <input value={walletHistoryAccount} onChange={(e) => setWalletHistoryAccount(e.target.value)} placeholder="account number" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>REFERENCE</p>
                <input value={walletHistoryRef} onChange={(e) => setWalletHistoryRef(e.target.value)} placeholder="WLT-..." style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>FROM DATE</p>
                <input value={walletHistoryFromDate} onChange={(e) => setWalletHistoryFromDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>TO DATE</p>
                <input value={walletHistoryToDate} onChange={(e) => setWalletHistoryToDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Type</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Reference</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>From</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>To</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Journal</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.type}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.status}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.reference}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.fromAccountNumber ?? '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.toAccountNumber ?? '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>
                        {String(r.amount)} {r.currency}
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.journalEntryId ?? '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <button
                          disabled={isBusy}
                          onClick={() => setResultText(JSON.stringify(r, null, 2))}
                          style={{ ...pagerButtonStyle, padding: '0.45rem 0.65rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={9} style={{ padding: '0.9rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No wallet transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPager({
              page: walletHistoryPage,
              pageSize: walletHistoryPageSize,
              totalPages,
              totalItems,
              onPage: (p) => loadWalletHistory(p, walletHistoryPageSize),
              onPageSize: (ps) => loadWalletHistory(1, ps),
            })}
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'local-transfer') {
      const rows = paymentHistoryRes?.data ?? []
      const totalPages = paymentHistoryRes?.totalPages ?? 1
      const totalItems = paymentHistoryRes?.totalItems ?? rows.length
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Internal Transfer</div>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>SOURCE ACCOUNT</p>
                <input value={localTransferSource} onChange={(e) => setLocalTransferSource(e.target.value)} placeholder="account id" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>DESTINATION ACCOUNT</p>
                <input value={localTransferDestination} onChange={(e) => setLocalTransferDestination(e.target.value)} placeholder="account id" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>AMOUNT</p>
                <input value={localTransferAmount} onChange={(e) => setLocalTransferAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>CURRENCY</p>
                <input value={localTransferCurrency} onChange={(e) => setLocalTransferCurrency(e.target.value)} placeholder="NGN" style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={labelStyle}>REFERENCE</p>
                <input value={localTransferReference} onChange={(e) => setLocalTransferReference(e.target.value)} placeholder="optional idempotency reference" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                disabled={isBusy}
                onClick={async () => {
                  if (!tenantId) {
                    triggerToast('Tenant is not resolved for this session.')
                    return
                  }
                  const amount = coerceAmount(localTransferAmount)
                  if (!localTransferSource.trim() || !localTransferDestination.trim() || amount === null) {
                    triggerToast('source, destination, and amount are required.')
                    return
                  }
                  setIsBusy(true)
                  try {
                    const res = await paymentsApi.initiateInternalTransfer({
                      tenantId,
                      sourceAccountId: localTransferSource.trim(),
                      destinationAccountId: localTransferDestination.trim(),
                      amount,
                      currency: localTransferCurrency.trim() || undefined,
                      reference: localTransferReference.trim() || undefined,
                    })
                    showResult(res, 'Internal transfer submitted.')
                    await loadPaymentHistory(1, paymentHistoryPageSize)
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Internal transfer failed.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1.1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 900 }}
              >
                <Send size={16} />
                Execute
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Payment History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Filter local transfer instructions and validate posting outcome.
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => loadPaymentHistory(1, paymentHistoryPageSize)}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>SOURCE ACCOUNT</p>
                <input value={paymentHistorySourceAccount} onChange={(e) => setPaymentHistorySourceAccount(e.target.value)} placeholder="account id" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>STATUS</p>
                <select value={paymentHistoryStatus} onChange={(e) => setPaymentHistoryStatus(e.target.value as paymentsApi.PaymentStatus | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'] as paymentsApi.PaymentStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: '#111', color: '#fff' }}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>RAIL</p>
                <select value={paymentHistoryRail} onChange={(e) => setPaymentHistoryRail(e.target.value as paymentsApi.PaymentRail | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['INTERNAL', 'NIBSS', 'RTGS', 'SWIFT'] as paymentsApi.PaymentRail[]).map((r) => (
                    <option key={r} value={r} style={{ background: '#111', color: '#fff' }}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>FROM DATE</p>
                <input value={paymentHistoryFromDate} onChange={(e) => setPaymentHistoryFromDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>TO DATE</p>
                <input value={paymentHistoryToDate} onChange={(e) => setPaymentHistoryToDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Rail</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Source</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Destination</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Reference</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.rail}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.status}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.sourceAccountId}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.targetAccountId}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{String(r.amount)} {r.currency}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.reference ?? '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <button
                          disabled={isBusy}
                          onClick={() => setResultText(JSON.stringify(r, null, 2))}
                          style={{ ...pagerButtonStyle, padding: '0.45rem 0.65rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0.9rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No payments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPager({
              page: paymentHistoryPage,
              pageSize: paymentHistoryPageSize,
              totalPages,
              totalItems,
              onPage: (p) => loadPaymentHistory(p, paymentHistoryPageSize),
              onPageSize: (ps) => loadPaymentHistory(1, ps),
            })}
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'qcoin-exchange') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>QCoin Exchange</div>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={labelStyle}>CUSTOMER ID</p>
                <input value={qcoinCustomerId} onChange={(e) => setQcoinCustomerId(e.target.value)} placeholder="customer id" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>DIRECTION</p>
                <select value={qcoinDirection} onChange={(e) => setQcoinDirection(e.target.value as walletApi.QCoinExchangeDirection)} style={inputStyle}>
                  <option value="BUY_QCOIN" style={{ background: '#111', color: '#fff' }}>BUY_QCOIN</option>
                  <option value="SELL_QCOIN" style={{ background: '#111', color: '#fff' }}>SELL_QCOIN</option>
                </select>
              </div>
              <div>
                <p style={labelStyle}>FIAT AMOUNT</p>
                <input value={qcoinFiatAmount} onChange={(e) => setQcoinFiatAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>QCOIN AMOUNT</p>
                <input value={qcoinQcoinAmount} onChange={(e) => setQcoinQcoinAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>FIAT CURRENCY</p>
                <input value={qcoinFiatCurrency} onChange={(e) => setQcoinFiatCurrency(e.target.value)} placeholder="NGN" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>QCOIN CURRENCY</p>
                <input value={qcoinQcoinCurrency} onChange={(e) => setQcoinQcoinCurrency(e.target.value)} placeholder="QCN" style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={labelStyle}>DESCRIPTION</p>
                <input value={qcoinDesc} onChange={(e) => setQcoinDesc(e.target.value)} placeholder="optional" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                disabled={isBusy}
                onClick={async () => {
                  if (!tenantId) {
                    triggerToast('Tenant is not resolved for this session.')
                    return
                  }
                  const fiatAmount = coerceAmount(qcoinFiatAmount)
                  const qcoinAmount = coerceAmount(qcoinQcoinAmount)
                  if (!qcoinCustomerId.trim() || fiatAmount === null || qcoinAmount === null) {
                    triggerToast('customerId, fiatAmount, and qcoinAmount are required.')
                    return
                  }
                  setIsBusy(true)
                  try {
                    const res = await walletApi.qcoinExchange({
                      tenantId,
                      customerId: qcoinCustomerId.trim(),
                      direction: qcoinDirection,
                      fiatAmount,
                      qcoinAmount,
                      fiatCurrency: qcoinFiatCurrency.trim() || undefined,
                      qcoinCurrency: qcoinQcoinCurrency.trim() || undefined,
                      description: qcoinDesc.trim() || undefined,
                    })
                    showResult(res, 'QCoin exchange submitted.')
                    setWalletHistoryType('QCOIN_EXCHANGE')
                    await loadWalletHistory(1, walletHistoryPageSize, { type: 'QCOIN_EXCHANGE' })
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'QCoin exchange failed.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1.1rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: 900 }}
              >
                <Send size={16} />
                Execute
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>QCoin Exchange History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  This view is filtered to QCOIN_EXCHANGE.
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => {
                  setWalletHistoryType('QCOIN_EXCHANGE')
                  loadWalletHistory(1, walletHistoryPageSize, { type: 'QCOIN_EXCHANGE' })
                }}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button
                disabled={isBusy}
                onClick={() => handleOpenWorkbench('wallet-transfer')}
                style={{ ...pagerButtonStyle, padding: '0.55rem 0.8rem' }}
              >
                Open Wallet History
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Batch History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Filter batch jobs and validate execution outcomes.
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => loadBatchHistory(1, batchHistoryPageSize)}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>NAME</p>
                <input value={batchHistoryName} onChange={(e) => setBatchHistoryName(e.target.value)} placeholder="contains..." style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>STATUS</p>
                <select value={batchHistoryStatus} onChange={(e) => setBatchHistoryStatus(e.target.value as batchApi.BatchJobStatus | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED'] as batchApi.BatchJobStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: '#111', color: '#fff' }}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>FROM DATE</p>
                <input value={batchHistoryFromDate} onChange={(e) => setBatchHistoryFromDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>TO DATE</p>
                <input value={batchHistoryToDate} onChange={(e) => setBatchHistoryToDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>ID</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Name</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Processed</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Success</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Failed</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(batchHistoryRes?.data ?? []).map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.id}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.name}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.status}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.processedItems}/{r.totalItems}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.successItems}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.failedItems}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <button
                          disabled={isBusy}
                          onClick={async () => {
                            setIsBusy(true)
                            try {
                              const full = await batchApi.getBatch(r.id)
                              setResultText(JSON.stringify(full, null, 2))
                              triggerToast('Batch loaded.')
                            } catch {
                              triggerToast('Failed to fetch batch.')
                            } finally {
                              setIsBusy(false)
                            }
                          }}
                          style={{ ...pagerButtonStyle, padding: '0.45rem 0.65rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!((batchHistoryRes?.data ?? []).length) && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0.9rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No batch jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPager({
              page: batchHistoryRes?.page ?? batchHistoryPage,
              pageSize: batchHistoryRes?.pageSize ?? batchHistoryPageSize,
              totalPages: batchHistoryRes?.totalPages ?? 1,
              totalItems: batchHistoryRes?.totalItems ?? (batchHistoryRes?.data ?? []).length,
              onPage: (p) => loadBatchHistory(p, batchHistoryPageSize),
              onPageSize: (ps) => loadBatchHistory(1, ps),
            })}
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'crypto-payment') {
      return (
        <div style={cardStyle}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Crypto Payment</div>
          <div style={{ marginTop: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
            No crypto payment backend integration is configured in this workspace yet.
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'single-journal') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>POSTING PAYLOAD (JSON)</p>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={14}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '0.75rem', color: '#fff', outline: 'none', fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1.2rem', fontWeight: '800' }}
              onClick={() => {
                const seed: ledgerApi.PostingDto = {
                  reference: 'REF-0001',
                  description: 'Manual journal entry',
                  postingDate: new Date().toISOString(),
                  tenantId: '',
                  entries: [
                    { glAccountId: '', amount: 0, side: 'DEBIT' },
                    { glAccountId: '', amount: 0, side: 'CREDIT' },
                  ],
                }
                setPostText(JSON.stringify(seed, null, 2))
              }}
            >
              Reset
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.2rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '900' }}
              disabled={isBusy}
              onClick={async () => {
                let parsed: ledgerApi.PostingDto
                try {
                  parsed = JSON.parse(postText) as ledgerApi.PostingDto
                } catch {
                  triggerToast('Invalid JSON payload.')
                  return
                }

                if (!tenantId) {
                  triggerToast('Tenant is not resolved for this session.')
                  return
                }

                const finalPayload: ledgerApi.PostingDto = {
                  ...parsed,
                  tenantId: parsed.tenantId || tenantId,
                  postingDate: parsed.postingDate || new Date().toISOString(),
                }

                setIsBusy(true)
                try {
                  const res = await ledgerApi.postTransaction(finalPayload)
                  showResult(res, 'Posting submitted.')
                  await loadLedgerHistory(1, ledgerHistoryPageSize)
                } catch {
                  triggerToast('Failed to post transaction.')
                } finally {
                  setIsBusy(false)
                }
              }}
            >
              Commit
            </button>
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'manual-batch') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Create Batch</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Ingest a batch job, then execute or retry using the batch id.
                </div>
              </div>
              <button
                disabled={isBusy}
                onClick={() => {
                  setBatchName('')
                  setBatchItems([{ sourceAccountId: '', targetAccountId: '', targetBankCode: '', amount: 0, currency: 'NGN' }])
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={labelStyle}>BATCH NAME</p>
                <input value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Payroll May" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>ROWS</p>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', height: '42px' }}>
                  <div style={{ fontWeight: 900, color: '#fff' }}>{batchItems.length}</div>
                  <button
                    disabled={isBusy}
                    onClick={() =>
                      setBatchItems((prev) => [
                        ...prev,
                        { sourceAccountId: '', targetAccountId: '', targetBankCode: '', amount: 0, currency: 'NGN' },
                      ])
                    }
                    style={{
                      background: 'rgba(255,184,0,0.12)',
                      border: '1px solid rgba(255,184,0,0.25)',
                      borderRadius: '0.6rem',
                      color: 'var(--primary)',
                      padding: '0.55rem 0.9rem',
                      cursor: 'pointer',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                    }}
                  >
                    Add row
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Source Account</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Target Account</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Bank Code</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Currency</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {batchItems.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <input
                          value={item.sourceAccountId}
                          onChange={(e) =>
                            setBatchItems((prev) => prev.map((p, i) => (i === idx ? { ...p, sourceAccountId: e.target.value } : p)))
                          }
                          placeholder="sourceAccountId"
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <input
                          value={item.targetAccountId}
                          onChange={(e) =>
                            setBatchItems((prev) => prev.map((p, i) => (i === idx ? { ...p, targetAccountId: e.target.value } : p)))
                          }
                          placeholder="targetAccountId"
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <input
                          value={item.targetBankCode ?? ''}
                          onChange={(e) =>
                            setBatchItems((prev) => prev.map((p, i) => (i === idx ? { ...p, targetBankCode: e.target.value } : p)))
                          }
                          placeholder="Optional"
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <input
                          value={String(item.amount ?? '')}
                          onChange={(e) => {
                            const amt = coerceAmount(e.target.value)
                            setBatchItems((prev) => prev.map((p, i) => (i === idx ? { ...p, amount: amt ?? 0 } : p)))
                          }}
                          placeholder="0"
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <input
                          value={item.currency ?? ''}
                          onChange={(e) =>
                            setBatchItems((prev) => prev.map((p, i) => (i === idx ? { ...p, currency: e.target.value } : p)))
                          }
                          placeholder="NGN"
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: '0.55rem 0.5rem' }}>
                        <button
                          disabled={isBusy || batchItems.length <= 1}
                          onClick={() => setBatchItems((prev) => prev.filter((_, i) => i !== idx))}
                          style={{
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '0.6rem',
                            color: '#ef4444',
                            padding: '0.55rem 0.85rem',
                            cursor: 'pointer',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.2rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '900' }}
                disabled={isBusy}
                onClick={async () => {
                  if (!tenantId) {
                    triggerToast('Tenant is not resolved for this session.')
                    return
                  }
                  if (!userId) {
                    triggerToast('User is not resolved for this session.')
                    return
                  }
                  const name = batchName.trim()
                  if (!name) {
                    triggerToast('Batch name is required.')
                    return
                  }
                  const items = batchItems
                    .map((i) => ({
                      sourceAccountId: i.sourceAccountId?.trim(),
                      targetAccountId: i.targetAccountId?.trim(),
                      targetBankCode: i.targetBankCode?.trim() || undefined,
                      amount: i.amount,
                      currency: i.currency?.trim() || undefined,
                    }))
                    .filter((i) => i.sourceAccountId && i.targetAccountId)

                  if (items.length === 0) {
                    triggerToast('At least one valid batch row is required.')
                    return
                  }

                  setIsBusy(true)
                  try {
                    const res = await batchApi.createBatch({ name, tenantId, createdBy: userId, items })
                    setResultText(JSON.stringify(res, null, 2))
                    const maybeId = (res as { id?: string } | undefined)?.id
                    if (maybeId) setBatchId(maybeId)
                    triggerToast('Batch ingested.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to ingest batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                Ingest Batch
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Batch Actions</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
              Use batch id to fetch status, execute, or retry failed items.
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.75rem' }}>
              <input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="batch id" style={inputStyle} />
              <button
                className="btn btn-secondary"
                disabled={isBusy || !batchId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await batchApi.getBatch(batchId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Batch loaded.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
              >
                Get
              </button>
              <button
                className="btn btn-secondary"
                disabled={isBusy || !batchId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await batchApi.executeBatch(batchId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Batch execution started.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to execute batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
              >
                Execute
              </button>
              <button
                className="btn btn-secondary"
                disabled={isBusy || !batchId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await batchApi.retryBatch(batchId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Batch retry started.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to retry batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'batch-upload') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Upload Batch</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  CSV/XLSX expected headers: sourceAccountId, targetAccountId, targetBankCode, amount, currency
                </div>
              </div>
              <button
                disabled={isBusy}
                onClick={() => {
                  setBatchUploadName('')
                  setBatchUploadFileLabel('')
                  setBatchUploadItems([])
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={labelStyle}>BATCH NAME</p>
                <input
                  value={batchUploadName}
                  onChange={(e) => setBatchUploadName(e.target.value)}
                  placeholder="e.g. Bulk payouts"
                  style={inputStyle}
                />
              </div>
              <div>
                <p style={labelStyle}>FILE</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={isBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setIsBusy(true)
                    try {
                      const parsed = await parseUploadTable(file, { maxRows: 5000, maxBytes: 5 * 1024 * 1024 })
                      const idxSource = pickHeaderIndex(parsed.headers, ['sourceAccountId', 'source_account_id', 'source'])
                      const idxTarget = pickHeaderIndex(parsed.headers, ['targetAccountId', 'target_account_id', 'target'])
                      const idxBank = pickHeaderIndex(parsed.headers, ['targetBankCode', 'target_bank_code', 'bankCode', 'bank_code'])
                      const idxAmount = pickHeaderIndex(parsed.headers, ['amount'])
                      const idxCurrency = pickHeaderIndex(parsed.headers, ['currency'])

                      if (idxSource < 0 || idxTarget < 0 || idxAmount < 0) {
                        triggerToast('Missing required headers: sourceAccountId, targetAccountId, amount.')
                        setBatchUploadFileLabel('')
                        setBatchUploadItems([])
                        return
                      }

                      const items: batchApi.BatchItemDto[] = []
                      for (const row of parsed.rows) {
                        const sourceAccountId = (row[idxSource] ?? '').trim()
                        const targetAccountId = (row[idxTarget] ?? '').trim()
                        const amountStr = row[idxAmount] ?? ''
                        const amount = coerceAmount(amountStr)
                        if (!sourceAccountId || !targetAccountId || amount === null) continue
                        items.push({
                          sourceAccountId,
                          targetAccountId,
                          targetBankCode: idxBank >= 0 ? (row[idxBank] ?? '').trim() || undefined : undefined,
                          amount,
                          currency: idxCurrency >= 0 ? (row[idxCurrency] ?? '').trim() || undefined : undefined,
                        })
                      }

                      setBatchUploadFileLabel(`${file.name} (${items.length} rows)`)
                      setBatchUploadItems(items)
                      triggerToast('File parsed.')
                    } catch (err) {
                      triggerToast((err as { message?: string } | undefined)?.message ?? 'Failed to parse file.')
                      setBatchUploadFileLabel('')
                      setBatchUploadItems([])
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={inputStyle}
                />
                {batchUploadFileLabel && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                    {batchUploadFileLabel}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Source</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Target</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Bank</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {batchUploadItems.slice(0, 25).map((r, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 800, fontSize: '0.82rem' }}>{r.sourceAccountId}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 800, fontSize: '0.82rem' }}>{r.targetAccountId}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 800, fontSize: '0.82rem' }}>{r.targetBankCode ?? '-'}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 900, fontSize: '0.82rem' }}>{r.amount}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 800, fontSize: '0.82rem' }}>{r.currency ?? 'NGN'}</td>
                    </tr>
                  ))}
                  {batchUploadItems.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '0.85rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No rows loaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.2rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '900' }}
                disabled={isBusy || batchUploadItems.length === 0}
                onClick={async () => {
                  if (!tenantId) {
                    triggerToast('Tenant is not resolved for this session.')
                    return
                  }
                  if (!userId) {
                    triggerToast('User is not resolved for this session.')
                    return
                  }
                  const name = batchUploadName.trim()
                  if (!name) {
                    triggerToast('Batch name is required.')
                    return
                  }
                  setIsBusy(true)
                  try {
                    const res = await batchApi.createBatch({ name, tenantId, createdBy: userId, items: batchUploadItems })
                    setResultText(JSON.stringify(res, null, 2))
                    const maybeId = (res as { id?: string } | undefined)?.id
                    if (maybeId) setBatchId(maybeId)
                    triggerToast('Batch ingested.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to ingest batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                Ingest Batch
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Batch Actions</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
              Use batch id to fetch status, execute, or retry failed items.
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '0.75rem' }}>
              <input value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="batch id" style={inputStyle} />
              <button
                className="btn btn-secondary"
                disabled={isBusy || !batchId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await batchApi.getBatch(batchId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Batch loaded.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
              >
                Get
              </button>
              <button
                className="btn btn-secondary"
                disabled={isBusy || !batchId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await batchApi.executeBatch(batchId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Batch execution started.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to execute batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
              >
                Execute
              </button>
              <button
                className="btn btn-secondary"
                disabled={isBusy || !batchId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await batchApi.retryBatch(batchId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Batch retry started.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to retry batch.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'manual-reversal') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Create Reversal</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Create a reversal record for an original transaction id.
                </div>
              </div>
              <button
                disabled={isBusy}
                onClick={() => {
                  setReversalOriginalTransactionId('')
                  setReversalReason('TECHNICAL_ERROR')
                  setReversalReasonDescription('')
                  setReversalType('FULL_REVERSAL')
                  setReversalAmount('')
                  setReversalBypassApproval(false)
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={labelStyle}>ORIGINAL TRANSACTION ID</p>
                <input
                  value={reversalOriginalTransactionId}
                  onChange={(e) => setReversalOriginalTransactionId(e.target.value)}
                  placeholder="ledger transaction id"
                  style={inputStyle}
                />
              </div>
              <div>
                <p style={labelStyle}>TYPE</p>
                <select value={reversalType} onChange={(e) => setReversalType(e.target.value as reversalApi.ReversalType)} style={inputStyle}>
                  <option value="FULL_REVERSAL">FULL_REVERSAL</option>
                  <option value="PARTIAL_REVERSAL">PARTIAL_REVERSAL</option>
                  <option value="CHARGEBACK">CHARGEBACK</option>
                </select>
              </div>
              <div>
                <p style={labelStyle}>REASON</p>
                <select value={reversalReason} onChange={(e) => setReversalReason(e.target.value as reversalApi.ReversalReason)} style={inputStyle}>
                  <option value="DUPLICATE_PAYMENT">DUPLICATE_PAYMENT</option>
                  <option value="WRONG_RECIPIENT">WRONG_RECIPIENT</option>
                  <option value="FRAUD_SUSPECTED">FRAUD_SUSPECTED</option>
                  <option value="TECHNICAL_ERROR">TECHNICAL_ERROR</option>
                  <option value="CUSTOMER_REQUEST">CUSTOMER_REQUEST</option>
                </select>
              </div>
              <div>
                <p style={labelStyle}>AMOUNT (OPTIONAL)</p>
                <input value={reversalAmount} onChange={(e) => setReversalAmount(e.target.value)} placeholder="Only for partial reversal" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <p style={labelStyle}>REASON DESCRIPTION (OPTIONAL)</p>
              <input
                value={reversalReasonDescription}
                onChange={(e) => setReversalReasonDescription(e.target.value)}
                placeholder="Optional notes"
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                checked={reversalBypassApproval}
                onChange={(e) => setReversalBypassApproval(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 900 }}>Bypass approval</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.2rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '900' }}
                disabled={isBusy}
                onClick={async () => {
                  if (!tenantId) {
                    triggerToast('Tenant is not resolved for this session.')
                    return
                  }
                  if (!userId) {
                    triggerToast('User is not resolved for this session.')
                    return
                  }
                  if (!reversalOriginalTransactionId.trim()) {
                    triggerToast('Original transaction id is required.')
                    return
                  }

                  const amount = reversalAmount.trim() ? coerceAmount(reversalAmount) : undefined
                  if (reversalAmount.trim() && amount === null) {
                    triggerToast('Invalid amount.')
                    return
                  }

                  setIsBusy(true)
                  try {
                    const res = await reversalApi.createReversal(
                      {
                        tenantId,
                        requestedBy: userId,
                        originalTransactionId: reversalOriginalTransactionId.trim(),
                        reason: reversalReason,
                        reasonDescription: reversalReasonDescription.trim() || undefined,
                        type: reversalType,
                        amount: amount ?? undefined,
                      },
                      { bypassApproval: reversalBypassApproval },
                    )
                    showResult(res, 'Reversal submitted.')
                    const maybeId = (res as { id?: string } | undefined)?.id
                    if (maybeId) setReversalId(maybeId)
                    await loadReversalHistory(1, reversalHistoryPageSize)
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to create reversal.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Reversal Lookup</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>Fetch reversal record by id.</div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <input value={reversalId} onChange={(e) => setReversalId(e.target.value)} placeholder="reversal id" style={inputStyle} />
              <button
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
                disabled={isBusy || !reversalId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await reversalApi.getReversal(reversalId.trim())
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Reversal loaded.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load reversal.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                Get
              </button>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Reversal History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Filter reversals and validate completion/failed outcomes.
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => loadReversalHistory(1, reversalHistoryPageSize)}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>STATUS</p>
                <select value={reversalHistoryStatus} onChange={(e) => setReversalHistoryStatus(e.target.value as reversalApi.ReversalStatus | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED'] as reversalApi.ReversalStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: '#111', color: '#fff' }}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>TYPE</p>
                <select value={reversalHistoryType} onChange={(e) => setReversalHistoryType(e.target.value as reversalApi.ReversalType | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['FULL_REVERSAL', 'PARTIAL_REVERSAL', 'CHARGEBACK'] as reversalApi.ReversalType[]).map((t) => (
                    <option key={t} value={t} style={{ background: '#111', color: '#fff' }}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>ORIGINAL TX ID</p>
                <input value={reversalHistoryOriginalId} onChange={(e) => setReversalHistoryOriginalId(e.target.value)} placeholder="ledger tx id" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>FROM DATE</p>
                <input value={reversalHistoryFromDate} onChange={(e) => setReversalHistoryFromDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>TO DATE</p>
                <input value={reversalHistoryToDate} onChange={(e) => setReversalHistoryToDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1300px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>ID</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Type</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Original Tx</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Reversal Tx</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(reversalHistoryRes?.data ?? []).map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.id}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.status}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.type}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.originalTransactionId}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.reversalTransactionId ?? '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{String(r.amount)} {r.currency}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <button
                          disabled={isBusy}
                          onClick={() => setResultText(JSON.stringify(r, null, 2))}
                          style={{ ...pagerButtonStyle, padding: '0.45rem 0.65rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!((reversalHistoryRes?.data ?? []).length) && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0.9rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No reversals found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPager({
              page: reversalHistoryRes?.page ?? reversalHistoryPage,
              pageSize: reversalHistoryRes?.pageSize ?? reversalHistoryPageSize,
              totalPages: reversalHistoryRes?.totalPages ?? 1,
              totalItems: reversalHistoryRes?.totalItems ?? (reversalHistoryRes?.data ?? []).length,
              onPage: (p) => loadReversalHistory(p, reversalHistoryPageSize),
              onPageSize: (ps) => loadReversalHistory(1, ps),
            })}
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'reversal-upload') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Upload Reversals</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  CSV/XLSX expected headers: originalTransactionId, reason, type, amount, reasonDescription
                </div>
              </div>
              <button
                disabled={isBusy}
                onClick={() => {
                  setReversalUploadFileLabel('')
                  setReversalUploadItems([])
                  setReversalUploadSummary(null)
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.7rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={labelStyle}>FILE</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  disabled={isBusy}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setIsBusy(true)
                    try {
                      const parsed = await parseUploadTable(file, { maxRows: 5000, maxBytes: 5 * 1024 * 1024 })
                      const idxOriginal = pickHeaderIndex(parsed.headers, ['originalTransactionId', 'original_transaction_id', 'transactionId'])
                      const idxReason = pickHeaderIndex(parsed.headers, ['reason'])
                      const idxType = pickHeaderIndex(parsed.headers, ['type'])
                      const idxAmount = pickHeaderIndex(parsed.headers, ['amount'])
                      const idxReasonDesc = pickHeaderIndex(parsed.headers, ['reasonDescription', 'reason_description', 'description'])

                      if (idxOriginal < 0 || idxReason < 0) {
                        triggerToast('Missing required headers: originalTransactionId, reason.')
                        setReversalUploadFileLabel('')
                        setReversalUploadItems([])
                        return
                      }

                      const items: Array<
                        Pick<reversalApi.CreateReversalDto, 'originalTransactionId' | 'reason' | 'reasonDescription' | 'type' | 'amount'>
                      > = []
                      for (const row of parsed.rows) {
                        const originalTransactionId = (row[idxOriginal] ?? '').trim()
                        const reason = parseReversalReason(row[idxReason] ?? '')
                        if (!originalTransactionId || !reason) continue
                        const type = idxType >= 0 ? parseReversalType(row[idxType] ?? '') : null
                        const amount = idxAmount >= 0 ? coerceAmount(row[idxAmount] ?? '') : null
                        const reasonDescription = idxReasonDesc >= 0 ? (row[idxReasonDesc] ?? '').trim() : ''
                        items.push({
                          originalTransactionId,
                          reason,
                          type: type ?? undefined,
                          amount: amount === null ? undefined : amount,
                          reasonDescription: reasonDescription || undefined,
                        })
                      }

                      setReversalUploadFileLabel(`${file.name} (${items.length} rows)`)
                      setReversalUploadItems(items)
                      setReversalUploadSummary(null)
                      triggerToast('File parsed.')
                    } catch (err) {
                      triggerToast((err as { message?: string } | undefined)?.message ?? 'Failed to parse file.')
                      setReversalUploadFileLabel('')
                      setReversalUploadItems([])
                      setReversalUploadSummary(null)
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={inputStyle}
                />
                {reversalUploadFileLabel && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                    {reversalUploadFileLabel}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  {reversalUploadItems.length} reversals queued
                </div>
                <button
                  className="btn btn-primary"
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.65rem 1.2rem',
                    background: 'var(--primary)',
                    color: '#000',
                    border: 'none',
                    fontWeight: '900',
                  }}
                  disabled={isBusy || reversalUploadItems.length === 0}
                  onClick={async () => {
                    if (!tenantId) {
                      triggerToast('Tenant is not resolved for this session.')
                      return
                    }
                    if (!userId) {
                      triggerToast('User is not resolved for this session.')
                      return
                    }

                    setIsBusy(true)
                    try {
                      let succeeded = 0
                      let failed = 0
                      const errors: string[] = []

                      for (let i = 0; i < reversalUploadItems.length; i++) {
                        const item = reversalUploadItems[i]
                        try {
                          const res = await reversalApi.createReversal(
                            {
                              tenantId,
                              requestedBy: userId,
                              originalTransactionId: item.originalTransactionId,
                              reason: item.reason,
                              reasonDescription: item.reasonDescription,
                              type: item.type,
                              amount: item.amount,
                            },
                            { bypassApproval: reversalBypassApproval },
                          )
                          succeeded++
                          setResultText(JSON.stringify(res, null, 2))
                        } catch (e) {
                          failed++
                          errors.push(
                            `Row ${i + 1} (${item.originalTransactionId}): ${(e as { message?: string } | undefined)?.message ?? 'failed'}`,
                          )
                        }
                      }

                      setReversalUploadSummary({ total: reversalUploadItems.length, succeeded, failed, errors })
                      triggerToast('Upload processing completed.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                >
                  Submit All
                </button>
              </div>
            </div>

            {reversalUploadSummary && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 900 }}>
                  Result: {reversalUploadSummary.succeeded} succeeded, {reversalUploadSummary.failed} failed (total {reversalUploadSummary.total})
                </div>
                {reversalUploadSummary.errors.length > 0 && (
                  <pre
                    style={{
                      marginTop: '0.75rem',
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      color: '#fff',
                      fontSize: '0.78rem',
                      maxHeight: '220px',
                    }}
                  >
                    {reversalUploadSummary.errors.join('\n')}
                  </pre>
                )}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>LAST RESPONSE</div>
            <pre
              style={{
                marginTop: '0.5rem',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem',
                padding: '1rem',
                overflowX: 'auto',
                minHeight: '240px',
                whiteSpace: 'pre-wrap',
                color: '#fff',
              }}
            >
              {resultText || 'No response loaded yet.'}
            </pre>
          </div>
        </div>
      )
    }

    if (activeWorkbench === 'retry-ops') {
      const renderRetryTable = (rows: retryApi.RetryRecord[]) => (
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1040px' }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>ID</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Target</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Operation</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Attempts</th>
                <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Next Attempt</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  onClick={() => {
                    setRetrySelected(r)
                    setRetryRecordId(r.id)
                    setResultText(JSON.stringify(r, null, 2))
                  }}
                >
                  <td style={{ padding: '0.85rem 0.5rem', fontWeight: 900, color: 'var(--primary)' }}>{r.status}</td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.78rem', fontWeight: 900, color: '#fff' }}>{r.id}</td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                    {r.targetType}:{r.targetId}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>{r.operation}</td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.78rem', fontWeight: 900, color: '#fff' }}>
                    {r.attemptCount}/{r.maxAttempts}
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                    {r.nextAttemptAt ? new Date(r.nextAttemptAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                    No records loaded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>Retry Dashboard</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Load dashboard metrics, due queue, and full list by tenant.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  disabled={isBusy || !tenantId}
                  onClick={async () => {
                    if (!tenantId) return
                    setIsBusy(true)
                    try {
                      const res = await retryApi.getRetryDashboard(tenantId)
                      setRetryDashboard(JSON.stringify(res, null, 2))
                      triggerToast('Dashboard loaded.')
                    } catch (e) {
                      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load dashboard.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={{
                    background: 'rgba(255,184,0,0.12)',
                    border: '1px solid rgba(255,184,0,0.25)',
                    borderRadius: '0.6rem',
                    color: 'var(--primary)',
                    padding: '0.55rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Load dashboard
                </button>
                <button
                  disabled={isBusy || !tenantId}
                  onClick={async () => {
                    if (!tenantId) return
                    setIsBusy(true)
                    try {
                      const res = await retryApi.getDueRetries(tenantId)
                      setRetryDue(res)
                      res.forEach(upsertRetry)
                      triggerToast('Due retries loaded.')
                    } catch (e) {
                      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load due retries.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.6rem',
                    color: '#fff',
                    padding: '0.55rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Load due
                </button>
                <button
                  disabled={isBusy || !tenantId}
                  onClick={async () => {
                    if (!tenantId) return
                    setIsBusy(true)
                    try {
                      const res = await retryApi.listRetries(tenantId)
                      setRetryAll(res)
                      triggerToast('Retry list loaded.')
                    } catch (e) {
                      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load retries.')
                    } finally {
                      setIsBusy(false)
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.6rem',
                    color: '#fff',
                    padding: '0.55rem 0.9rem',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                  }}
                >
                  Load all
                </button>
              </div>
            </div>

            <pre
              style={{
                marginTop: '1rem',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem',
                padding: '1rem',
                overflowX: 'auto',
                minHeight: '180px',
                whiteSpace: 'pre-wrap',
                color: '#fff',
              }}
            >
              {retryDashboard || 'No dashboard loaded yet.'}
            </pre>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Due Retries</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>{retryDue.length} records</div>
              </div>
              <button
                disabled={isBusy}
                onClick={() => {
                  setRetryDue([])
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.6rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Clear
              </button>
            </div>
            {renderRetryTable(retryDue)}
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>All Retries</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>{retryAll.length} records</div>
              </div>
              <button
                disabled={isBusy}
                onClick={() => {
                  setRetryAll([])
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.6rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Clear
              </button>
            </div>
            {renderRetryTable(retryAll)}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Retry Actions</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
              Select a record from the tables or paste an id below.
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <input value={retryRecordId} onChange={(e) => setRetryRecordId(e.target.value)} placeholder="retry record id" style={inputStyle} />
              <button
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1rem', fontWeight: '800' }}
                disabled={isBusy || !retryRecordId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await retryApi.getRetryRecord(retryRecordId.trim())
                    setRetrySelected(res)
                    upsertRetry(res)
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Retry record loaded.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to load retry record.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
              >
                Get
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={labelStyle}>FAILURE ERROR (FOR /failed)</p>
                <input value={retryFailureError} onChange={(e) => setRetryFailureError(e.target.value)} placeholder="error message" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>COMPENSATE REASON</p>
                <input
                  value={retryCompensateReason}
                  onChange={(e) => setRetryCompensateReason(e.target.value)}
                  placeholder="compensation reason"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                disabled={isBusy || !retryRecordId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await retryApi.markRetrying(retryRecordId.trim())
                    setRetrySelected(res)
                    upsertRetry(res)
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Marked retrying.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to mark retrying.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{
                  background: 'rgba(255,184,0,0.12)',
                  border: '1px solid rgba(255,184,0,0.25)',
                  borderRadius: '0.6rem',
                  color: 'var(--primary)',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Mark retrying
              </button>
              <button
                disabled={isBusy || !retryRecordId.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await retryApi.markSucceeded(retryRecordId.trim())
                    setRetrySelected(res)
                    upsertRetry(res)
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Marked succeeded.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to mark succeeded.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.6rem',
                  color: '#10b981',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Mark succeeded
              </button>
              <button
                disabled={isBusy || !retryRecordId.trim() || !retryFailureError.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await retryApi.markFailed(retryRecordId.trim(), { error: retryFailureError.trim() })
                    setRetrySelected(res)
                    upsertRetry(res)
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Failure recorded.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to record failure.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.6rem',
                  color: '#ef4444',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Record failed
              </button>
              <button
                disabled={isBusy || !retryRecordId.trim() || !retryCompensateReason.trim()}
                onClick={async () => {
                  setIsBusy(true)
                  try {
                    const res = await retryApi.compensate(retryRecordId.trim(), { reason: retryCompensateReason.trim() })
                    setRetrySelected(res)
                    upsertRetry(res)
                    setResultText(JSON.stringify(res, null, 2))
                    triggerToast('Compensation requested.')
                  } catch (e) {
                    triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to compensate.')
                  } finally {
                    setIsBusy(false)
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.6rem',
                  color: '#fff',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                }}
              >
                Compensate
              </button>
            </div>

            {retrySelected && (
              <pre
                style={{
                  marginTop: '1rem',
                  background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: '#fff',
                  maxHeight: '260px',
                }}
              >
                {JSON.stringify(retrySelected, null, 2)}
              </pre>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff' }}>Retry History</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                  Filter retry records and validate state transitions.
                </div>
              </div>
              <button
                className="btn btn-secondary"
                disabled={isBusy}
                onClick={() => loadRetryHistory(1, retryHistoryPageSize)}
                style={{ padding: '0.6rem 1rem', fontWeight: 900 }}
              >
                Fetch
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <p style={labelStyle}>STATUS</p>
                <select value={retryHistoryStatus} onChange={(e) => setRetryHistoryStatus(e.target.value as retryApi.RetryRecordStatus | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['PENDING', 'RETRYING', 'SUCCEEDED', 'FAILED', 'COMPENSATING', 'COMPENSATED'] as retryApi.RetryRecordStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: '#111', color: '#fff' }}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>TARGET TYPE</p>
                <select value={retryHistoryTargetType} onChange={(e) => setRetryHistoryTargetType(e.target.value as retryApi.RetryTargetType | '')} style={inputStyle}>
                  <option value="" style={{ background: '#111', color: '#fff' }}>All</option>
                  {(['BATCH_JOB', 'BATCH_ITEM', 'PAYMENT', 'REVERSAL', 'LEDGER_POSTING', 'WEBHOOK'] as retryApi.RetryTargetType[]).map((t) => (
                    <option key={t} value={t} style={{ background: '#111', color: '#fff' }}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={labelStyle}>FROM DATE</p>
                <input value={retryHistoryFromDate} onChange={(e) => setRetryHistoryFromDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
              <div>
                <p style={labelStyle}>TO DATE</p>
                <input value={retryHistoryToDate} onChange={(e) => setRetryHistoryToDate(e.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1350px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Created</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Status</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>ID</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Target</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Operation</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Attempts</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Next Attempt</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(retryHistoryRes?.data ?? []).map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.status}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.id}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
                        {r.targetType}:{r.targetId}
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.operation}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>{r.attemptCount}/{r.maxAttempts}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{r.nextAttemptAt ? new Date(r.nextAttemptAt).toLocaleString() : '-'}</td>
                      <td style={{ padding: '0.7rem 0.5rem' }}>
                        <button
                          disabled={isBusy}
                          onClick={() => {
                            setRetrySelected(r)
                            setRetryRecordId(r.id)
                            setResultText(JSON.stringify(r, null, 2))
                          }}
                          style={{ ...pagerButtonStyle, padding: '0.45rem 0.65rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!((retryHistoryRes?.data ?? []).length) && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0.9rem 0.5rem', color: 'var(--foreground-muted)', fontWeight: 800 }}>
                        No retry records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPager({
              page: retryHistoryRes?.page ?? retryHistoryPage,
              pageSize: retryHistoryRes?.pageSize ?? retryHistoryPageSize,
              totalPages: retryHistoryRes?.totalPages ?? 1,
              totalItems: retryHistoryRes?.totalItems ?? (retryHistoryRes?.data ?? []).length,
              onPage: (p) => loadRetryHistory(p, retryHistoryPageSize),
              onPageSize: (ps) => loadRetryHistory(1, ps),
            })}
          </div>

          <div style={cardStyle}>
            <div style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: '800' }}>LAST RESPONSE</div>
            <pre
              style={{
                marginTop: '0.5rem',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem',
                padding: '1rem',
                overflowX: 'auto',
                minHeight: '180px',
                whiteSpace: 'pre-wrap',
                color: '#fff',
              }}
            >
              {resultText || 'No response loaded yet.'}
            </pre>
          </div>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', opacity: 0.6 }}>
        <Send size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Workbench Initializing...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>
          Interface for {getActiveTitle()} is currently undergoing secure boot sequence.
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {activeWorkbench === null ? (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Send size={24} style={{ color: 'var(--primary)' }} /> Accounting & Postings Module
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.4rem' }}>
              Select a workbench below to execute financial transactions, journal entries, or bulk processing tasks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {modules.map((mod) => (
              <div 
                key={mod.id}
                onClick={() => handleOpenWorkbench(mod.id as WorkbenchType)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,184,0,0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255,184,0,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--primary)', background: 'rgba(255,184,0,0.1)', padding: '0.6rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {mod.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{mod.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>{mod.description}</p>
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--foreground-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2.5rem', minHeight: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <button 
              onClick={() => setActiveWorkbench(null)} 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Back to Modules"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', color: '#fff' }}>
                {getActiveTitle()}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 'bold' }}>
                SECURE WORKBENCH ACTIVE
              </p>
            </div>
          </div>

          {renderWorkbench()}
        </div>
      )}
    </div>
  );
}
