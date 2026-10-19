"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  GraduationCap,
  CreditCard,
  Bug,
  Handshake,
  Scale,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  Phone,
  User,
} from "lucide-react";

// ============================================================
// FinanceHub — Official Contact Team & Support Desk
// app/contact/page.tsx
// Interactive Contact Form · Departmental Channels · Live SLA
// 1-Click Copy · Self-Service FAQs · SEBI Compliance Alignment
// ============================================================

type InquiryCategory =
  | "general"
  | "curriculum"
  | "billing"
  | "bug"
  | "partnership"
  | "compliance"
  | "grievance";

const INQUIRY_OPTIONS: { id: InquiryCategory; label: string; icon: any }[] = [
  { id: "general", label: "General Inquiry & Feedback", icon: MessageSquare },
  { id: "curriculum", label: "Curriculum, Tracks & Lessons", icon: GraduationCap },
  { id: "billing", label: "Billing, Subscription & Refunds", icon: CreditCard },
  { id: "bug", label: "Technical Issue or Bug Report", icon: Bug },
  { id: "partnership", label: "College / University Partnership", icon: Handshake },
  { id: "compliance", label: "Legal, SEBI & Regulatory Query", icon: Scale },
  { id: "grievance", label: "Grievance Officer Escalation", icon: ShieldCheck },
];

const DIRECT_CHANNELS = [
  {
    title: "Student Support & Helpdesk",
    email: "support@financehub.in",
    desc: "For lesson questions, course progress, certificate issues, and platform help.",
    icon: GraduationCap,
    badge: "Student Help",
  },
  {
    title: "General & Platform Inquiries",
    email: "hello@financehub.in",
    desc: "For general questions, creator inquiries, media, and general correspondence.",
    icon: Mail,
    badge: "Official Desk",
  },
  {
    title: "Grievance & Legal Officer",
    email: "grievance@financehub.in",
    desc: "Statutory escalation under India's IT Rules 2021 and DPDP Act 2023.",
    icon: ShieldCheck,
    badge: "Statutory Officer",
  },
  {
    title: "Institutional Partnerships",
    email: "partnerships@financehub.in",
    desc: "For colleges, business schools, finance clubs, and corporate training programs.",
    icon: Handshake,
    badge: "Colleges & B2B",
  },
];

const FAQS = [
  {
    q: "How fast does the FinanceHub support team respond?",
    a: "Our team operates Monday through Saturday from 9:00 AM to 7:00 PM IST. Standard inquiries receive an initial response within 2 to 4 business hours. Urgent billing or access issues are prioritized with a guaranteed 24-hour resolution SLA.",
  },
  {
    q: "How do I request a refund under the 7-day money-back guarantee?",
    a: "If you upgraded to Pro or Expert and wish to cancel within your first 7 days, you can request an instant refund by selecting 'Billing & Refunds' in the form above or emailing support@financehub.in with your registered email. Read our full policy at /legal/refund.",
  },
  {
    q: "How do I download or verify my course completion certificates?",
    a: "Once you achieve 100% completion in any learning track, your verifiable certificate is immediately issued in your Profile under Certificates. Anyone can verify the authenticity of a certificate at /certificates using the unique Certificate ID.",
  },
  {
    q: "Can universities, colleges, or finance clubs get bulk institutional access?",
    a: "Yes! We partner with university finance clubs, commerce colleges, and MBA institutions across India to provide subsidized student cohort access and custom simulation competitions. Select 'College / University Partnership' above to connect with our campus team.",
  },
  {
    q: "Does FinanceHub provide specific stock recommendations or trading calls?",
    a: "No. FinanceHub is strictly an educational platform. Under SEBI regulations, we do not provide investment advisory, research analyst services, stock tips, or portfolio management. All content is for financial literacy only. See /legal/sebi-compliance.",
  },
];

