"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  FileCheck2,
  ImageUp,
  Landmark,
  LockKeyhole,
  UserRound,
  WalletCards,
} from "lucide-react";
import { PartnerApplicationPayload, submitPartnerApplication } from "@/lib/saas-api";

const steps = [
  { title: "Account", icon: UserRound },
  { title: "Business", icon: Building2 },
  { title: "KYC", icon: FileCheck2 },
  { title: "Payment", icon: WalletCards },
  { title: "Review", icon: BadgeCheck },
];

const initialForm: PartnerApplicationPayload = {
  auth: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "+234",
    password: "",
    tenantId: "tenant-001",
  },
  company: {
    legalName: "",
    tradingName: "",
    partnerType: "Fleet Operator",
    website: "",
    operatingMarkets: "Lagos",
    logoDataUrl: undefined,
  },
  kyc: {
    bvn: "",
    nin: "",
    registrationNumber: "",
    taxId: "",
    directorName: "",
    directorRole: "Director",
  },
  payment: {
    mode: "Bank Transfer",
    currency: "NGN",
    bankName: "",
    bankCode: "",
    accountName: "",
    accountNumber: "",
  },
};

type Section = keyof PartnerApplicationPayload;

function updateNested<T extends Section>(
  form: PartnerApplicationPayload,
  section: T,
  key: keyof PartnerApplicationPayload[T],
  value: string | undefined,
) {
  return {
    ...form,
    [section]: {
      ...form[section],
      [key]: value,
    },
  };
}

