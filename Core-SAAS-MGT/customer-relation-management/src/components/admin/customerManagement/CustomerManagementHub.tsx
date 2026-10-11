import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle,
  Wallet, CreditCard, ArrowDownRight, Activity, TrendingUp, DollarSign,
  ArrowRight, FileText, ShieldCheck, Banknote, UserCog, UserCircle, ShieldAlert
} from 'lucide-react';
import {
  listRiders, createCustomer, updateCustomer,
  deleteCustomer, getCustomer, customerFullName,
  type Customer, type CreateCustomerPayload, type UpdateCustomerPayload,
} from '../../../api/customers';
import { useCurrency, QUICK_CURRENCIES, ALL_CURRENCIES } from '../../../hooks/useCurrency';
import Pagination from '../../Pagination';

type CustomerSubPage = 'customer-info' | 'kyc-info' | 'loan-summary' | 'overdraft-summary' | 'manage-account' | null;

// ─── ENTERPRISE CUSTOMER ACCOUNT INTERFACE ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LocalCustomer {
  // Core Identity
  id: string;
  customerId: string;            // FK → customer profile
  accountNumber: string;
  accountName: string;           // Display name on account
  name: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  nationality: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | '';
  occupation: string;
  employerName: string;
  monthlyIncome: number;
  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  // Account Profile
  accountType: 'SAVINGS' | 'CURRENT' | 'WALLET' | 'ESCROW' | 'PREMIUM' | 'CORPORATE' | 'BUSINESS';
  accountTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'DORMANT' | 'FROZEN' | 'CLOSED';
  segment: 'RETAIL' | 'SME' | 'CORPORATE' | 'HNI';
  currency: string;              // ISO 4217: NGN, USD, EUR…
  ledgerCode: string;            // Accounting ledger mapping
  branchCode: string;            // branch_id reference
  assignedOfficer: string;
  dateOpened: string;            // opened_at
  closedAt: string;              // closed_at (nullable)
  lastActivityDate: string;
  totalTrips: number;
  rating: number;
  // Balance & Financial Fields
  availableBalance: number;      // Spendable balance
  ledgerBalance: number;         // Actual accounting balance
  pendingBalance: number;        // Holds / pending transactions
  walletBalance: number;
  overdraftLimit: number;
  minimumBalance: number;
  accruedInterest: number;
  lastTransactionAt: string;
  dailyTransactionLimit: number;
  singleTransactionLimit: number;
  monthlyTransactionLimit: number;
  // Compliance & Risk
  kycStatus: 'VERIFIED' | 'PENDING' | 'FAILED' | 'EXPIRED';
  kycTier: 'BASIC' | 'STANDARD' | 'ENHANCED';
  bvnNumber: string;
  ninNumber: string;
  idType: 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'VOTERS_CARD' | '';
  idNumber: string;
  idExpiryDate: string;
  pepStatus: boolean;            // pep_flag
  amlFlag: boolean;              // aml_flag (boolean)
  sanctionScreenStatus: 'CLEAR' | 'FLAGGED' | 'PENDING';
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  amlStatus: 'CLEAR' | 'UNDER_REVIEW' | 'FLAGGED';
  fraudScore: number;            // 0–100 AI/manual fraud score
  frozenReason: string;          // Why account is frozen
  fatcaStatus: boolean;
  // Authentication & Security
  pinHash: string;               // Transaction PIN hash
  failedAttempts: number;        // Failed auth attempts
  lockedUntil: string;           // Temporary lock timestamp
  lastLoginAt: string;
  twoFaEnabled: boolean;         // 2FA / MFA
  deviceTrustScore: number;      // Device risk level 0–100
  // Loan Summary
  activeLoanCount: number;
  totalLoanExposure: number;
  principalOutstanding: number;
  interestAccrued: number;
  loanStatus: 'NONE' | 'CURRENT' | 'OVERDUE' | 'NPL' | 'WRITTEN_OFF';
  creditScore: number;
  debtServiceRatio: number;
  lastLoanDisbursementDate: string;
  nextRepaymentDate: string;
  nextRepaymentAmount: number;
  // Overdraft Summary
  overdraftEnabled: boolean;
  overdraftUtilized: number;
  overdraftAvailable: number;
  overdraftInterestRate: number;
  overdraftExpiryDate: string;
  overdraftStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  overdraftReviewDate: string;
  // Audit Trail
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;             // Soft delete
}

interface CustomerManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  pndTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
  selectCustomerId?: string;
  selectCustomerTrigger?: number;
}