export default function ContactPage() {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<InquiryCategory>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Submission Status
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopyEmail = (address: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(address);
      setCopiedEmail(address);
      setTimeout(() => setCopiedEmail(null), 2500);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          category,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit your message. Please try again.");
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Something went wrong while sending your message. Please email hello@financehub.in directly."
      );
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCategory("general");
    setSubject("");
    setMessage("");
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 antialiased">
      {/* ══════════════════════════════════════════════════════════ */}
      {/* HEADER / NAVIGATION                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-horizontal.png"
                alt="FinanceHub"
                width={150}
                height={34}
                priority
                className="h-8 w-auto object-contain"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Link href="/explore" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                Explore Tracks
              </Link>
              <Link href="/library" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                Book Vault
              </Link>
              <Link href="/simulators" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                Simulators
              </Link>
              <Link href="/pricing" className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>← Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* BREADCRUMB                                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Contact Team</span>
        </nav>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* HERO BANNER                                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          className="relative rounded-3xl overflow-hidden mb-10 p-8 sm:p-12 text-white shadow-xl shadow-slate-900/10"
          style={{
            background: "linear-gradient(135deg, #0A192F 0%, #0E4B4C 50%, #0A2E2F 100%)",
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold tracking-wider uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Official Support &amp; Inquiries
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
              Contact the FinanceHub Team
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Have questions about our 8 learning tracks, certificates, pro subscriptions, institutional partnerships, or technical questions? Our support desk is dedicated to assisting you.
            </p>

            {/* Live Metrics */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <strong>&lt; 24h</strong> Response SLA
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                <Building className="w-3.5 h-3.5 text-blue-300" />
                India-Based Helpdesk
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                DPDP &amp; SEBI Aligned
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TWO-COLUMN GRID: FORM & DIRECT CHANNELS                   */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* LEFT: INTERACTIVE CONTACT FORM (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0E6163]" />
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fill in your details below and our team will get back to your email directly.
              </p>
            </div>

            {status === "success" ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to FinanceHub. We have logged your inquiry and sent an acknowledgment receipt to <strong className="text-slate-800">{email}</strong>.
                </p>
                <div className="p-4 rounded-xl bg-white border border-emerald-100 text-xs text-slate-600 max-w-sm mx-auto space-y-1">
                  <div><strong>Ticket Category:</strong> {INQUIRY_OPTIONS.find((o) => o.id === category)?.label}</div>
                  <div><strong>Expected Response:</strong> Within 24 business hours</div>
                </div>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl bg-[#0E6163] text-white text-xs font-bold hover:bg-[#0A4A4C] transition-colors inline-flex items-center gap-2"
                >
                  <span>Send Another Message</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === "error" && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Failed to send message:</strong> {errorMessage}
                    </div>
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E6163] focus:border-transparent bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E6163] focus:border-transparent bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E6163] focus:border-transparent bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Inquiry Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as InquiryCategory)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E6163] focus:border-transparent bg-slate-50/50 text-slate-700 font-medium"
                    >
                      {INQUIRY_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E6163] focus:border-transparent bg-slate-50/50"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Detailed Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {message.length}/3000 chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    maxLength={3000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query, issue, or request..."
                    className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E6163] focus:border-transparent bg-slate-50/50 leading-relaxed resize-y"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0E6163] to-[#1D9E75] hover:from-[#0A4A4C] hover:to-[#16805F] text-white text-sm font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === "submitting" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Sending your message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Team</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-normal">
                  By submitting, you agree to our{" "}
                  <Link href="/legal/privacy" className="text-emerald-700 hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/terms" className="text-emerald-700 hover:underline">
                    Terms of Service
                  </Link>
                  . We never share your contact details.
                </p>
              </form>
            )}
          </div>

          {/* RIGHT: DIRECT CHANNELS & DESK INFO (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Department Channels */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0E6163]" />
                Direct Departmental Inboxes
              </h3>
              <p className="text-xs text-slate-500">
                Prefer sending an email directly from your mail client? Copy any address below:
              </p>

              <div className="space-y-3 pt-2">
                {DIRECT_CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isCopied = copiedEmail === ch.email;

                  return (
                    <div
                      key={ch.email}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {ch.title}
                            </h4>
                            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                              {ch.badge}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyEmail(ch.email)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-semibold transition-all flex items-center gap-1 shrink-0"
                          title="Copy email address"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <a
                        href={`mailto:${ch.email}`}
                        className="text-xs font-mono text-emerald-800 hover:underline font-semibold block mb-1"
                      >
                        {ch.email}
                      </a>
                      <p className="text-[11px] text-slate-500 leading-normal">{ch.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support Desk Hours & Registered Location */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0E6163]" />
                Operating Hours &amp; Location
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Standard Business Hours:</strong>
                    <div className="text-slate-500 mt-0.5">Monday – Saturday: 9:00 AM – 7:00 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Weekend &amp; Urgent Support:</strong>
                    <div className="text-slate-500 mt-0.5">Emergency infrastructure &amp; billing tickets monitored 24/7.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Registered Office:</strong>
                    <div className="text-slate-500 mt-0.5">
                      FinanceHub Education Private Limited<br />
                      Knowledge Park &amp; Tech Corridor, Hyderabad &amp; Bengaluru, India.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SELF-SERVICE FAQ ACCORDION                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 mb-16">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#0E6163] text-[11px] font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Instant Answers
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find instant solutions to the most common questions before reaching out.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-emerald-700" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 py-4 text-xs sm:text-[13px] text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* COMPACT FOOTER                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 FinanceHub of India. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-slate-900">Terms of Service</Link>
            <Link href="/legal/sebi-compliance" className="hover:text-slate-900">SEBI Compliance</Link>
            <Link href="/legal/refund" className="hover:text-slate-900">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