export default function BecomePartnerPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const email = params.get("email");
      const track = params.get("track");
      if (email || track) {
        setForm((current) => ({
          ...current,
          auth: {
            ...current.auth,
            email: email || current.auth.email,
          },
          company: {
            ...current.company,
            partnerType:
              track === "fleet"
                ? "Fleet Operator"
                : track === "travel"
                ? "Travel & Tours"
                : track === "logistics"
                ? "Logistics Provider"
                : track === "mobility"
                ? "Government / Public Mobility"
                : current.company.partnerType,
          },
        }));
      }
    }
  }, []);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function setField<T extends Section>(
    section: T,
    key: keyof PartnerApplicationPayload[T],
    value: string | undefined,
  ) {
    setForm((current) => updateNested(current, section, key, value));
  }

  function handleLogo(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("company", "logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit() {
    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await submitPartnerApplication(form);
      setResult(response as unknown as Record<string, unknown>);
      setMessage("Partner signup completed. Your SaaS user, partner profile, KYC, and settlement account were created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Partner signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-grid-white opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,184,0,0.14),transparent_36%,rgba(139,92,246,0.08))]" />

      <section className="section-inner relative z-10 py-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Queens OS" width={40} height={40} />
            <div>
              <p className="font-outfit text-lg font-bold">Queens OS Partners</p>
              <p className="text-sm text-foreground-muted">Guided partner signup</p>
            </div>
          </Link>

          <div className="flex gap-3">
            <Link href="/login" className="rounded-[8px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">
              Login
            </Link>
            <Link href="/" className="rounded-[8px] bg-primary px-4 py-3 text-sm font-bold text-black">
              Home
            </Link>
          </div>
        </header>

        <div className="mt-9 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[8px] border border-white/10 bg-black/72 p-5 backdrop-blur-xl">
            <p className="text-sm font-bold uppercase text-primary">Become a partner</p>
            <h1 className="mt-3 font-outfit text-4xl font-bold leading-tight">
              Complete signup, KYC, brand, payment, and bank setup.
            </h1>
            <p className="mt-4 text-sm leading-6 text-foreground-muted">
              The final submit calls the SaaS backend in sequence:
              register, verify account, login, create partner profile, create
              KYC, verify identity, submit KYC, and create settlement account.
            </p>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-7 grid gap-3">
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex items-center gap-3 rounded-[8px] border p-3 text-left transition ${
                    index === step
                      ? "border-primary/40 bg-primary/12 text-white"
                      : "border-white/10 bg-white/4 text-foreground-muted hover:bg-white/8"
                  }`}
                >
                  <item.icon size={18} className={index === step ? "text-primary" : ""} />
                  <span className="font-bold">{item.title}</span>
                  {index < step && <Check size={16} className="ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </aside>

          <div className="rounded-[8px] border border-white/10 bg-surface p-5 shadow-[0_32px_90px_rgba(0,0,0,0.5)] md:p-7">
            {step === 0 && (
              <div>
                <StepTitle eyebrow="SaaS identity" title="Create the partner admin account." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="First name" value={form.auth.firstName} onChange={(v) => setField("auth", "firstName", v)} />
                  <Field label="Last name" value={form.auth.lastName} onChange={(v) => setField("auth", "lastName", v)} />
                  <Field label="Email" type="email" value={form.auth.email} onChange={(v) => setField("auth", "email", v)} />
                  <Field label="Phone" value={form.auth.phone} onChange={(v) => setField("auth", "phone", v)} />
                  <Field label="Tenant ID" value={form.auth.tenantId} onChange={(v) => setField("auth", "tenantId", v)} />
                  <Field label="Password" type="password" value={form.auth.password} onChange={(v) => setField("auth", "password", v)} icon={<LockKeyhole size={17} />} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <StepTitle eyebrow="Business profile" title="Set up the partner brand and operating model." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="Legal company name" value={form.company.legalName} onChange={(v) => setField("company", "legalName", v)} />
                  <Field label="Trading name" value={form.company.tradingName} onChange={(v) => setField("company", "tradingName", v)} />
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">Partner type</span>
                    <select className="field" value={form.company.partnerType} onChange={(event) => setField("company", "partnerType", event.target.value)}>
                      {["Fleet Operator", "Travel & Tours", "Logistics Provider", "Payment Partner", "Government / Public Mobility"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="Website" value={form.company.website} onChange={(v) => setField("company", "website", v)} />
                  <Field label="Operating markets" value={form.company.operatingMarkets} onChange={(v) => setField("company", "operatingMarkets", v)} />
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">Company logo</span>
                    <div className="flex items-center gap-4 rounded-[8px] border border-white/10 bg-black/45 p-3">
                      <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-[8px] bg-white/6">
                        {form.company.logoDataUrl ? (
                          <Image src={form.company.logoDataUrl} alt="Partner logo preview" width={56} height={56} className="h-full w-full object-cover" />
                        ) : (
                          <ImageUp size={22} className="text-primary" />
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={(event) => handleLogo(event.target.files?.[0])} className="text-sm text-foreground-muted" />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepTitle eyebrow="KYC verification" title="Capture identity and compliance details." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="BVN" value={form.kyc.bvn} onChange={(v) => setField("kyc", "bvn", v)} />
                  <Field label="NIN" value={form.kyc.nin} onChange={(v) => setField("kyc", "nin", v)} />
                  <Field label="Registration number" value={form.kyc.registrationNumber} onChange={(v) => setField("kyc", "registrationNumber", v)} />
                  <Field label="Tax ID" value={form.kyc.taxId} onChange={(v) => setField("kyc", "taxId", v)} />
                  <Field label="Director name" value={form.kyc.directorName} onChange={(v) => setField("kyc", "directorName", v)} />
                  <Field label="Director role" value={form.kyc.directorRole} onChange={(v) => setField("kyc", "directorRole", v)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepTitle eyebrow="Settlement setup" title="Choose payment mode and bank details." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">Mode of payment</span>
                    <select className="field" value={form.payment.mode} onChange={(event) => setField("payment", "mode", event.target.value)}>
                      {["Bank Transfer", "Wallet Settlement", "Paystack Settlement", "Manual Invoice"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="Currency" value={form.payment.currency} onChange={(v) => setField("payment", "currency", v)} />
                  <Field label="Bank name" value={form.payment.bankName} onChange={(v) => setField("payment", "bankName", v)} icon={<Landmark size={17} />} />
                  <Field label="Bank code" value={form.payment.bankCode} onChange={(v) => setField("payment", "bankCode", v)} />
                  <Field label="Account name" value={form.payment.accountName} onChange={(v) => setField("payment", "accountName", v)} />
                  <Field label="Account number" value={form.payment.accountNumber} onChange={(v) => setField("payment", "accountNumber", v)} icon={<Banknote size={17} />} />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepTitle eyebrow="Review" title="Confirm the partner application before submission." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <ReviewCard title="Partner" rows={[form.company.legalName, form.company.partnerType, form.company.operatingMarkets]} />
                  <ReviewCard title="Admin" rows={[form.auth.email, form.auth.phone, form.auth.tenantId]} />
                  <ReviewCard title="KYC" rows={[`BVN ${mask(form.kyc.bvn)}`, `NIN ${mask(form.kyc.nin)}`, form.kyc.registrationNumber]} />
                  <ReviewCard title="Settlement" rows={[form.payment.mode, form.payment.bankName, mask(form.payment.accountNumber)]} />
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-6 py-4 font-bold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Submitting to SaaS backend..." : "Complete Partner Signup"}
                  <ArrowRight size={18} />
                </button>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0 || loading}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/5 px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={17} />
                Back
              </button>
              {step < steps.length - 1 && (
                <button
                  type="button"
                  onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-primary px-5 py-3 font-bold text-black"
                >
                  Continue
                  <ArrowRight size={17} />
                </button>
              )}
            </div>

            {message && (
              <p className="mt-5 rounded-[8px] border border-white/10 bg-white/5 p-4 text-sm text-foreground-muted">
                {message}
              </p>
            )}

            {result && (
              <pre className="mt-4 max-h-56 overflow-auto rounded-[8px] border border-white/10 bg-black/70 p-4 text-xs text-foreground-muted">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StepTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-outfit text-3xl font-bold">{title}</h2>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">{icon}</span>}
        <input className={`field ${icon ? "pl-12" : ""}`} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function ReviewCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/45 p-4">
      <h3 className="font-outfit text-lg font-bold">{title}</h3>
      <div className="mt-4 space-y-2">
        {rows.map((row, index) => (
          <p key={`${title}-${index}`} className="text-sm text-foreground-muted">
            {row || "Not provided"}
          </p>
        ))}
      </div>
    </div>
  );
}

function mask(value: string) {
  if (!value) return "not provided";
  if (value.length <= 4) return value;
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}