export default function CustomerManagementHub({ triggerToast, addNewTrigger, pndTrigger, onViewChange, selectCustomerId, selectCustomerTrigger }: CustomerManagementHubProps) {
  const currency = useCurrency()
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false)
  const [currencySearch, setCurrencySearch] = useState('')
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeSubPage, setActiveSubPage] = useState<CustomerSubPage>(null);

  // Modals state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // PND State
  type PndTypeId = 'bank' | 'kyc' | 'fraud' | 'transaction' | 'user';
  interface PndEntry { id: string; label: string; active: boolean; reason: string; comments: string; }
  type PndSets = Record<PndTypeId, PndEntry[]>;

  const pndTypesMeta = [
    { id: 'bank' as PndTypeId, label: 'Bank PND', desc: 'Restricts bank-related transactions and transfers.' },
    { id: 'kyc' as PndTypeId, label: 'KYC PND', desc: 'Locks account pending identity verification.' },
    { id: 'fraud' as PndTypeId, label: 'Fraud PND', desc: 'Emergency block for suspicious activity.' },
    { id: 'transaction' as PndTypeId, label: 'Transaction PND', desc: 'Freezes all debit transactions.' },
    { id: 'user' as PndTypeId, label: 'User PND', desc: 'Manually placed by an account officer.' },
  ];
  const pndReasonOptions = ['Compliance Requirement', 'Court Order', 'Customer Request', 'Fraud Suspected', 'KYC Incomplete', 'Regulatory Hold', 'Other'];

  const [showPndWizard, setShowPndWizard] = useState(false);
  const [formTab, setFormTab] = useState<'personal' | 'account' | 'kyc' | 'loan'>('personal');
  const [activePndTypeId, setActivePndTypeId] = useState<PndTypeId | null>(null);
  const [selectedPndEntry, setSelectedPndEntry] = useState<PndEntry | null>(null);
  const [pndSets, setPndSets] = useState<PndSets>({
    bank: [{ id: 'bank_1', label: 'Bank PND 1', active: false, reason: '', comments: '' }],
    kyc: [{ id: 'kyc_1', label: 'KYC PND 1', active: false, reason: '', comments: '' }],
    fraud: [{ id: 'fraud_1', label: 'Fraud PND 1', active: false, reason: '', comments: '' }],
    transaction: [{ id: 'txn_1', label: 'Transaction PND 1', active: false, reason: '', comments: '' }],
    user: [{ id: 'user_1', label: 'User PND 1', active: false, reason: '', comments: '' }],
  });
  // Form fields for the PND entry detail view
  const [pndFormAction, setPndFormAction] = useState<'enable' | 'disable'>('enable');
  const [pndFormReason, setPndFormReason] = useState('');
  const [pndFormComments, setPndFormComments] = useState('');
  const [pndConfirmOpen, setPndConfirmOpen] = useState(false);

  // ─── FORM STATE ─────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formMiddleName, setFormMiddleName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAlternatePhone, setFormAlternatePhone] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [formGender, setFormGender] = useState<string>('');
  const [formNationality, setFormNationality] = useState('');
  const [formMaritalStatus, setFormMaritalStatus] = useState<string>('');
  const [formOccupation, setFormOccupation] = useState('');
  const [formEmployerName, setFormEmployerName] = useState('');
  const [formMonthlyIncome, setFormMonthlyIncome] = useState<number>(0);
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formAccountType, setFormAccountType] = useState<string>('SAVINGS');
  const [formAccountTier, setFormAccountTier] = useState<string>('TIER_1');
  const [formStatus, setFormStatus] = useState<string>('active');
  const [formSegment, setFormSegment] = useState<string>('RETAIL');
  const [formCurrency, setFormCurrency] = useState('NGN');
  const [formBranchCode, setFormBranchCode] = useState('');
  const [formAssignedOfficer, setFormAssignedOfficer] = useState('');
  const [formDailyTransactionLimit, setFormDailyTransactionLimit] = useState<number>(500000);
  const [formSingleTransactionLimit, setFormSingleTransactionLimit] = useState<number>(200000);
  const [formMonthlyTransactionLimit, setFormMonthlyTransactionLimit] = useState<number>(2000000);
  const [formKycStatus, setFormKycStatus] = useState<string>('PENDING');
  const [formKycTier, setFormKycTier] = useState<string>('BASIC');
  const [formBvn, setFormBvn] = useState('');
  const [formNin, setFormNin] = useState('');
  const [formIdType, setFormIdType] = useState<string>('');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formIdExpiryDate, setFormIdExpiryDate] = useState('');
  const [formPepStatus, setFormPepStatus] = useState(false);
  const [formSanctionStatus, setFormSanctionStatus] = useState<string>('PENDING');
  const [formRiskRating, setFormRiskRating] = useState<string>('LOW');
  const [formAmlStatus, setFormAmlStatus] = useState<string>('CLEAR');
  const [formFatcaStatus, setFormFatcaStatus] = useState(false);
  const [formTrips, setFormTrips] = useState<number>(0);
  const [formRating, setFormRating] = useState<number>(5.0);
  const [formCreditScore, setFormCreditScore] = useState<number>(650);
  const [formOverdraftEnabled, setFormOverdraftEnabled] = useState(false);
  const [formOverdraftLimit, setFormOverdraftLimit] = useState<number>(0);
  const [formOverdraftRate, setFormOverdraftRate] = useState<number>(0);
  const [formOverdraftStatus, setFormOverdraftStatus] = useState<string>('INACTIVE');
  const [formOverdraftExpiry, setFormOverdraftExpiry] = useState('');

  const [customers, setCustomers] = useState<any[]>([
    {
      id: 'cust_881', customerId: 'cust_881', accountNumber: '0123456789',
      accountName: 'Michael A. Chang', name: 'Michael Chang',
      firstName: 'Michael', lastName: 'Chang', middleName: 'A.',
      email: 'm.chang@example.com', phone: '+1 555-0198', alternatePhone: '+1 555-0199',
      dateOfBirth: '1988-08-14', gender: 'MALE', nationality: 'Nigerian',
      maritalStatus: 'MARRIED', occupation: 'Software Engineer', employerName: 'TechCorp Ltd', monthlyIncome: 850000,
      address: '120 Broad Street', city: 'Lagos', state: 'Lagos', country: 'Nigeria', postalCode: '100001',
      accountType: 'PREMIUM', accountTier: 'TIER_3', status: 'ACTIVE', segment: 'HNI',
      currency: 'NGN', ledgerCode: 'SAV-001-NGN', branchCode: 'LG-001', assignedOfficer: 'Alice Smith',
      dateOpened: '2024-01-15', closedAt: '', lastActivityDate: '2026-05-19',
      totalTrips: 42, rating: 4.9,
      availableBalance: 3330000, ledgerBalance: 3450000, pendingBalance: 120000,
      walletBalance: 3450000, overdraftLimit: 500000, minimumBalance: 5000,
      accruedInterest: 12400, lastTransactionAt: '2026-05-19T18:32:00Z',
      dailyTransactionLimit: 5000000, singleTransactionLimit: 2000000, monthlyTransactionLimit: 20000000,
      kycStatus: 'VERIFIED', kycTier: 'ENHANCED', bvnNumber: '22412345678', ninNumber: 'AB1234567',
      idType: 'PASSPORT', idNumber: 'A08765432', idExpiryDate: '2028-06-30',
      pepStatus: false, amlFlag: false, sanctionScreenStatus: 'CLEAR', riskRating: 'LOW',
      amlStatus: 'CLEAR', fraudScore: 8, frozenReason: '', fatcaStatus: false,
      pinHash: '$2b$12$examplehash', failedAttempts: 0, lockedUntil: '', lastLoginAt: '2026-05-19T10:00:00Z',
      twoFaEnabled: true, deviceTrustScore: 92,
      activeLoanCount: 1, totalLoanExposure: 1200000, principalOutstanding: 950000, interestAccrued: 48500,
      loanStatus: 'CURRENT', creditScore: 720, debtServiceRatio: 28,
      lastLoanDisbursementDate: '2025-11-01', nextRepaymentDate: '2026-06-01', nextRepaymentAmount: 75000,
      overdraftEnabled: true, overdraftUtilized: 120000, overdraftAvailable: 380000,
      overdraftInterestRate: 18.5, overdraftExpiryDate: '2026-12-31',
      overdraftStatus: 'ACTIVE', overdraftReviewDate: '2026-09-30',
      createdBy: 'system', updatedBy: 'alice.smith', createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2026-05-19T18:32:00Z', deletedAt: ''
    },
    {
      id: 'cust_882', customerId: 'cust_882', accountNumber: '0198765432',
      accountName: 'Sarah Connor', name: 'Sarah Connor',
      firstName: 'Sarah', lastName: 'Connor', middleName: '',
      email: 'sarah@example.com', phone: '+1 555-0102', alternatePhone: '',
      dateOfBirth: '1995-03-22', gender: 'FEMALE', nationality: 'British',
      maritalStatus: 'SINGLE', occupation: 'Freelancer', employerName: 'Self-Employed', monthlyIncome: 150000,
      address: '45 Marina Road', city: 'Abuja', state: 'FCT', country: 'Nigeria', postalCode: '900001',
      accountType: 'SAVINGS', accountTier: 'TIER_1', status: 'BANNED', segment: 'RETAIL',
      currency: 'NGN', ledgerCode: 'SAV-002-NGN', branchCode: 'AB-002', assignedOfficer: 'Bob Adewale',
      dateOpened: '2025-03-01', closedAt: '', lastActivityDate: '2026-04-10',
      totalTrips: 5, rating: 3.2,
      availableBalance: 12500, ledgerBalance: 12500, pendingBalance: 0,
      walletBalance: 12500, overdraftLimit: 0, minimumBalance: 1000,
      accruedInterest: 0, lastTransactionAt: '2026-04-10T14:21:00Z',
      dailyTransactionLimit: 500000, singleTransactionLimit: 200000, monthlyTransactionLimit: 2000000,
      kycStatus: 'PENDING', kycTier: 'BASIC', bvnNumber: '', ninNumber: '',
      idType: '', idNumber: '', idExpiryDate: '',
      pepStatus: false, amlFlag: true, sanctionScreenStatus: 'PENDING', riskRating: 'HIGH',
      amlStatus: 'UNDER_REVIEW', fraudScore: 72, frozenReason: 'AML Review Pending', fatcaStatus: false,
      pinHash: '', failedAttempts: 4, lockedUntil: '2026-06-01T00:00:00Z', lastLoginAt: '2026-04-10T14:00:00Z',
      twoFaEnabled: false, deviceTrustScore: 25,
      activeLoanCount: 0, totalLoanExposure: 0, principalOutstanding: 0, interestAccrued: 0,
      loanStatus: 'NONE', creditScore: 410, debtServiceRatio: 0,
      lastLoanDisbursementDate: '', nextRepaymentDate: '', nextRepaymentAmount: 0,
      overdraftEnabled: false, overdraftUtilized: 0, overdraftAvailable: 0,
      overdraftInterestRate: 0, overdraftExpiryDate: '',
      overdraftStatus: 'INACTIVE', overdraftReviewDate: '',
      createdBy: 'system', updatedBy: 'bob.adewale', createdAt: '2025-03-01T08:00:00Z',
      updatedAt: '2026-04-10T14:21:00Z', deletedAt: ''
    }
  ]);

  const [isSyncingCustomers, setIsSyncingCustomers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsSyncingCustomers(true);
    listRiders(0, 100)
      .then((res) => {
        if (cancelled) return;
        setCustomers(res.data as unknown as Customer[]);
      })
      .catch(() => {
        triggerToast('Customer API unavailable. Showing local demo data.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsSyncingCustomers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  useEffect(() => {
    if (pndTrigger && pndTrigger > 0 && view === 'manage') {
      setShowPndWizard(true);
      setActivePndTypeId(null);
      setSelectedPndEntry(null);
    }
  }, [pndTrigger]);

  useEffect(() => {
    if (selectCustomerId && selectCustomerTrigger && selectCustomerTrigger > 0) {
      setSelectedId(selectCustomerId);
      setView('manage');
    }
  }, [selectCustomerTrigger]);

  const resetForm = () => {
    setFormName(''); setFormFirstName(''); setFormLastName(''); setFormMiddleName('');
    setFormEmail(''); setFormPhone(''); setFormAlternatePhone('');
    setFormDateOfBirth(''); setFormGender(''); setFormNationality('');
    setFormMaritalStatus(''); setFormOccupation(''); setFormEmployerName(''); setFormMonthlyIncome(0);
    setFormAddress(''); setFormCity(''); setFormState(''); setFormCountry(''); setFormPostalCode('');
    setFormAccountType('SAVINGS'); setFormAccountTier('TIER_1'); setFormStatus('active');
    setFormSegment('RETAIL'); setFormCurrency('NGN'); setFormBranchCode(''); setFormAssignedOfficer('');
    setFormDailyTransactionLimit(500000); setFormSingleTransactionLimit(200000); setFormMonthlyTransactionLimit(2000000);
    setFormKycStatus('PENDING'); setFormKycTier('BASIC');
    setFormBvn(''); setFormNin(''); setFormIdType(''); setFormIdNumber(''); setFormIdExpiryDate('');
    setFormPepStatus(false); setFormSanctionStatus('PENDING'); setFormRiskRating('LOW');
    setFormAmlStatus('CLEAR'); setFormFatcaStatus(false);
    setFormTrips(0); setFormRating(5.0); setFormCreditScore(650);
    setFormOverdraftEnabled(false); setFormOverdraftLimit(0); setFormOverdraftRate(0);
    setFormOverdraftStatus('INACTIVE'); setFormOverdraftExpiry('');
  };

  const handleOpenCreate = () => {
    setSelectedId(null);
    resetForm();
    setIsEditMode(true);
    setActiveSubPage(null);
    setView('manage');
    onViewChange?.('manage');
  };

  const applyCustomerToForm = (customer: any) => {
    const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
    setFormName(customer.name ?? fullName);
    setFormFirstName(customer.firstName ?? '');
    setFormLastName(customer.lastName ?? '');
    setFormMiddleName(customer.middleName ?? '');
    setFormEmail(customer.email); setFormPhone(customer.phone); setFormAlternatePhone(customer.alternatePhone);
    setFormDateOfBirth(customer.dateOfBirth); setFormGender(customer.gender); setFormNationality(customer.nationality);
    setFormMaritalStatus(customer.maritalStatus); setFormOccupation(customer.occupation); setFormEmployerName(customer.employerName); setFormMonthlyIncome(customer.monthlyIncome);
    setFormAddress(customer.address); setFormCity(customer.city); setFormState(customer.state); setFormCountry(customer.country); setFormPostalCode(customer.postalCode);
    setFormAccountType(customer.accountType); setFormAccountTier(customer.accountTier); setFormStatus(customer.status);
    setFormSegment(customer.segment); setFormCurrency(customer.currency); setFormBranchCode(customer.branchCode); setFormAssignedOfficer(customer.assignedOfficer);
    setFormDailyTransactionLimit(customer.dailyTransactionLimit); setFormSingleTransactionLimit(customer.singleTransactionLimit); setFormMonthlyTransactionLimit(customer.monthlyTransactionLimit);
    setFormKycStatus(customer.kycStatus); setFormKycTier(customer.kycTier);
    setFormBvn(customer.bvnNumber); setFormNin(customer.ninNumber); setFormIdType(customer.idType); setFormIdNumber(customer.idNumber); setFormIdExpiryDate(customer.idExpiryDate);
    setFormPepStatus(customer.pepStatus); setFormSanctionStatus(customer.sanctionScreenStatus); setFormRiskRating(customer.riskRating);
    setFormAmlStatus(customer.amlStatus); setFormFatcaStatus(customer.fatcaStatus);
    setFormTrips(customer.totalTrips); setFormRating(customer.rating); setFormCreditScore(customer.creditScore);
    setFormOverdraftEnabled(customer.overdraftEnabled); setFormOverdraftLimit(customer.overdraftLimit); setFormOverdraftRate(customer.overdraftInterestRate);
    setFormOverdraftStatus(customer.overdraftStatus); setFormOverdraftExpiry(customer.overdraftExpiryDate);
  }

  const handleOpenManage = async (customer: Customer) => {
    setSelectedId(customer.id);
    applyCustomerToForm(customer)
    setIsEditMode(false);
    setActiveSubPage(null);
    setView('manage');
    onViewChange?.('manage');

    try {
      const fresh = await getCustomer(customer.id)
      const freshCustomer = fresh as unknown as any
      applyCustomerToForm(freshCustomer)
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? freshCustomer : c)))
    } catch {
      triggerToast('Failed to refresh customer details.')
    }
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      triggerToast('Please provide valid customer details.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    const isNew = selectedId === null;

    // ── Build a clean payload with ONLY the fields the backend CreateCustomerDto/UpdateCustomerDto accepts ──
    const createPayload = {
      customerType: 'rider' as const,
      email: formEmail,
      phone: formPhone,
      firstName: formFirstName,
      lastName: formLastName,
      address: formAddress || undefined,
      city: formCity || undefined,
      state: formState || undefined,
      zipCode: formPostalCode || undefined,   // backend field is zipCode, not postalCode
      country: formCountry || undefined,
      metadata: {
        // Store extra fields in metadata so they're preserved
        gender: formGender || undefined,
        nationality: formNationality || undefined,
        maritalStatus: formMaritalStatus || undefined,
        occupation: formOccupation || undefined,
        employerName: formEmployerName || undefined,
        monthlyIncome: formMonthlyIncome || undefined,
        accountType: formAccountType || undefined,
        accountTier: formAccountTier || undefined,
        segment: formSegment || undefined,
        currency: formCurrency || undefined,
        kycStatus: formKycStatus || undefined,
        kycTier: formKycTier || undefined,
        bvnNumber: formBvn || undefined,
        ninNumber: formNin || undefined,
        idType: formIdType || undefined,
        idNumber: formIdNumber || undefined,
        idExpiryDate: formIdExpiryDate || undefined,
        creditScore: formCreditScore || undefined,
        overdraftEnabled: formOverdraftEnabled,
        overdraftLimit: formOverdraftLimit || undefined,
        overdraftInterestRate: formOverdraftRate || undefined,
      },
    };

    const updatePayload = {
      phone: formPhone || undefined,
      firstName: formFirstName || undefined,
      lastName: formLastName || undefined,
      address: formAddress || undefined,
      city: formCity || undefined,
      state: formState || undefined,
      zipCode: formPostalCode || undefined,
      country: formCountry || undefined,
      status: formStatus as any,
      rating: formRating || undefined,
      metadata: createPayload.metadata,
    };

    try {
      const saved = isNew
        ? await createCustomer(createPayload)
        : await updateCustomer(selectedId!, updatePayload);

      const savedCustomer = saved as unknown as any;

      if (isNew) {
        setCustomers((prev) => [...prev, savedCustomer]);
        triggerToast(`Customer ${savedCustomer.id} created successfully.`);
        setSelectedId(savedCustomer.id);
      } else {
        setCustomers((prev) => prev.map((c) => (c.id === selectedId ? savedCustomer : c)));
        triggerToast(`Customer ${selectedId} updated successfully.`);
      }

      setShowSaveConfirm(false);
      setShowSaveSuccess(true);
    } catch (e) {
      setShowSaveConfirm(false);
      triggerToast((e as { message?: string })?.message ?? 'Failed to save customer. Please try again.');
    }
  };
  const handleConfirmDelete = async () => {
    if (selectedId === null) return;
    try {
      await deleteCustomer(selectedId);
      setCustomers((prev) => prev.filter((c) => c.id !== selectedId));
      setShowDeleteConfirm(false);
      triggerToast(`Customer ${selectedId} deleted.`);
      setView('list');
      onViewChange?.('list');
    } catch {
      setShowDeleteConfirm(false);
      triggerToast('Failed to delete customer. Please try again.');
    }
  };

  const iSt: React.CSSProperties = { width:'100%', padding:'0.6rem 0.9rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:'0.5rem', color:'#fff', fontSize:'0.83rem', outline:'none', boxSizing:'border-box' };
  const lSt: React.CSSProperties = { display:'block', fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.06em', marginBottom:'0.35rem', textTransform:'uppercase' };
  const sec = (title: string) => <p style={{ fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.07em', margin:'1.5rem 0 1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.5rem' }}>{title}</p>;
  const G4 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem' }}>{children}</div>;
  const G3 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>{children}</div>;
  const G2 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>{children}</div>;
  const F = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label style={lSt}>{label}</label>{children}</div>;
  const tabs: { id: 'personal'|'account'|'kyc'|'loan'; label: string }[] = [
    { id:'personal', label:'Personal Info' }, { id:'account', label:'Account Setup' },
    { id:'kyc', label:'KYC & Compliance' }, { id:'loan', label:'Loan & Overdraft' },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Customer Directory</h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              height: '38px',
              boxSizing: 'border-box'
            }}>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                  triggerToast(`Customers filtered by status: ${e.target.value}`);
                }}
                style={{
                  height: '100%',
                  padding: '0 1rem',
                  background: 'var(--primary)',
                  color: '#000',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer',
                  borderRadius: '0',
                  margin: 0
                }}
              >
                <option value="ALL" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>All Statuses</option>
                <option value="active" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Active Only</option>
                <option value="suspended" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Suspended</option>
              </select>

              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: '100%',
                  padding: '0 1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '220px'
                }}
              />
              <button
                onClick={() => triggerToast(`Searching for "${searchQuery}"...`)}
                style={{
                  height: '100%',
                  padding: '0 1.25rem',
                  background: 'rgba(15,15,15,0.95)',
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#000';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15,15,15,0.95)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <Search size={15} />
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Trips & Rating</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = customers.filter(c => {
                    const fullName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
                    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) || (c.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
                    return matchesSearch && matchesStatus;
                  });
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(customer => (
                    <tr key={customer.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{customer.id}</td>
                      <td><div style={{ fontWeight: 'bold', color: '#fff' }}>{`${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()}</div></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{customer.email}</td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{customer.totalTrips ?? 0}</span> trips 
                        <span style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>★ {(customer.rating ?? 0).toFixed(1)}</span>
                      </td>
                      <td>
                        <span className={`badge ${customer.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} 
                          onClick={() => handleOpenManage(customer)}
                        >
                          <Sliders size={12} /> Manage
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={customers.filter(c => {
                const fullName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
                const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) || (c.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
                return matchesSearch && matchesStatus;
              }).length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </div>
      )}

      {/* ── MANAGE VIEW ── */}
      {view === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Navigation Row (Back Button) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => { setView('list'); onViewChange?.('list'); }} 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Back to Directory"
            >
              <ArrowLeft size={16} />
            </button>
          </div>

          {!isEditMode ? (
            <>
              {activeSubPage === null ? (
                /* CUSTOMER DASHBOARD */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Hero Banner */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '2.5rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '2rem',
                  background: 'linear-gradient(135deg, rgba(255,184,0,0.1) 0%, rgba(0,0,0,0) 100%)',
                  borderTop: '2px solid var(--primary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800' }}>{formName}</h2>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '0.4rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span>Account ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedId}</span></span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }}></span>
                      <span className={`badge ${formStatus === 'active' ? 'badge-approved' : formStatus === 'suspended' ? 'badge-rejected' : 'badge-pending'}`}>{formStatus}</span>
                    </p>
                  </div>
                  <button 
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#000', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s' }} 
                    onClick={() => setIsEditMode(true)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
                  >
                    <Edit2 size={14} /> Edit Customer
                  </button>
                </div>

                {/* Sub-page Link Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                  {[
                    { id: 'customer-info', title: 'Customer Info', icon: <UserCircle size={18} /> },
                    { id: 'kyc-info', title: 'KYC Information', icon: <ShieldCheck size={18} /> },
                    { id: 'loan-summary', title: 'Loan Summary', icon: <Banknote size={18} /> },
                    { id: 'overdraft-summary', title: 'Overdraft Summary', icon: <CreditCard size={18} /> },
                    { id: 'manage-account', title: 'Manage Account', icon: <UserCog size={18} /> }
                  ].map((card) => (
                    <div 
                      key={card.id}
                      onClick={() => setActiveSubPage(card.id as CustomerSubPage)}
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,184,0,0.1)';
                        e.currentTarget.style.border = '1px solid rgba(255,184,0,0.4)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ color: 'var(--primary)', background: 'rgba(255,184,0,0.1)', width: '32px', height: '32px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {card.icon}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>{card.title}</span>
                        <ArrowRight size={14} style={{ color: 'var(--foreground-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency Pills + Metric Cards */}
              {(() => {
                const cust = customers.find(c => c.id === selectedId)
                const balance = cust?.availableBalance ?? cust?.walletBalance ?? cust?.ledgerBalance ?? 0
                const expenses = cust?.totalSpent ?? 0
                const inflow = cust?.totalEarnings ?? cust?.monthlyIncome ?? 0
                const trips = cust?.totalTrips ?? cust?.totalRides ?? 0
                const ngnRate = currency.rates['NGN'] || 1
                const fmt = (amount: number) => currency.format(amount / ngnRate)
                const barValues = trips > 0
                  ? Array.from({ length: 12 }, (_, i) => {
                      const base = trips / 12
                      const variance = Math.sin(i * 1.5) * base * 0.4
                      return Math.max(5, Math.round((base + variance) / Math.max(1, trips) * 100))
                    })
                  : [40, 70, 30, 90, 50, 100, 60, 80, 45, 65, 85, 30]
                const txTypes = trips > 0
                  ? [
                      { d: new Date(Date.now() - 86400000 * 12).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), t: 'Ride Payment', a: `-${fmt(expenses * 0.3)}`, c: '#ef4444' },
                      { d: new Date(Date.now() - 86400000 * 10).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), t: 'Wallet Deposit', a: `+${fmt(inflow * 0.5)}`, c: '#10b981' },
                      { d: new Date(Date.now() - 86400000 * 8).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), t: 'Ride Payment', a: `-${fmt(expenses * 0.25)}`, c: '#ef4444' },
                      { d: new Date(Date.now() - 86400000 * 5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), t: 'Trip Earnings', a: `+${fmt(inflow * 0.4)}`, c: '#10b981' },
                      { d: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), t: 'Subscription', a: `-${fmt(Math.max(expenses * 0.05, 99))}`, c: '#ef4444' },
                    ]
                  : [
                      { d: 'Oct 12, 2026', t: 'Wallet Deposit', a: '+$500.00', c: '#10b981' },
                      { d: 'Oct 10, 2026', t: 'Ride Payment', a: '-$24.50', c: '#ef4444' },
                      { d: 'Oct 08, 2026', t: 'Premium Sub', a: '-$99.00', c: '#ef4444' },
                      { d: 'Oct 05, 2026', t: 'Refund', a: '+$12.50', c: '#10b981' },
                      { d: 'Oct 01, 2026', t: 'Ride Payment', a: '-$35.00', c: '#ef4444' },
                    ]

                return (
                  <>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' }}>
                      {QUICK_CURRENCIES.map(code => {
                        const cur = ALL_CURRENCIES.find(c => c.code === code);
                        if (!cur) return null;
                        const isActive = currency.displayCurrency === code;
                        return (
                          <button key={code} onClick={() => currency.setDisplayCurrency(code)}
                            style={{
                              padding: '0.2rem 0.55rem', fontSize: '0.65rem', fontWeight: 700,
                              background: isActive ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.03)',
                              border: isActive ? '1px solid rgba(255,184,0,0.4)' : '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '0.35rem',
                              color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                            }}>
                            {cur.flag} {cur.code}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => { setShowCurrencyModal(true); setCurrencySearch(''); }}
                        style={{
                          padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 700,
                          background: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                          border: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '0.35rem',
                          color: !QUICK_CURRENCIES.includes(currency.displayCurrency) ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                        {!QUICK_CURRENCIES.includes(currency.displayCurrency)
                          ? `${ALL_CURRENCIES.find(c => c.code === currency.displayCurrency)?.flag ?? ''} ${currency.displayCurrency}`
                          : 'More'}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                          <Wallet size={16} style={{ color: 'var(--primary)' }} /> CUSTOMER BALANCE
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-outfit)' }}>{fmt(balance)}</div>
                      </div>
                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                          <TrendingUp size={16} style={{ color: '#ef4444' }} /> CURRENT EXPENSES
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-outfit)' }}>{fmt(expenses)}</div>
                      </div>
                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground-muted)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                          <ArrowDownRight size={16} style={{ color: '#10b981' }} /> CASH INFLOW
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-outfit)' }}>{fmt(inflow)}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '0.9rem', color: '#fff', fontWeight: '800' }}>Transaction Activity (30 Days)</h4>
                        <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                          {barValues.map((h, i) => (
                            <div key={i} style={{ flex: 1, background: 'linear-gradient(to top, var(--primary) 0%, rgba(255,184,0,0.4) 100%)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.9 }} />
                          ))}
                        </div>
                      </div>

                      <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '0.9rem', color: '#fff', fontWeight: '800' }}>Recent Transactions</h4>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem 0', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>Date</th>
                                <th style={{ padding: '0.5rem 0', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>Type</th>
                                <th style={{ padding: '0.5rem 0', color: 'var(--foreground-muted)', fontWeight: 'bold', textAlign: 'right' }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {txTypes.map((tx, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '0.75rem 0', color: 'var(--foreground-muted)' }}>{tx.d}</td>
                                  <td style={{ padding: '0.75rem 0', fontWeight: '600' }}>{tx.t}</td>
                                  <td style={{ padding: '0.75rem 0', fontWeight: 'bold', color: tx.c, textAlign: 'right' }}>{tx.a}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

            </div>
              ) : (
                /* SUB-PAGE DETAIL VIEW */
                <div className="glass-card" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
                <button onClick={() => setActiveSubPage(null)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Back to Dashboard"><ArrowLeft size={16} /></button>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', color: '#fff', textTransform: 'capitalize' }}>{activeSubPage?.replace(/-/g, ' ')}</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 'bold' }}>DETAILED RECORD • {selectedId}</p>
                </div>
              </div>

              {(() => {
                const cust = customers.find(c => c.id === selectedId);
                if (!cust) return null;
                const fmt = (n: number | undefined | null, cur = 'NGN') => (n ?? 0).toLocaleString('en-NG', { style: 'currency', currency: cur, maximumFractionDigits: 2 });
                const Field = ({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) => (
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.9rem' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.07em', marginBottom: '0.35rem', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: '0.9rem', color: accent ?? '#fff', fontWeight: '600', wordBreak: 'break-word' }}>{value || <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}</div>
                  </div>
                );
                const Badge = ({ val, green, red }: { val: string; green?: string[]; red?: string[] }) => {
                  const isGreen = green?.includes(val); const isRed = red?.includes(val);
                  return <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '1rem', background: isGreen ? 'rgba(16,185,129,0.15)' : isRed ? 'rgba(239,68,68,0.15)' : 'rgba(255,184,0,0.12)', color: isGreen ? '#10b981' : isRed ? '#ef4444' : 'var(--primary)' }}>{val}</span>;
                };

                if (activeSubPage === 'customer-info') return (
                  <>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>PERSONAL IDENTITY</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="First Name" value={cust.firstName} />
                      <Field label="Middle Name" value={cust.middleName} />
                      <Field label="Last Name" value={cust.lastName} />
                      <Field label="Account Name" value={cust.accountName} />
                      <Field label="Date of Birth" value={cust.dateOfBirth} />
                      <Field label="Gender" value={cust.gender} />
                      <Field label="Nationality" value={cust.nationality} />
                      <Field label="Marital Status" value={cust.maritalStatus} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>CONTACT</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="Primary Email" value={cust.email} />
                      <Field label="Primary Phone" value={cust.phone} />
                      <Field label="Alternate Phone" value={cust.alternatePhone} />
                      <Field label="Customer ID" value={cust.customerId} accent="var(--primary)" />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>ADDRESS</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="Street Address" value={cust.address} />
                      <Field label="City" value={cust.city} />
                      <Field label="State" value={cust.state} />
                      <Field label="Country" value={cust.country} />
                      <Field label="Postal Code" value={cust.postalCode} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>EMPLOYMENT</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                      <Field label="Occupation" value={cust.occupation} />
                      <Field label="Employer" value={cust.employerName} />
                      <Field label="Monthly Income" value={fmt(cust.monthlyIncome)} accent="var(--primary)" />
                      <Field label="Segment" value={<Badge val={cust.segment} green={['HNI', 'CORPORATE']} />} />
                    </div>
                  </>
                );

                if (activeSubPage === 'kyc-info') return (
                  <>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>KYC VERIFICATION</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="KYC Status" value={<Badge val={cust.kycStatus} green={['VERIFIED']} red={['FAILED', 'EXPIRED']} />} />
                      <Field label="KYC Tier" value={<Badge val={cust.kycTier} green={['ENHANCED']} />} />
                      <Field label="BVN Number" value={cust.bvnNumber || '—'} accent="var(--primary)" />
                      <Field label="NIN Number" value={cust.ninNumber || '—'} accent="var(--primary)" />
                      <Field label="ID Type" value={cust.idType} />
                      <Field label="ID Number" value={cust.idNumber} />
                      <Field label="ID Expiry" value={cust.idExpiryDate} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>COMPLIANCE & RISK</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="Risk Rating" value={<Badge val={cust.riskRating} green={['LOW']} red={['HIGH']} />} />
                      <Field label="AML Status" value={<Badge val={cust.amlStatus} green={['CLEAR']} red={['FLAGGED']} />} />
                      <Field label="AML Flag" value={<Badge val={cust.amlFlag ? 'FLAGGED' : 'CLEAR'} green={['CLEAR']} red={['FLAGGED']} />} />
                      <Field label="Sanction Screen" value={<Badge val={cust.sanctionScreenStatus} green={['CLEAR']} red={['FLAGGED']} />} />
                      <Field label="PEP Status" value={<Badge val={cust.pepStatus ? 'EXPOSED' : 'NOT EXPOSED'} red={['EXPOSED']} green={['NOT EXPOSED']} />} />
                      <Field label="FATCA Status" value={<Badge val={cust.fatcaStatus ? 'SUBJECT' : 'EXEMPT'} red={['SUBJECT']} green={['EXEMPT']} />} />
                      <Field label="Fraud Score" value={<span style={{ color: cust.fraudScore > 60 ? '#ef4444' : cust.fraudScore > 30 ? 'var(--primary)' : '#10b981', fontWeight: '800' }}>{cust.fraudScore}/100</span>} />
                      <Field label="Frozen Reason" value={cust.frozenReason} />
                    </div>
                  </>
                );

                if (activeSubPage === 'loan-summary') return (
                  <>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>LOAN EXPOSURE</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="Loan Status" value={<Badge val={cust.loanStatus} green={['CURRENT', 'NONE']} red={['OVERDUE', 'NPL', 'WRITTEN_OFF']} />} />
                      <Field label="Active Loans" value={String(cust.activeLoanCount)} />
                      <Field label="Total Exposure" value={fmt(cust.totalLoanExposure)} accent="#ef4444" />
                      <Field label="Principal Outstanding" value={fmt(cust.principalOutstanding)} accent="#ef4444" />
                      <Field label="Interest Accrued" value={fmt(cust.interestAccrued)} accent="var(--primary)" />
                      <Field label="Debt Service Ratio" value={`${cust.debtServiceRatio}%`} />
                      <Field label="Last Disbursement" value={cust.lastLoanDisbursementDate} />
                      <Field label="Next Repayment Date" value={cust.nextRepaymentDate} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>CREDITWORTHINESS</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                      <Field label="Credit Score" value={<span style={{ color: cust.creditScore >= 700 ? '#10b981' : cust.creditScore >= 550 ? 'var(--primary)' : '#ef4444', fontWeight: '800', fontSize: '1.1rem' }}>{cust.creditScore}</span>} />
                      <Field label="Next Repayment" value={fmt(cust.nextRepaymentAmount)} accent="var(--primary)" />
                    </div>
                  </>
                );

                if (activeSubPage === 'overdraft-summary') return (
                  <>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>OVERDRAFT FACILITY</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="Overdraft Status" value={<Badge val={cust.overdraftStatus} green={['ACTIVE']} red={['SUSPENDED', 'EXPIRED']} />} />
                      <Field label="Enabled" value={<Badge val={cust.overdraftEnabled ? 'YES' : 'NO'} green={['YES']} red={['NO']} />} />
                      <Field label="OD Limit" value={fmt(cust.overdraftLimit)} accent="var(--primary)" />
                      <Field label="OD Utilized" value={fmt(cust.overdraftUtilized)} accent="#ef4444" />
                      <Field label="OD Available" value={fmt(cust.overdraftAvailable)} accent="#10b981" />
                      <Field label="Interest Rate" value={`${cust.overdraftInterestRate}% p.a.`} />
                      <Field label="Expiry Date" value={cust.overdraftExpiryDate} />
                      <Field label="Review Date" value={cust.overdraftReviewDate} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>BALANCE SNAPSHOT</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                      <Field label="Available Balance" value={fmt(cust.availableBalance)} accent="#10b981" />
                      <Field label="Ledger Balance" value={fmt(cust.ledgerBalance)} />
                      <Field label="Pending Balance" value={fmt(cust.pendingBalance)} accent="var(--primary)" />
                      <Field label="Minimum Balance" value={fmt(cust.minimumBalance)} />
                      <Field label="Wallet Balance" value={fmt(cust.walletBalance)} accent="var(--primary)" />
                      <Field label="Accrued Interest" value={fmt(cust.accruedInterest)} />
                      <Field label="Last Transaction" value={cust.lastTransactionAt} />
                    </div>
                  </>
                );

                if (activeSubPage === 'manage-account') return (
                  <>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>ACCOUNT DETAILS</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="Account Number" value={cust.accountNumber} accent="var(--primary)" />
                      <Field label="Account Name" value={cust.accountName} />
                      <Field label="Account Type" value={<Badge val={cust.accountType} green={['PREMIUM', 'CORPORATE']} />} />
                      <Field label="Account Tier" value={<Badge val={cust.accountTier} green={['TIER_3']} />} />
                      <Field label="Currency" value={cust.currency} />
                      <Field label="Ledger Code" value={cust.ledgerCode} accent="var(--primary)" />
                      <Field label="Branch Code" value={cust.branchCode} />
                      <Field label="Assigned Officer" value={cust.assignedOfficer} />
                      <Field label="Date Opened" value={cust.dateOpened} />
                      <Field label="Closed At" value={cust.closedAt || '—'} />
                      <Field label="Last Activity" value={cust.lastActivityDate} />
                      <Field label="Status" value={<Badge val={cust.status} green={['ACTIVE']} red={['BANNED', 'FROZEN', 'CLOSED']} />} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>SECURITY & AUTH</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <Field label="2FA Enabled" value={<Badge val={cust.twoFaEnabled ? 'ENABLED' : 'DISABLED'} green={['ENABLED']} red={['DISABLED']} />} />
                      <Field label="Failed Attempts" value={<span style={{ color: cust.failedAttempts > 2 ? '#ef4444' : '#fff' }}>{cust.failedAttempts}</span>} />
                      <Field label="Locked Until" value={cust.lockedUntil || 'Not Locked'} />
                      <Field label="Last Login" value={cust.lastLoginAt} />
                      <Field label="Device Trust Score" value={<span style={{ color: cust.deviceTrustScore >= 70 ? '#10b981' : cust.deviceTrustScore >= 40 ? 'var(--primary)' : '#ef4444' }}>{cust.deviceTrustScore}/100</span>} />
                      <Field label="PIN Hash" value={cust.pinHash ? '●●●●●●●●' : '—'} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>AUDIT TRAIL</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                      <Field label="Created By" value={cust.createdBy} />
                      <Field label="Created At" value={cust.createdAt} />
                      <Field label="Updated By" value={cust.updatedBy} />
                      <Field label="Updated At" value={cust.updatedAt} />
                      <Field label="Deleted At" value={cust.deletedAt || '—'} />
                    </div>
                  </>
                );

                return null;
              })()}
            </div>
              )}
            </>
          ) : (
            /* EDIT / CREATE FORM */
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Create Customer' : `Edit Profile: ${formName}`}
                    </h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                      CRM Profile • ID: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedId === null ? 'NEW_CUSTOMER' : selectedId}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {selectedId !== null && (
                    <button 
                      style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  {selectedId !== null && (
                    <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEditMode(false)}>
                      <X size={14} /> Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleRequestSave}>
                <>
                      {/* Tab Nav */}
                      <div style={{ display:'flex', gap:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.07)', marginBottom:'1.5rem' }}>
                        {tabs.map(t => (
                          <button key={t.id} type="button" onClick={() => setFormTab(t.id)}
                            style={{ padding:'0.55rem 1.1rem', fontSize:'0.78rem', fontWeight:'700', border:'none', borderRadius:'0.5rem 0.5rem 0 0', cursor:'pointer', transition:'all 0.2s',
                              background: formTab===t.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                              color: formTab===t.id ? '#000' : 'rgba(255,255,255,0.5)' }}>
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* ── TAB 1: Personal Info ── */}
                      {formTab === 'personal' && <>
                        {sec('IDENTITY')}
                        <G4>
                          <F label="First Name"><input style={iSt} value={formFirstName} onChange={e=>setFormFirstName(e.target.value)} required /></F>
                          <F label="Middle Name"><input style={iSt} value={formMiddleName} onChange={e=>setFormMiddleName(e.target.value)} /></F>
                          <F label="Last Name"><input style={iSt} value={formLastName} onChange={e=>setFormLastName(e.target.value)} required /></F>
                          <F label="Date of Birth"><input type="date" style={iSt} value={formDateOfBirth} onChange={e=>setFormDateOfBirth(e.target.value)} /></F>
                          <F label="Gender"><select style={iSt} value={formGender} onChange={e=>setFormGender(e.target.value as any)}><option value="">—</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></F>
                          <F label="Nationality"><input style={iSt} value={formNationality} onChange={e=>setFormNationality(e.target.value)} /></F>
                          <F label="Marital Status"><select style={iSt} value={formMaritalStatus} onChange={e=>setFormMaritalStatus(e.target.value as any)}><option value="">—</option><option value="SINGLE">Single</option><option value="MARRIED">Married</option><option value="DIVORCED">Divorced</option><option value="WIDOWED">Widowed</option></select></F>
                        </G4>
                        {sec('CONTACT')}
                        <G4>
                          <F label="Primary Email"><input type="email" style={iSt} value={formEmail} onChange={e=>setFormEmail(e.target.value)} required /></F>
                          <F label="Primary Phone"><input style={iSt} value={formPhone} onChange={e=>setFormPhone(e.target.value)} /></F>
                          <F label="Alternate Phone"><input style={iSt} value={formAlternatePhone} onChange={e=>setFormAlternatePhone(e.target.value)} /></F>
                        </G4>
                        {sec('ADDRESS')}
                        <G4>
                          <F label="Street Address"><input style={iSt} value={formAddress} onChange={e=>setFormAddress(e.target.value)} /></F>
                          <F label="City"><input style={iSt} value={formCity} onChange={e=>setFormCity(e.target.value)} /></F>
                          <F label="State"><input style={iSt} value={formState} onChange={e=>setFormState(e.target.value)} /></F>
                          <F label="Country"><input style={iSt} value={formCountry} onChange={e=>setFormCountry(e.target.value)} /></F>
                          <F label="Postal Code"><input style={iSt} value={formPostalCode} onChange={e=>setFormPostalCode(e.target.value)} /></F>
                        </G4>
                        {sec('EMPLOYMENT')}
                        <G3>
                          <F label="Occupation"><input style={iSt} value={formOccupation} onChange={e=>setFormOccupation(e.target.value)} /></F>
                          <F label="Employer Name"><input style={iSt} value={formEmployerName} onChange={e=>setFormEmployerName(e.target.value)} /></F>
                          <F label="Monthly Income (₦)"><input type="number" style={iSt} value={formMonthlyIncome} onChange={e=>setFormMonthlyIncome(Number(e.target.value))} /></F>
                        </G3>
                      </>}

                      {/* ── TAB 2: Account Setup ── */}
                      {formTab === 'account' && <>
                        {sec('ACCOUNT PROFILE')}
                        <G4>
                          <F label="Account Type"><select style={iSt} value={formAccountType} onChange={e=>setFormAccountType(e.target.value as any)}><option value="SAVINGS">Savings</option><option value="CURRENT">Current</option><option value="WALLET">Wallet</option><option value="ESCROW">Escrow</option><option value="PREMIUM">Premium</option><option value="CORPORATE">Corporate</option><option value="BUSINESS">Business</option></select></F>
                          <F label="Account Tier"><select style={iSt} value={formAccountTier} onChange={e=>setFormAccountTier(e.target.value as any)}><option value="TIER_1">Tier 1</option><option value="TIER_2">Tier 2</option><option value="TIER_3">Tier 3</option></select></F>
                          <F label="Status"><select style={iSt} value={formStatus} onChange={e=>setFormStatus(e.target.value as any)}><option value="active">Active</option><option value="suspended">Suspended</option><option value="inactive">Dormant</option><option value="banned">Banned</option><option value="pending_verification">Pending Verification</option></select></F>
                          <F label="Segment"><select style={iSt} value={formSegment} onChange={e=>setFormSegment(e.target.value as any)}><option value="RETAIL">Retail</option><option value="SME">SME</option><option value="CORPORATE">Corporate</option><option value="HNI">HNI</option></select></F>
                          <F label="Currency"><input style={iSt} value={formCurrency} onChange={e=>setFormCurrency(e.target.value)} /></F>
                          <F label="Branch Code"><input style={iSt} value={formBranchCode} onChange={e=>setFormBranchCode(e.target.value)} /></F>
                          <F label="Assigned Officer"><input style={iSt} value={formAssignedOfficer} onChange={e=>setFormAssignedOfficer(e.target.value)} /></F>
                        </G4>
                        {sec('TRANSACTION LIMITS')}
                        <G3>
                          <F label="Daily Limit (₦)"><input type="number" style={iSt} value={formDailyTransactionLimit} onChange={e=>setFormDailyTransactionLimit(Number(e.target.value))} /></F>
                          <F label="Single Txn Limit (₦)"><input type="number" style={iSt} value={formSingleTransactionLimit} onChange={e=>setFormSingleTransactionLimit(Number(e.target.value))} /></F>
                          <F label="Monthly Limit (₦)"><input type="number" style={iSt} value={formMonthlyTransactionLimit} onChange={e=>setFormMonthlyTransactionLimit(Number(e.target.value))} /></F>
                        </G3>
                        {sec('RATINGS')}
                        <G2>
                          <F label="Total Trips"><input type="number" style={iSt} value={formTrips} onChange={e=>setFormTrips(Number(e.target.value))} /></F>
                          <F label="Customer Rating"><input type="number" step="0.1" min="0" max="5" style={iSt} value={formRating} onChange={e=>setFormRating(parseFloat(e.target.value)||0)} /></F>
                        </G2>
                      </>}

                      {/* ── TAB 3: KYC & Compliance ── */}
                      {formTab === 'kyc' && <>
                        {sec('KYC VERIFICATION')}
                        <G4>
                          <F label="KYC Status"><select style={iSt} value={formKycStatus} onChange={e=>setFormKycStatus(e.target.value as any)}><option value="PENDING">Pending</option><option value="VERIFIED">Verified</option><option value="FAILED">Failed</option><option value="EXPIRED">Expired</option></select></F>
                          <F label="KYC Tier"><select style={iSt} value={formKycTier} onChange={e=>setFormKycTier(e.target.value as any)}><option value="BASIC">Basic</option><option value="STANDARD">Standard</option><option value="ENHANCED">Enhanced</option></select></F>
                          <F label="BVN Number"><input style={iSt} value={formBvn} onChange={e=>setFormBvn(e.target.value)} /></F>
                          <F label="NIN Number"><input style={iSt} value={formNin} onChange={e=>setFormNin(e.target.value)} /></F>
                          <F label="ID Type"><select style={iSt} value={formIdType} onChange={e=>setFormIdType(e.target.value as any)}><option value="">—</option><option value="PASSPORT">Passport</option><option value="DRIVERS_LICENSE">Driver's License</option><option value="NATIONAL_ID">National ID</option><option value="VOTERS_CARD">Voter's Card</option></select></F>
                          <F label="ID Number"><input style={iSt} value={formIdNumber} onChange={e=>setFormIdNumber(e.target.value)} /></F>
                          <F label="ID Expiry Date"><input type="date" style={iSt} value={formIdExpiryDate} onChange={e=>setFormIdExpiryDate(e.target.value)} /></F>
                        </G4>
                        {sec('RISK & COMPLIANCE')}
                        <G4>
                          <F label="Risk Rating"><select style={iSt} value={formRiskRating} onChange={e=>setFormRiskRating(e.target.value as any)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></F>
                          <F label="AML Status"><select style={iSt} value={formAmlStatus} onChange={e=>setFormAmlStatus(e.target.value as any)}><option value="CLEAR">Clear</option><option value="UNDER_REVIEW">Under Review</option><option value="FLAGGED">Flagged</option></select></F>
                          <F label="Sanction Screen"><select style={iSt} value={formSanctionStatus} onChange={e=>setFormSanctionStatus(e.target.value as any)}><option value="PENDING">Pending</option><option value="CLEAR">Clear</option><option value="FLAGGED">Flagged</option></select></F>
                          <F label="Credit Score"><input type="number" style={iSt} value={formCreditScore} onChange={e=>setFormCreditScore(Number(e.target.value))} /></F>
                        </G4>
                        {sec('FLAGS')}
                        <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
                          {([['PEP Flag', formPepStatus, setFormPepStatus],['FATCA Subject', formFatcaStatus, setFormFatcaStatus]] as [string, boolean, (v:boolean)=>void][]).map(([label, val, set]) => (
                            <label key={label} style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', fontSize:'0.83rem', fontWeight:'600' }}>
                              <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} style={{ accentColor:'var(--primary)', width:'16px', height:'16px' }} />
                              {label}
                            </label>
                          ))}
                        </div>
                      </>}

                      {/* ── TAB 4: Loan & Overdraft ── */}
                      {formTab === 'loan' && <>
                        {sec('OVERDRAFT FACILITY')}
                        <G4>
                          <F label="Overdraft Enabled">
                            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', fontSize:'0.83rem', fontWeight:'600', marginTop:'0.35rem' }}>
                              <input type="checkbox" checked={formOverdraftEnabled} onChange={e=>setFormOverdraftEnabled(e.target.checked)} style={{ accentColor:'var(--primary)', width:'16px', height:'16px' }} />
                              Enable Overdraft
                            </label>
                          </F>
                          <F label="OD Limit (₦)"><input type="number" style={iSt} value={formOverdraftLimit} onChange={e=>setFormOverdraftLimit(Number(e.target.value))} disabled={!formOverdraftEnabled} /></F>
                          <F label="Interest Rate (%)"><input type="number" step="0.1" style={iSt} value={formOverdraftRate} onChange={e=>setFormOverdraftRate(parseFloat(e.target.value)||0)} disabled={!formOverdraftEnabled} /></F>
                          <F label="OD Status"><select style={iSt} value={formOverdraftStatus} onChange={e=>setFormOverdraftStatus(e.target.value as any)} disabled={!formOverdraftEnabled}><option value="INACTIVE">Inactive</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="EXPIRED">Expired</option></select></F>
                          <F label="OD Expiry Date"><input type="date" style={iSt} value={formOverdraftExpiry} onChange={e=>setFormOverdraftExpiry(e.target.value)} disabled={!formOverdraftEnabled} /></F>
                        </G4>
                        {sec('CREDIT')}
                        <G3>
                          <F label="Credit Score"><input type="number" style={iSt} value={formCreditScore} onChange={e=>setFormCreditScore(Number(e.target.value))} /></F>
                        </G3>
                      </>}
                    </>

                <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem', marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding:'0.6rem 1.4rem', fontSize:'0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : setIsEditMode(false)}>
                    Discard
                  </button>
                  <button type="submit" style={{ padding:'0.6rem 1.5rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.35rem', background:'var(--primary)', border:'none', color:'#000', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'800' }}>
                    <Save size={14} /> {selectedId === null ? 'Create Customer' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Save</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to save changes to this customer profile?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Successfully Saved</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Customer records have been updated in the CRM directory.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Delete Customer?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete this customer record? All trip histories will be anonymized.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDelete}>Delete Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PND WIZARD MODAL ── */}
      {showPndWizard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '540px', maxWidth: '95vw', padding: '0', overflow: 'hidden', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, transparent 100%)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                  <ShieldAlert size={17} />
                  {selectedPndEntry ? selectedPndEntry.label : activePndTypeId ? pndTypesMeta.find(p => p.id === activePndTypeId)?.label : 'Post No Debit (PND) Manager'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  {formName} · <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{selectedId}</span>
                </p>
              </div>
              <button onClick={() => { setShowPndWizard(false); setActivePndTypeId(null); setSelectedPndEntry(null); }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem 2rem', maxHeight: '70vh', overflowY: 'auto' }}>

              {/* LEVEL 1: PND Type list */}
              {!activePndTypeId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', color: 'var(--foreground-muted)', fontWeight: '700', letterSpacing: '0.06em' }}>SELECT A PND CATEGORY</p>
                  {pndTypesMeta.map(meta => {
                    const entries = pndSets[meta.id];
                    const anyActive = entries.some(e => e.active);
                    return (
                      <div key={meta.id} onClick={() => { setActivePndTypeId(meta.id); setSelectedPndEntry(null); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderRadius: '0.7rem', cursor: 'pointer', transition: 'all 0.18s', background: anyActive ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', border: anyActive ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.07)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = anyActive ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: anyActive ? '#10b981' : 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>{meta.label}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.15rem' }}>{meta.desc}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {anyActive && <span style={{ fontSize: '0.63rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '0.15rem 0.45rem', borderRadius: '1rem' }}>{entries.filter(e => e.active).length} ACTIVE</span>}
                          <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LEVEL 2: Entry list for selected type */}
              {activePndTypeId && !selectedPndEntry && (
                <div>
                  <button onClick={() => setActivePndTypeId(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', marginBottom: '1rem', padding: 0 }}>
                    <ArrowLeft size={13} /> Back
                  </button>
                  <p style={{ margin: '0 0 0.6rem', fontSize: '0.72rem', color: 'var(--foreground-muted)', fontWeight: '700', letterSpacing: '0.06em' }}>
                    {pndTypesMeta.find(p => p.id === activePndTypeId)?.label.toUpperCase()} ENTRIES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {pndSets[activePndTypeId].map(entry => (
                      <div key={entry.id}
                        onClick={() => { setSelectedPndEntry(entry); setPndFormAction(entry.active ? 'disable' : 'enable'); setPndFormReason(entry.reason); setPndFormComments(entry.comments); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderRadius: '0.7rem', cursor: 'pointer', transition: 'all 0.18s', background: entry.active ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', border: entry.active ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.07)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = entry.active ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.active ? '#10b981' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.87rem', color: '#fff' }}>{entry.label}</div>
                            {entry.active && entry.reason && <div style={{ fontSize: '0.68rem', color: 'var(--foreground-muted)', marginTop: '0.1rem' }}>Reason: {entry.reason}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {entry.active && <span style={{ fontSize: '0.63rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '0.15rem 0.45rem', borderRadius: '1rem' }}>ACTIVE</span>}
                          <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LEVEL 3: Entry form */}
              {activePndTypeId && selectedPndEntry && (
                <div>
                  <button onClick={() => setSelectedPndEntry(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', marginBottom: '1.2rem', padding: 0 }}>
                    <ArrowLeft size={13} /> Back to entries
                  </button>

                  <div style={{ padding: '0.9rem 1.1rem', borderRadius: '0.7rem', background: selectedPndEntry.active ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)', border: selectedPndEntry.active ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.07)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedPndEntry.active ? '#10b981' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fff' }}>{selectedPndEntry.label}</span>
                      {selectedPndEntry.active && <span style={{ marginLeft: '0.6rem', fontSize: '0.63rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>CURRENTLY ACTIVE</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Action select */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--foreground-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>ACTION</label>
                      <select value={pndFormAction} onChange={e => setPndFormAction(e.target.value as any)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <option value="enable" style={{ background: '#111' }}>Enable PND (Activate restriction)</option>
                        <option value="disable" style={{ background: '#111' }}>Disable PND (Remove restriction)</option>
                      </select>
                    </div>

                    {/* Reason select */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--foreground-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>REASON</label>
                      <select value={pndFormReason} onChange={e => setPndFormReason(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: pndFormReason ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                        <option value="" style={{ background: '#111' }}>— Select a reason —</option>
                        {pndReasonOptions.map(r => <option key={r} value={r} style={{ background: '#111' }}>{r}</option>)}
                      </select>
                    </div>

                    {/* Comments — only if reason is Other */}
                    {pndFormReason === 'Other' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: 'var(--foreground-muted)', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>ADDITIONAL COMMENTS</label>
                        <textarea value={pndFormComments} onChange={e => setPndFormComments(e.target.value)} rows={3} placeholder="Provide additional context..."
                          style={{ width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
                      </div>
                    )}

                    <button
                      disabled={!pndFormReason}
                      onClick={() => { if (pndFormAction === 'enable') { setPndConfirmOpen(true); } else {
                        setPndSets(prev => ({ ...prev, [activePndTypeId]: prev[activePndTypeId].map(e => e.id === selectedPndEntry.id ? { ...e, active: false, reason: pndFormReason, comments: pndFormComments } : e) }));
                        triggerToast(`${selectedPndEntry.label} has been disabled.`); setSelectedPndEntry(null);
                      }}}
                      style={{ padding: '0.8rem', borderRadius: '0.6rem', fontWeight: '700', fontSize: '0.85rem', cursor: pndFormReason ? 'pointer' : 'not-allowed', border: 'none', background: pndFormAction === 'enable' ? (pndFormReason ? '#ef4444' : 'rgba(239,68,68,0.3)') : (pndFormReason ? '#10b981' : 'rgba(16,185,129,0.3)'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                    >
                      {pndFormAction === 'enable' ? <><ShieldAlert size={15} /> Activate PND</> : <><CheckCircle size={15} /> Disable PND</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CURRENCY SELECTOR MODAL ── */}
      {showCurrencyModal && (
        <div
          onClick={() => setShowCurrencyModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface, #0f0f0f)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem',
              width: '100%', maxWidth: '560px',
              maxHeight: '80vh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
            }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Select Display Currency</span>
              <button onClick={() => setShowCurrencyModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem', fontSize: '1.1rem' }}>
                ✕
              </button>
            </div>
            <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <input
                autoFocus
                type="text"
                placeholder="Search currency or country…"
                value={currencySearch}
                onChange={e => setCurrencySearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.85rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem', color: '#fff',
                  fontSize: '0.85rem', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ overflowY: 'auto', padding: '0.75rem 1rem', flex: 1 }}>
              {(() => {
                const q = currencySearch.toLowerCase().trim();
                const filtered = ALL_CURRENCIES.filter(c =>
                  !q ||
                  c.code.toLowerCase().includes(q) ||
                  c.name.toLowerCase().includes(q) ||
                  c.symbol.toLowerCase().includes(q)
                );
                if (filtered.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>
                      No currencies found for "{currencySearch}"
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.4rem' }}>
                    {filtered.map(cur => {
                      const isActive = currency.displayCurrency === cur.code;
                      const rate = currency.rates[cur.code];
                      return (
                        <button
                          key={cur.code}
                          onClick={() => {
                            currency.setDisplayCurrency(cur.code);
                            setShowCurrencyModal(false);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 0.75rem',
                            background: isActive ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.02)',
                            border: isActive ? '1px solid rgba(255,184,0,0.35)' : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '0.6rem', cursor: 'pointer',
                            textAlign: 'left',
                          }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cur.flag}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isActive ? 'var(--primary)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cur.symbol} {cur.code}
                            </div>
                            <div style={{ fontSize: '0.58rem', color: 'var(--foreground-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cur.name}
                            </div>
                            {rate && (
                              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.05rem' }}>
                                1 USD = {rate >= 1 ? rate.toFixed(2) : rate.toFixed(4)} {cur.code}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.65rem', color: 'var(--foreground-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Rates source: {currency.ratesSource || 'Unknown'}</span>
              <button
                onClick={() => currency.refresh()}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.65rem', textDecoration: 'underline' }}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PND CONFIRMATION MODAL ── */}
      {pndConfirmOpen && selectedPndEntry && activePndTypeId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '90%', padding: '2rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
            <ShieldAlert size={38} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: '#ef4444' }}>Activate PND?</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--foreground-muted)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
              You are about to place <strong style={{ color: '#fff' }}>{selectedPndEntry.label}</strong> on this account.<br />
              Reason: <strong style={{ color: 'var(--primary)' }}>{pndFormReason}</strong>
            </p>
            <p style={{ fontSize: '0.78rem', color: '#ef4444', marginBottom: '1.5rem' }}>This will immediately restrict the customer's account activity.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setPndConfirmOpen(false)} style={{ padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}>No</button>
              <button
                onClick={() => {
                  setPndSets(prev => ({ ...prev, [activePndTypeId]: prev[activePndTypeId].map(e => e.id === selectedPndEntry.id ? { ...e, active: true, reason: pndFormReason, comments: pndFormComments } : e) }));
                  triggerToast(`${selectedPndEntry.label} activated successfully.`);
                  setPndConfirmOpen(false); setSelectedPndEntry(null);
                }}
                style={{ padding: '0.6rem 1.5rem', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}
              >Yes, Activate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
