import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useProfileData, type FarmerProfile, type OfficerProfile } from '@/useProfileData';
import { useBookingData, type Booking } from '@/useBookingData';
import { useTruckPoolData, type TruckPool, type PoolStatus } from '@/useTruckPoolData';
import { allCrops, cropRates, procurementCentres, centresForCrop, availableDates, availableTimes, cropName, type ProcurementCentre } from '@/cropData';
import { UserProfileContext, useUserProfile, defaultUserProfile, greetingFor, displayLocation, displayName, type UserProfile } from '@/userProfile';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudSun,
  Download,
  FileCheck2,
  FileText,
  IndianRupee,
  Languages,
  Leaf,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  PackageCheck,
  Phone,
  Plus,
  QrCode,
  ScanLine,
  Search,
  Share2,
  ShieldCheck,
  Sprout,
  SunMedium,
  Tractor,
  Truck,
  Upload,
  UserRound,
  Users,
  Users2,
  Wallet,
  X,
} from 'lucide-react';
import { t, type Language } from '@/translations';

type Role = 'farmer' | 'officer';
type Screen = 'welcome' | 'phone' | 'otp' | 'role' | 'profileSetup' | 'farmer' | 'book' | 'pass' | 'myBookings' | 'rates' | 'transport' | 'truckPool' | 'tractorPool' | 'trackPayment' | 'officer' | 'scanner' | 'farmerProfile' | 'officerProfile';

type BookScreenProps = { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData>; initialTime?: string; resetKey?: number };

type IconType = typeof Sprout;

const queue = [
  { name: 'Ramesh Kumar', crop: { en: 'Wheat', hi: 'गेहूं' }, quantity: { en: '24 Quintal', hi: '24 क्विंटल' }, quantityValue: 24, time: '09:30 AM', status: 'checkedIn' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Chomu', village: 'Govindgarh', pinCode: '303702', date: 'Wed, 15 May 2024' },
  { name: 'Sushila Devi', crop: { en: 'Mustard', hi: 'सरसों' }, quantity: { en: '12 Quintal', hi: '12 क्विंटल' }, quantityValue: 12, time: '10:00 AM', status: 'arriving' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Amer', village: 'Nayla', pinCode: '302028', date: 'Wed, 15 May 2024' },
  { name: 'Mohan Lal', crop: { en: 'Rice', hi: 'धान' }, quantity: { en: '18 Quintal', hi: '18 क्विंटल' }, quantityValue: 18, time: '10:30 AM', status: 'arriving' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Sanganer', village: 'Bassi', pinCode: '303301', date: 'Wed, 15 May 2024' },
  { name: 'Kamlesh Meena', crop: { en: 'Wheat', hi: 'गेहूं' }, quantity: { en: '30 Quintal', hi: '30 क्विंटल' }, quantityValue: 30, time: '11:00 AM', status: 'arriving' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Phulera', village: 'Sambhar', pinCode: '303604', date: 'Wed, 15 May 2024' },
  { name: 'Geeta Sharma', crop: { en: 'Paddy', hi: 'धान' }, quantity: { en: '15 Quintal', hi: '15 क्विंटल' }, quantityValue: 15, time: '11:30 AM', status: 'checkedIn' as const, state: 'Rajasthan', district: 'Jaipur', tehsil: 'Chaksu', village: 'Kotkhawada', pinCode: '303901', date: 'Wed, 15 May 2024' },
];

const recentScans = [
  { name: 'Ramesh Kumar', crop: { en: 'Wheat', hi: 'गेहूं' }, time: '09:32 AM', verified: true },
  { name: 'Suresh Patel', crop: { en: 'Mustard', hi: 'सरसों' }, time: '09:15 AM', verified: true },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark"><Sprout size={compact ? 18 : 22} strokeWidth={2.5} /></div>
      <div>
        <div className="font-display text-lg font-semibold tracking-tight text-forest-950">Fasal Flow</div>
        {!compact && <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Smart mandi access</div>}
      </div>
    </div>
  );
}

function Header({ language, setLanguage }: { language: Language; setLanguage: (value: Language) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <div className="flex items-center gap-2 sm:gap-5">
          <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="language-button" aria-label="Change language">
            <Languages size={17} /><span>{t('changeLanguage', language)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Progress({ step }: { step: number }) {
  return <div className="mb-8 flex items-center gap-2">{[1, 2, 3].map((item) => <div key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-green-600' : 'bg-slate-200'}`} />)}</div>;
}

function Welcome({ onStart, language, setLanguage }: { onStart: () => void; language: Language; setLanguage: (value: Language) => void }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop')" }}
      />
      {/* Dark overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />
      {/* Subtle bottom fade for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Language toggle - top right */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <div className="flex items-center gap-1 rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur-md">
          {(['en', 'hi'] as Language[]).map((lng) => (
            <button
              key={lng}
              onClick={() => setLanguage(lng)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${language === lng ? 'bg-white text-forest-950' : 'text-white/80 hover:text-white'}`}
            >
              {lng === 'en' ? 'EN' : 'हिं'}
            </button>
          ))}
        </div>
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        {/* Brand icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md sm:h-20 sm:w-20">
          <Sprout size={36} className="text-green-400 sm:size-10" strokeWidth={1.8} />
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] text-white drop-shadow-lg sm:text-7xl">
          {t('welcomeHeroTitle', language)}
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-lg font-medium text-green-300 drop-shadow-md sm:text-2xl">
          {t('welcomeHeroSubtitle', language)}
        </p>

        {/* Description */}
        <p className="mt-6 max-w-xl text-base leading-7 text-white/85 drop-shadow sm:mt-8 sm:text-lg sm:leading-8">
          {t('welcomeHeroDesc', language)}
        </p>

        {/* Stats */}
        <div className="mt-10 flex items-center gap-10 sm:mt-12">
          <div className="text-center">
            <span className="block font-display text-3xl font-semibold text-white drop-shadow sm:text-4xl">2.4L+</span>
            <span className="mt-1 block text-xs text-white/70 sm:text-sm">{t('farmersOnboarded', language)}</span>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="text-center">
            <span className="block font-display text-3xl font-semibold text-white drop-shadow sm:text-4xl">98%</span>
            <span className="mt-1 block text-xs text-white/70 sm:text-sm">{t('onTimeArrivals', language)}</span>
          </div>
        </div>

        {/* Get Started button */}
        <button
          onClick={onStart}
          className="group mt-12 inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-green-900/40 transition-all hover:bg-green-500 hover:shadow-green-900/50 active:scale-95 sm:mt-14 sm:px-10 sm:py-5 sm:text-xl"
        >
          {t('getStartedBilingual', language)}
          <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
        </button>

        {/* Trust badge */}
        <div className="mt-8 flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck size={16} className="text-green-400" />
          {t('safeVerified', language)}
        </div>
      </div>
    </div>
  );
}

function PhoneScreen({ onNext, onBack, language, setLanguage }: { onNext: (phone: string) => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  const { userProfile, setUserProfile } = useUserProfile();
  const [phone, setPhone] = useState(userProfile.phoneNumber);
  return <div className="min-h-screen bg-[#f7faf6]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-md px-5 py-12 sm:py-20"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button><Progress step={1} /><div className="mb-10"><div className="screen-icon"><ShieldCheck size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-forest-950">{t('welcomeToFasal', language)}</h1><p className="mt-3 leading-7 text-slate-600">{t('phoneSubtitle', language)}</p></div><label className="field-label">{t('mobileNumber', language)}</label><div className="phone-field"><span>+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" /></div><button onClick={() => { if (phone.length === 10) { setUserProfile((prev) => ({ ...prev, phoneNumber: phone })); onNext(phone); } }} disabled={phone.length !== 10} className="primary-button mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('sendCode', language)} <ArrowRight size={18} /></button><p className="mt-6 text-center text-xs leading-5 text-slate-500">{t('termsNotice', language)}</p></main></div>;
}

function OtpScreen({ phone, onNext, onBack, language, setLanguage }: { phone: string; onNext: () => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  const [otp, setOtp] = useState('');
  return <div className="min-h-screen bg-[#f7faf6]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-md px-5 py-12 sm:py-20"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('changeNumber', language)}</button><Progress step={1} /><div className="mb-10"><div className="screen-icon"><Check size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-forest-950">{t('checkMessages', language)}</h1><p className="mt-3 leading-7 text-slate-600">{t('otpSent', language)} <strong className="text-slate-800">+91 {phone}</strong>.</p></div><label className="field-label">{t('verificationCode', language)}</label><input className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" autoFocus /><div className="mt-4 flex justify-between text-sm"><button className="font-medium text-green-700">{t('resendCode', language)}</button><span className="text-slate-500">00:42</span></div><button onClick={onNext} disabled={otp.length !== 6} className="primary-button mt-8 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('verifyContinue', language)} <ArrowRight size={18} /></button></main></div>;
}

function RoleScreen({ onSelect, onBack, language, setLanguage }: { onSelect: (role: Role) => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  return <div className="min-h-screen bg-[#f7faf6]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-3xl px-5 py-12 sm:py-20"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button><Progress step={2} /><div className="mx-auto max-w-xl text-center"><div className="screen-icon mx-auto"><Users size={25} /></div><h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-forest-950">{t('whoAreYou', language)}</h1><p className="mt-3 leading-7 text-slate-600">{t('roleSubtitle', language)}</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2"><button onClick={() => onSelect('farmer')} className="role-card group"><div className="role-icon bg-[#e5f2df] text-green-700"><Sprout size={28} /></div><div className="flex-1 text-left"><h2 className="font-display text-xl font-semibold text-forest-950">{t('iAmFarmer', language)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t('farmerRoleDesc', language)}</p></div><ChevronRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-600" /></button><button onClick={() => onSelect('officer')} className="role-card group"><div className="role-icon bg-[#e8eee9] text-forest-800"><PackageCheck size={28} /></div><div className="flex-1 text-left"><h2 className="font-display text-xl font-semibold text-forest-950">{t('iAmOfficer', language)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t('officerRoleDesc', language)}</p></div><ChevronRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-green-600" /></button></div></main></div>;
}

function ProfileSetupScreen({ role, onComplete, onBack, language, setLanguage }: { role: Role; onComplete: () => void; onBack: () => void; language: Language; setLanguage: (value: Language) => void }) {
  const { userProfile, setUserProfile } = useUserProfile();
  const update = (field: keyof UserProfile, value: string) => setUserProfile((prev) => ({ ...prev, [field]: value }));
  const states = ['Rajasthan', 'Haryana', 'Uttar Pradesh'];
  return <div className="min-h-screen bg-[#f7faf6]"><Header language={language} setLanguage={setLanguage} /><main className="mx-auto max-w-2xl px-5 py-10 sm:py-16"><button className="back-link" onClick={onBack}><ChevronLeft size={17} /> {t('back', language)}</button><Progress step={3} /><div className="mb-8"><p className="eyebrow">{t('almostThere', language)}</p><h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-forest-950">{t('setupProfile', language)}</h1><p className="mt-3 leading-7 text-slate-600">{t('profileSubtitle', language)}</p></div><div className="form-card"><div className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label">{t('fullName', language)}</label><input className="text-input" value={userProfile.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder={role === 'farmer' ? 'e.g. Ramesh Kumar' : 'e.g. Anita Sharma'} /></div>{role === 'farmer' ? <><div><label className="field-label">{t('state', language)}</label><select className="text-input" value={userProfile.state} onChange={(event) => update('state', event.target.value)}><option value="">Select state</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</select></div><div><label className="field-label">{t('district', language)}</label><input className="text-input" value={userProfile.district} onChange={(event) => update('district', event.target.value)} placeholder="Jaipur" /></div><div><label className="field-label">{t('villageCity', language)}</label><input className="text-input" value={userProfile.village} onChange={(event) => update('village', event.target.value)} placeholder="Village name" /></div><div><label className="field-label">{t('pinCode', language)}</label><input className="text-input" value={userProfile.pinCode} onChange={(event) => update('pinCode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="302001" inputMode="numeric" /></div></> : <><div><label className="field-label">{t('assignedMandi', language)}</label><select className="text-input" value={userProfile.state} onChange={(event) => update('state', event.target.value)}><option value="">Select mandi</option><option>Jaipur Central Mandi</option><option>Haryana Mandi</option></select></div><div><label className="field-label">{t('employeeId', language)}</label><input className="text-input" value={userProfile.district} onChange={(event) => update('district', event.target.value)} placeholder="FF-2048" /></div></>}</div><button onClick={() => { setUserProfile((prev) => ({ ...prev, fullName: prev.fullName || 'Guest Farmer', isSetupComplete: true })); onComplete(); }} disabled={!userProfile.fullName} className="primary-button mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('continueDashboard', language)} <ArrowRight size={18} /></button></div><div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-green-600" /> {t('infoSecure', language)}</div></main></div>;
}

type NavItem = { id: Screen; label: string; icon: IconType };

function DashboardLayout({ children, language, setLanguage, active, setScreen, role, onSignOut }: { children: ReactNode; language: Language; setLanguage: (language: Language) => void; active: string; setScreen: (screen: Screen) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const nav: NavItem[] = role === 'officer'
    ? [{ id: 'officer', label: t('navOverview', language), icon: BarChart3 }, { id: 'scanner', label: t('navScanner', language), icon: ScanLine }, { id: 'rates', label: t('navMspRates', language), icon: IndianRupee }]
    : [{ id: 'farmer', label: t('navHome', language), icon: Sprout }, { id: 'book', label: t('navBookSlot', language), icon: CalendarDays }, { id: 'myBookings', label: t('navMyBookings', language), icon: FileCheck2 }, { id: 'truckPool', label: t('navTruckPool', language), icon: Truck }, { id: 'tractorPool', label: t('navTractorPool', language), icon: Tractor }, { id: 'rates', label: t('navMspRates', language), icon: IndianRupee }];

  const homeScreen: Screen = role === 'officer' ? 'officer' : 'farmer';
  const profileScreen: Screen = role === 'officer' ? 'officerProfile' : 'farmerProfile';

  return <div className="min-h-screen bg-[#f6f8f5]"><Header language={language} setLanguage={setLanguage} /><div className="mx-auto flex max-w-7xl"><aside className="hidden w-60 shrink-0 border-r border-slate-200/80 px-5 py-8 md:block"><div className="mb-9 px-3"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{role === 'officer' ? t('mandiOperations', language) : t('farmerSpace', language)}</p><p className="mt-1 font-display font-semibold text-forest-950">{role === 'officer' ? t('jaipurCentral', language) : displayName(userProfile)}</p></div><nav className="space-y-1">{nav.map((item) => <button key={item.id} onClick={() => setScreen(item.id)} className={`side-nav ${active === item.id ? 'active' : ''}`}><item.icon size={18} />{item.label}</button>)}</nav><div className="mt-10 border-t border-slate-200 pt-5"><button onClick={() => setScreen(profileScreen)} className={`side-nav ${active === profileScreen ? 'active' : ''}`}><UserRound size={18} />{t('myProfile', language)}</button><button onClick={onSignOut} className="side-nav text-slate-500"><ArrowRight size={18} className="rotate-180" />{t('signOut', language)}</button></div></aside><main className="min-w-0 flex-1 px-5 py-7 pb-24 sm:px-8 lg:px-12 lg:py-10">{children}</main></div><nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur md:hidden">{nav.map((item) => <button key={item.id} onClick={() => setScreen(item.id)} className={`bottom-nav ${active === item.id ? 'active' : ''}`}><item.icon size={19} /><span>{item.label}</span></button>)}</nav></div>;
}

function PageBack({ title, onBack }: { title: string; onBack: () => void }) {
  return <div className="flex items-center gap-3"><button className="icon-button" onClick={onBack}><ChevronLeft size={19} /></button><h1 className="font-display text-3xl font-semibold tracking-tight text-forest-950">{title}</h1></div>;
}

function ActionCard({ icon: Icon, label, detail, onClick }: { icon: IconType; label: string; detail: string; onClick: () => void }) {
  return <button onClick={onClick} className="action-card"><div className="action-icon"><Icon size={20} /></div><div className="mt-4 text-left"><p className="font-semibold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><ChevronRight className="absolute right-3 top-3 text-slate-300" size={16} /></button>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}

function StatCard({ label, value, detail, icon: Icon, green = false }: { label: string; value: string; detail: string; icon: IconType; green?: boolean }) {
  return <div className="stat-card"><div className={`stat-icon ${green ? 'green' : ''}`}><Icon size={19} /></div><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-display text-3xl font-semibold text-forest-950">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div></div>;
}

function MandiRushWidget({ language, onBookRecommended }: { language: Language; onBookRecommended: () => void }) {
  return <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50/60 to-white p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Users2 size={20} /></div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold text-forest-950">{t('mandiRushPrediction', language)}</h3>
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"><span>⚠️ </span>{t('rushHighAlert', language)}</div>
        <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"><span>💡 </span>{t('rushRecommendation', language)}</div>
        <button onClick={onBookRecommended} className="primary-button mt-4 w-full justify-center text-sm sm:w-auto"><CalendarDays size={16} /> {t('bookRecommendedSlot', language)}</button>
      </div>
    </div>
  </div>;
}

function FarmerDashboard({ setScreen, language, setLanguage, role, onSignOut, onBookRecommended }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; onBookRecommended: () => void }) {
  const { userProfile } = useUserProfile();
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateStr = currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = currentTime.getHours();
  const greetingKey = greetingFor(hour);
  return <DashboardLayout language={language} setLanguage={setLanguage} active="farmer" setScreen={setScreen} role={role} onSignOut={onSignOut}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{dateStr} · {timeStr}</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">{t(greetingKey, language)}, {displayName(userProfile)}</h1><div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} className="text-green-600" /> {displayLocation(userProfile)}</div></div><button className="icon-button self-start sm:self-auto"><Bell size={19} /><span className="notification-dot" /></button></div><div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]"><div className="weather-card"><div className="weather-bg-overlay" /><div className="weather-content"><div className="weather-top"><div><p className="text-sm font-medium text-white/90">{t('todaysWeather', language)}</p><p className="mt-3 font-display text-4xl font-semibold text-white">28° <span className="text-xl font-medium">C</span></p><p className="mt-1 text-sm text-white/85">{t('sunnyClearWeather', language)}</p><p className="mt-1 flex items-center gap-1 text-xs text-white/75"><MapPin size={12} /> {displayLocation(userProfile)}</p></div><SunMedium size={65} strokeWidth={1.4} className="text-amber-300" /></div><div className="weather-meta"><span>{t('humidity', language)} <b>42%</b></span><span>{t('wind', language)} <b>12 km/h</b></span><span>{t('rain', language)} <b>0%</b></span></div></div></div><div className="status-card"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{t('nextMandiVisit', language)}</p><div className="status-pill"><span /> {t('tomorrow', language)}</div></div><p className="mt-5 font-display text-2xl font-semibold text-forest-950">{t('jaipurCentral', language)}</p><p className="mt-1 text-sm text-slate-500">{t('wednesdayTime', language)}</p><button onClick={() => setScreen('pass')} className="mt-5 text-sm font-semibold text-green-700">{t('viewDigitalPass', language)} <ArrowRight size={15} className="ml-1 inline" /></button></div></div><MandiRushWidget language={language} onBookRecommended={onBookRecommended} /><section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">{t('whatToDo', language)}</h2><span className="text-xs text-slate-400">{t('quickActions', language)}</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><ActionCard icon={CalendarDays} label={t('bookSlotAction', language)} detail={t('chooseTimeCrop', language)} onClick={() => setScreen('book')} /><ActionCard icon={FileCheck2} label={t('myBookings', language)} detail={t('viewManageBookings', language)} onClick={() => setScreen('myBookings')} /><ActionCard icon={Wallet} label={t('trackPayment', language)} detail={t('trackPaymentDesc', language)} onClick={() => setScreen('trackPayment')} /><ActionCard icon={Truck} label={t('navTruckPool', language)} detail={t('truckPoolDesc', language)} onClick={() => setScreen('truckPool')} /><ActionCard icon={IndianRupee} label={t('checkMspRates', language)} detail={t('todaysFairPrices', language)} onClick={() => setScreen('rates')} /></div></section><section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">{t('todaysMspRates', language)}</h2><button onClick={() => setScreen('rates')} className="text-sm font-semibold text-green-700">{t('seeAll', language)} <ArrowRight size={15} className="ml-1 inline" /></button></div><div className="grid gap-3 sm:grid-cols-3">{cropRates.map((item) => <div key={item.en} className="rate-card"><div className={`crop-icon ${item.color}`}><Leaf size={18} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{item[language]}</p><p className="text-xs text-slate-400">{t('perQuintal', language)}</p></div><div className="text-right"><p className="font-display text-lg font-semibold text-forest-950">{item.rate}</p><p className="text-xs font-semibold text-green-600">{item.change}</p></div></div>)}</div></section></DashboardLayout>;
}

function BookScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData, initialTime, resetKey }: BookScreenProps) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState('');
  const [centre, setCentre] = useState<ProcurementCentre | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(initialTime ?? '');
  const [quantity, setQuantity] = useState('24');
  const [unit, setUnit] = useState('Quintal');
  const [submitted, setSubmitted] = useState(false);
  const [cropSearch, setCropSearch] = useState('');
  useEffect(() => { if (initialTime) setSelectedTime(initialTime); }, [resetKey, initialTime]);

  const filteredCrops = allCrops.filter((c) => c.en.toLowerCase().includes(cropSearch.toLowerCase()) || c.hi.includes(cropSearch));
  const centres = crop ? centresForCrop(crop) : [];

  const steps = [t('stepCrop', language), t('stepCentre', language), t('stepDateTime', language), t('stepConfirm', language)];

  const handleConfirm = () => {
    if (!crop || !centre || !selectedDate || !selectedTime) return;
    bookingData.createBooking(crop, centre.id, centre.name, selectedDate, selectedTime, quantity, unit);
    setSubmitted(true);
  };

  const reset = () => {
    setStep(0); setCrop(''); setCentre(null); setSelectedDate(''); setSelectedTime(''); setSubmitted(false); setCropSearch('');
  };

  if (submitted) {
    return <DashboardLayout language={language} setLanguage={setLanguage} active="book" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('bookMandiSlot', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="success-panel"><div className="success-icon"><Check size={28} /></div><h2 className="mt-5 font-display text-3xl font-semibold text-forest-950">{t('slotBookedSuccess', language)}</h2><p className="mt-3 leading-7 text-slate-600">{t('passReady', language)}</p><div className="booking-summary"><span>{centre!.name}</span><strong>{selectedDate} · {selectedTime}</strong><span>{cropName(crop, language)} · {quantity} {unit}</span></div><div className="mt-5 flex gap-3"><button onClick={() => setScreen('pass')} className="primary-button flex-1 justify-center">{t('viewMyPass', language)} <QrCode size={18} /></button><button onClick={() => setScreen('myBookings')} className="secondary-button flex-1 justify-center">{t('myBookings', language)} <FileCheck2 size={18} /></button></div></div></div></DashboardLayout>;
  }

  return <DashboardLayout language={language} setLanguage={setLanguage} active="book" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('bookMandiSlot', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    <div className="step-indicator">{steps.map((label, i) => <div key={i} className="step"><div className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}>{i < step ? <Check size={14} /> : i + 1}</div><span className={`step-label ${i === step ? 'active' : ''}`}>{label}</span>{i < steps.length - 1 && <div className={`step-bar ${i < step ? 'done' : ''}`} />}</div>)}</div>

    {step === 0 && <div className="form-card"><h2 className="font-display text-2xl font-semibold text-forest-950">{t('selectCrop', language)}</h2><div className="mt-4 search-field"><Search size={16} /><input placeholder={t('searchCrop', language)} value={cropSearch} onChange={(e) => setCropSearch(e.target.value)} /></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{filteredCrops.map((item) => <button key={item.en} onClick={() => { setCrop(item.en); setCentre(null); setSelectedDate(''); setSelectedTime(''); setStep(1); }} className={`choice-button ${crop === item.en ? 'selected' : ''} justify-start`}><Leaf size={16} /> {item[language]}</button>)}</div></div>}

    {step === 1 && <div><div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Leaf size={15} className="text-green-600" /> {cropName(crop, language)}</div>{centres.length === 0 ? <p className="text-sm text-slate-500">{t('noCentresForCrop', language)}</p> : <div className="space-y-3">{centres.map((c) => { const avail = bookingData.getAvailableSlotCount(c.id); const isFull = avail === 0; return <div key={c.id} className={`centre-card ${isFull ? 'disabled' : ''}`}><div className="centre-card-top"><div><p className="centre-name">{c.name}</p><p className="centre-area"><MapPin size={12} /> {c.area}</p></div><span className="centre-distance">{c.distanceKm} km</span></div><div className="flex items-center justify-between"><span className={`slot-badge ${isFull ? 'full' : 'available'}`}>{isFull ? t('noSlotsAvailable', language) : `${avail} ${t('slotsAvailable', language)}`}</span>{isFull ? <span className="text-xs font-semibold text-slate-400">{t('full', language)}</span> : <button onClick={() => { setCentre(c); setStep(2); }} className="secondary-button justify-center">{t('selectCentre', language)}</button>}</div></div>; })}</div>}</div>}

    {step === 2 && centre && <div className="form-card"><div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><Leaf size={15} className="text-green-600" /> {cropName(crop, language)} <span className="text-slate-300">·</span> <MapPin size={15} className="text-green-600" /> {centre.name}</div><label className="field-label">{t('chooseDate', language)}</label><div className="mt-2 flex gap-2 overflow-x-auto pb-2">{availableDates.map((date) => <button key={date} onClick={() => setSelectedDate(date)} className={`choice-button ${selectedDate === date ? 'selected' : ''} justify-start whitespace-nowrap`}><CalendarDays size={16} /> {date}</button>)}</div><label className="field-label mt-5">{t('availableTimeSlots', language)}</label>{selectedDate ? <div className="mt-2 flex flex-wrap gap-2">{availableTimes.map((time) => { const available = bookingData.isSlotAvailable(centre.id, selectedDate, time); return <button key={time} disabled={!available} onClick={() => setSelectedTime(time)} className={`choice-button ${selectedTime === time ? 'selected' : ''} justify-start ${!available ? 'cursor-not-allowed opacity-40' : ''}`}>{!available && <span className="mr-1 text-xs font-semibold text-red-500">{t('slotTaken', language)}</span>}<Clock3 size={16} /> {time}</button>; })}</div> : <p className="mt-2 text-xs text-slate-400">{t('chooseDate', language)}</p>}</div>}

    {step === 3 && centre && <div className="form-card"><h2 className="font-display text-2xl font-semibold text-forest-950">{t('reviewBooking', language)}</h2><div className="mt-6 space-y-4"><Info label={t('crop', language)} value={cropName(crop, language)} /><Info label={t('procurementCentre', language)} value={centre.name} /><Info label={t('date', language)} value={selectedDate} /><Info label={t('arrivalTime', language)} value={selectedTime} /><div><label className="field-label">{t('expectedQuantity', language)}</label><div className="mt-1 flex items-center gap-2"><input className="text-input" value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/\\D/g, '').slice(0, 4))} placeholder="24" inputMode="numeric" /><select className="text-input max-w-[130px]" value={unit} onChange={(event) => setUnit(event.target.value)}><option>Quintal</option><option>Kg</option></select></div></div></div><button onClick={handleConfirm} className="primary-button mt-8 w-full justify-center">{t('confirmBooking', language)} <Check size={18} /></button></div>}

    {step > 0 && !submitted && <div className="mt-5 flex gap-3"><button onClick={() => setStep(step - 1)} className="secondary-button flex-1 justify-center"><ChevronLeft size={18} /> {t('backStep', language)}</button>{step < 3 && <button onClick={() => { if (step === 1 && centre) setStep(2); else if (step === 2 && selectedDate && selectedTime) setStep(3); }} disabled={(step === 2 && (!selectedDate || !selectedTime)) || (step === 1 && !centre)} className="primary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-40">{t('nextStep', language)} <ChevronRight size={18} /></button>}</div>}
  </div></DashboardLayout>;
}

function PassScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData> }) {
  const homeScreen: Screen = role === 'officer' ? 'officer' : 'farmer';
  const { userProfile } = useUserProfile();
  const booking = bookingData.latestBooking;
  const [toast, setToast] = useState(false);

  const showToast = (msg: string) => { setToast(true); setTimeout(() => setToast(false), 2500); };

  const farmerName = displayName(userProfile);

  const passText = booking ? [
    `Fasal Flow - Digital Pass`,
    `Booking ID: ${booking.id}`,
    `Name: ${farmerName}`,
    `Crop: ${cropName(booking.crop, language)}`,
    `Quantity: ${booking.quantity} ${booking.unit}`,
    `Procurement Centre: ${booking.centreName}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Status: ${booking.status === 'confirmed' ? t('confirmed', language) : t('cancelled', language)}`,
  ].join('\n') : '';

  const handleDownload = () => {
    if (!booking) return;
    const pdfContent = generatePassPDF(booking, farmerName, language);
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FasalFlow-Pass-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!booking) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Fasal Flow Pass', text: passText }); } catch { /* user cancelled */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(passText); showToast(t('passCopied', language)); } catch { /* ignore */ }
    } else {
      const ta = document.createElement('textarea'); ta.value = passText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(t('passCopied', language));
    }
  };

  if (!booking) {
    return <DashboardLayout language={language} setLanguage={setLanguage} active="pass" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('myDigitalPassTitle', language)} onBack={() => setScreen(homeScreen)} /><div className="mx-auto mt-7 max-w-2xl"><div className="panel text-center"><div className="screen-icon mx-auto"><QrCode size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-forest-950">{t('noPassYet', language)}</h2><button onClick={() => setScreen('book')} className="primary-button mt-6 justify-center">{t('bookSlotNow', language)} <CalendarDays size={18} /></button></div></div></DashboardLayout>;
  }

  return <DashboardLayout language={language} setLanguage={setLanguage} active="pass" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('myDigitalPassTitle', language)} onBack={() => setScreen(homeScreen)} /><div className="mx-auto mt-7 max-w-2xl"><div className="pass-card"><div className="flex items-start justify-between"><div><div className="status-pill"><span /> {t('confirmed', language)}</div><h2 className="mt-5 font-display text-3xl font-semibold text-forest-950">{booking.centreName}</h2><p className="mt-1 text-slate-500">{t('gate2FarmerEntry', language)}</p></div><div className="qr-box"><QrCode size={72} strokeWidth={1.4} /><span>{t('scanAtGate', language)}</span></div></div><div className="my-8 h-px bg-slate-200" /><div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4"><Info label={t('bookingId', language)} value={booking.id} /><Info label={t('date', language)} value={booking.date} /><Info label={t('arrivalTime', language)} value={booking.time} /><Info label={t('crop', language)} value={cropName(booking.crop, language)} /><Info label={t('quantity', language)} value={`${booking.quantity} ${booking.unit}`} /></div><div className="mt-8 rounded-2xl bg-[#f3f7f1] p-4 text-sm leading-6 text-slate-600"><strong className="text-slate-800">{t('remember', language)}</strong> {t('rememberNotice', language)}</div></div><div className="mt-4 flex gap-3"><button onClick={handleDownload} className="secondary-button flex-1 justify-center"><Download size={18} /> {t('downloadPass', language)}</button><button onClick={handleShare} className="secondary-button flex-1 justify-center"><Share2 size={18} /> {t('sharePass', language)}</button></div></div>{toast && <div className="toast"><Check size={16} /> {t('passCopied', language)}</div>}</DashboardLayout>;
}

function generatePassPDF(booking: Booking, farmerName: string, lang: Language): string {
  const lines = [
    'Fasal Flow - Digital Pass',
    '============================',
    '',
    `Booking ID:     ${booking.id}`,
    `Name:           ${farmerName}`,
    `Crop:           ${cropName(booking.crop, lang)}`,
    `Quantity:       ${booking.quantity} ${booking.unit}`,
    `Centre:         ${booking.centreName}`,
    `Date:           ${booking.date}`,
    `Time:           ${booking.time}`,
    `Status:         ${booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}`,
    '',
    '============================',
    'Please present this pass at the gate.',
  ];
  return lines.join('\n');
}

function RatesScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [selected, setSelected] = useState('Wheat');
  const homeScreen: Screen = role === 'officer' ? 'officer' : 'farmer';
  return <DashboardLayout language={language} setLanguage={setLanguage} active="rates" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('liveMspRates', language)} onBack={() => setScreen(homeScreen)} /><div className="mt-3 flex items-center gap-2 text-sm text-slate-500"><span className="live-dot" /> {t('updatedToday', language)}</div><div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="panel"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{t('currentMsp', language)}</p><p className="mt-1 font-display text-4xl font-semibold text-forest-950">₹2,275 <span className="text-base font-medium text-slate-400">/ quintal</span></p></div><div className="rate-up">+4.2% <span>{t('thisSeason', language)}</span></div></div><div className="chart mt-8"><div className="chart-labels"><span>₹2,400</span><span>₹2,200</span><span>₹2,000</span></div><svg viewBox="0 0 500 180" preserveAspectRatio="none" className="h-40 w-full"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3d8b45" stopOpacity=".22" /><stop offset="1" stopColor="#3d8b45" stopOpacity="0" /></linearGradient></defs><path d="M0,145 C55,134 70,150 110,112 S170,130 210,92 S255,115 300,72 S345,83 375,48 S430,62 500,18 V180 H0Z" fill="url(#fill)" /><path d="M0,145 C55,134 70,150 110,112 S170,130 210,92 S255,115 300,72 S345,83 375,48 S430,62 500,18" fill="none" stroke="#398547" strokeWidth="3" strokeLinecap="round" /></svg><div className="flex justify-between text-xs text-slate-400"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span></div></div></div><div className="panel"><h2 className="section-title">{t('compareCrops', language)}</h2><div className="mt-5 space-y-2">{cropRates.map((item) => <button key={item.en} onClick={() => setSelected(item.en)} className={`rate-row ${selected === item.en ? 'selected' : ''}`}><div className={`crop-icon small ${item.color}`}><Leaf size={15} /></div><div className="flex-1 text-left"><p className="font-medium text-slate-800">{item[language]}</p><p className="text-xs text-slate-400">{t('msp2024', language)}</p></div><div className="text-right"><p className="font-semibold text-slate-800">{item.rate}</p><p className="text-xs text-green-600">{item.change}</p></div></button>)}</div><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" /> {t('ratesSource', language)}</div></div></div></DashboardLayout>;
}

function TransportScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const pickupDefault = displayLocation(userProfile) !== t('locationNotSet', language) ? displayLocation(userProfile) : 'Chomu, Jaipur';
  return <DashboardLayout language={language} setLanguage={setLanguage} active="transport" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('findTransportTitle', language)} onBack={() => setScreen('farmer')} /><div className="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div className="panel"><div className="screen-icon"><Truck size={24} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-forest-950">{t('moveYourHarvest', language)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t('transportSubtitle', language)}</p><label className="field-label mt-7">{t('pickupLocation', language)}</label><div className="phone-field"><MapPin size={17} className="text-green-600" /><input defaultValue={pickupDefault} /></div><label className="field-label mt-5">{t('loadSize', language)}</label><select className="text-input"><option>Up to 25 Quintal</option><option>25–50 Quintal</option></select><button className="primary-button mt-6 w-full justify-center">{t('findVehicles', language)} <Search size={18} /></button></div><div className="space-y-3"><p className="text-sm font-medium text-slate-500">{t('verifiedVehiclesNearby', language)}</p>{[['Mahindra Bolero Pickup', 'Raju Singh', '₹850', '2.4 km'], ['Tata 407 Truck', 'Vijay Transport', '₹1,400', '5.1 km'], ['Tractor trolley', 'Gopal Meena', '₹650', '7.8 km']].map(([vehicle, owner, price, distance]) => <div className="vehicle-card" key={vehicle}><div className="vehicle-icon"><Truck size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{vehicle}</p><p className="mt-1 text-sm text-slate-500">{owner} · <span className="text-green-700">{t('verified', language)}</span></p><p className="mt-2 text-xs text-slate-400">{distance} {t('away', language)}</p></div><div className="text-right"><p className="font-semibold text-slate-800">{price} <span className="text-xs font-normal text-slate-400">{t('estimated', language)}</span></p><button className="mt-2 text-xs font-semibold text-green-700">{t('request', language)}</button></div></div>)}</div></div></DashboardLayout>;
}

const nearbyLoads = [
  { farmer: 'Ramesh Kumar', crop: 'Wheat', quantity: '24 Quintal', pickup: 'Chomu, Jaipur', destination: 'Jaipur Central Mandi', date: 'Wed, 15 May', time: '09:30 AM', distance: '2.4 km', price: '₹850' },
  { farmer: 'Sushila Devi', crop: 'Mustard', quantity: '12 Quintal', pickup: 'Amer, Jaipur', destination: 'Jaipur Central Mandi', date: 'Wed, 15 May', time: '10:00 AM', distance: '5.1 km', price: '₹650' },
  { farmer: 'Mohan Lal', crop: 'Rice', quantity: '18 Quintal', pickup: 'Bassi, Jaipur', destination: 'Jaipur Central Mandi', date: 'Wed, 15 May', time: '10:30 AM', distance: '7.8 km', price: '₹700' },
];

function TractorPoolScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [tab, setTab] = useState<'verify' | 'loads'>('verify');
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [pollutionUploaded, setPollutionUploaded] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  const canSubmit = licenseUploaded && pollutionUploaded && vehicleNumber.length >= 6;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    showToast(t('verificationPending', language));
    setTab('loads');
  };

  return <DashboardLayout language={language} setLanguage={setLanguage} active="tractorPool" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('tractorPooling', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    <div className="pool-tab"><button className={tab === 'verify' ? 'active' : ''} onClick={() => setTab('verify')}><ShieldCheck size={16} /> {t('driverVerification', language)}</button><button className={tab === 'loads' ? 'active' : ''} onClick={() => setTab('loads')}><Truck size={16} /> {t('loadMatchingDashboard', language)}</button></div>

    {tab === 'verify' && <div className="form-card"><div className="screen-icon"><Tractor size={24} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-forest-950">{t('driverVerification', language)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t('verificationSubtitle', language)}</p>
      {submitted && <div className="mt-5"><span className="verification-badge pending"><Clock3 size={14} /> {t('verificationPending', language)}</span></div>}
      <div className="mt-6 space-y-5">
        <div><label className="field-label">{t('drivingLicense', language)}</label>
          <div className={`upload-box ${licenseUploaded ? 'uploaded' : ''}`} onClick={() => setLicenseUploaded(!licenseUploaded)}>
            {licenseUploaded ? <><CheckCircle2 size={28} className="upload-icon" /><span className="upload-text">{t('uploadComplete', language)}</span></> : <><Upload size={28} className="upload-icon" /><span className="upload-text">{t('uploadLicense', language)}</span></>}
          </div>
        </div>
        <div><label className="field-label">{t('vehicleNumber', language)}</label><input className="text-input" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase().slice(0, 12))} placeholder={t('enterVehicleNumber', language)} /></div>
        <div><label className="field-label">{t('pollutionCert', language)}</label>
          <div className={`upload-box ${pollutionUploaded ? 'uploaded' : ''}`} onClick={() => setPollutionUploaded(!pollutionUploaded)}>
            {pollutionUploaded ? <><CheckCircle2 size={28} className="upload-icon" /><span className="upload-text">{t('uploadComplete', language)}</span></> : <><Upload size={28} className="upload-icon" /><span className="upload-text">{t('uploadPollutionCert', language)}</span></>}
          </div>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!canSubmit} className="primary-button mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40">{submitted ? <><CheckCircle2 size={18} /> {t('verificationPending', language)}</> : <>{t('submitVerification', language)} <ArrowRight size={18} /></>}</button>
    </div>}

    {tab === 'loads' && <div>
      {!submitted && <div className="mb-4 panel" style={{ borderColor: '#fdf5e6', background: '#fefbf3' }}><p className="text-sm text-slate-600">{t('verificationSubtitle', language)}</p><button onClick={() => setTab('verify')} className="text-sm font-semibold text-green-700 mt-2">{t('driverVerification', language)} →</button></div>}
      <p className="mb-3 text-sm font-medium text-slate-500">{t('loadMatchingSubtitle', language)}</p>
      {nearbyLoads.length === 0 ? <div className="panel text-center"><p className="text-sm text-slate-500">{t('noLoadsAvailable', language)}</p></div> : <div className="space-y-3">{nearbyLoads.map((load, i) => <div key={i} className="load-card"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="vehicle-icon"><Truck size={21} /></div><div><p className="font-semibold text-slate-800">{load.farmer}</p><p className="mt-1 text-xs text-slate-400">{load.crop} · {load.quantity}</p></div></div><span className="load-match-tag"><MapPin size={12} /> {load.distance}</span></div><div className="mt-4 grid grid-cols-2 gap-3"><Info label={t('pickupLocation', language)} value={load.pickup} /><Info label={t('procurementCentre', language)} value={load.destination} /><Info label={t('preferredDate', language)} value={load.date} /><Info label={t('preferredTime', language)} value={load.time} /></div><div className="mt-4 flex items-center justify-between"><p className="font-display text-lg font-semibold text-forest-950">{load.price} <span className="text-xs font-normal text-slate-400">{t('estimated', language)}</span></p><button onClick={() => showToast(t('acceptLoad', language))} className="primary-button justify-center text-sm">{t('acceptLoad', language)} <ArrowRight size={16} /></button></div></div>)}</div>}
    </div>}
  </div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function TrackPaymentScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData> }) {
  const booking = bookingData.latestBooking;
  const crop = booking ? cropName(booking.crop, language) : 'Wheat';
  const quantity = booking ? parseInt(booking.quantity, 10) || 24 : 24;
  const mspPerQuintal = booking ? (cropRates.find((c) => c.en === booking.crop)?.rate?.replace(/[^0-9]/g, '') || '2275') : '2275';
  const mspNum = parseInt(mspPerQuintal, 10);
  const total = quantity * mspNum;

  const paymentSteps = [
    { label: t('paymentStep1', language) },
    { label: t('paymentStep2', language) },
    { label: t('paymentStep3', language) },
    { label: t('paymentStep4', language) },
  ];
  const currentStep = 2;

  return <DashboardLayout language={language} setLanguage={setLanguage} active="trackPayment" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('trackPayment', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    {!booking ? <div className="panel text-center"><div className="screen-icon mx-auto"><Wallet size={25} /></div><h2 className="mt-5 font-display text-2xl font-semibold text-forest-950">{t('noBookingForPayment', language)}</h2><button onClick={() => setScreen('book')} className="primary-button mt-6 justify-center"><CalendarDays size={18} /> {t('bookSlotNow', language)}</button></div> : <>
      <div className="panel"><h2 className="section-title">{t('paymentCalculation', language)}</h2><div className="mt-5 space-y-4"><div className="flex items-center justify-between rounded-xl bg-[#f3f7f1] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#e5f2df] text-green-700"><Leaf size={16} /></div><span className="text-sm font-medium text-slate-600">{t('crop', language)}</span></div><span className="font-semibold text-slate-800">{crop}</span></div><div className="flex items-center justify-between rounded-xl bg-[#f3f7f1] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#e5f2df] text-green-700"><PackageCheck size={16} /></div><span className="text-sm font-medium text-slate-600">{t('cropWeight', language)}</span></div><span className="font-semibold text-slate-800">{quantity} Quintal</span></div><div className="flex items-center justify-between rounded-xl bg-[#f3f7f1] p-4"><div className="flex items-center gap-3"><div className="crop-icon small bg-[#e5f2df] text-green-700"><IndianRupee size={16} /></div><span className="text-sm font-medium text-slate-600">{t('mspRate', language)}</span></div><span className="font-semibold text-slate-800">₹{mspNum.toLocaleString('en-IN')} / Quintal</span></div><div className="flex items-center justify-between rounded-xl bg-green-50 p-4 border border-green-200"><div className="flex items-center gap-3"><div className="crop-icon small bg-green-600 text-white"><Wallet size={16} /></div><span className="text-sm font-semibold text-green-800">{t('totalAmount', language)}</span></div><span className="font-display text-2xl font-semibold text-green-800">₹{total.toLocaleString('en-IN')}</span></div></div></div>

      <div className="mt-6 panel"><div className="mb-4 flex items-center gap-2"><Navigation size={16} className="text-green-600" /><h2 className="section-title">{t('paymentStatus', language)}</h2></div><div className="tracker"><div className="tracker-tractor" style={{ left: `calc(${(currentStep / (paymentSteps.length - 1)) * 100}% - 14px)` }}><Wallet size={26} className="text-green-700" /></div>{paymentSteps.map((step, i) => <div key={i} className={`tracker-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}><div className="tracker-dot">{i < currentStep ? <Check size={14} /> : i + 1}</div><span className="tracker-label">{step.label}</span></div>)}</div></div>

      <div className="mt-5 flex gap-3"><button onClick={() => setScreen('farmer')} className="secondary-button flex-1 justify-center">{t('backToDashboard', language)}</button><button onClick={() => setScreen('myBookings')} className="primary-button flex-1 justify-center">{t('myBookings', language)} <FileCheck2 size={18} /></button></div>
    </>}
  </div></DashboardLayout>;
}

function OfficerDashboard({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { userProfile } = useUserProfile();
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<typeof queue[number] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const filtered = useMemo(() => queue.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateStr = currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hour = currentTime.getHours();
  const greetingKey = greetingFor(hour);
  return <DashboardLayout language={language} setLanguage={setLanguage} active="officer" setScreen={setScreen} role={role} onSignOut={onSignOut}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">{dateStr} · {timeStr} · {t('liveOperations', language)}</p><h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest-950 sm:text-4xl">{t(greetingKey, language)}, {displayName(userProfile)}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} className="text-green-600" /> {userProfile.state || t('jaipurCentral', language)}</p></div><button onClick={() => setScreen('scanner')} className="primary-button self-start"><ScanLine size={18} /> {t('scanDigitalPass', language)}</button></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><StatCard label={t('expectedToday', language)} value="48" detail={t('farmersScheduled', language)} icon={Users} /><StatCard label={t('checkedIn', language)} value="17" detail={t('ofArrivals', language)} icon={Check} green /><StatCard label={t('stockReceived', language)} value="126 T" detail={t('acrossAllCrops', language)} icon={PackageCheck} /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_.8fr]"><div className="panel"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="section-title">{t('incomingFarmersQueue', language)}</h2><p className="mt-1 text-sm text-slate-500">{t('todaysArrivals', language)}</p></div><div className="search-field"><Search size={16} /><input placeholder={t('searchFarmer', language)} value={search} onChange={(event) => setSearch(event.target.value)} /></div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[580px] text-left"><thead><tr><th>{t('farmer', language)}</th><th>{t('cropQuantity', language)}</th><th>{t('arrivalTimeCol', language)}</th><th>{t('status', language)}</th><th /></tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-400">{t('noResultsFound', language)}</td></tr> : filtered.map((item) => <tr key={item.name} className="farmer-row" onClick={() => setSelectedFarmer(item)}><td><div className="flex items-center gap-3"><div className="avatar">{item.name.split(' ').map((word) => word[0]).join('')}</div><span className="font-medium text-slate-800">{item.name}</span></div></td><td><span className="text-sm font-medium text-slate-700">{item.crop[language]}</span><span className="ml-2 text-xs text-slate-400">{item.quantity[language]}</span></td><td className="text-sm text-slate-600">{item.time}</td><td><span className={`table-status ${item.status === 'checkedIn' ? 'checked' : ''}`}><span />{item.status === 'checkedIn' ? t('checkedInStatus', language) : t('arrivingStatus', language)}</span></td><td><button className="p-2 text-slate-400 hover:text-slate-700" onClick={(e) => { e.stopPropagation(); setSelectedFarmer(item); }}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></div><div className="panel"><div className="flex items-start justify-between"><div><h2 className="section-title">{t('todaysOverview', language)}</h2><p className="mt-1 text-sm text-slate-500">{t('stockByCrop', language)}</p></div><BarChart3 className="text-green-600" size={20} /></div><div className="mt-7 space-y-5">{[['Wheat', '62 T', '76%', 'bg-green-600'], ['Mustard', '38 T', '48%', 'bg-amber-500'], ['Rice', '26 T', '34%', 'bg-lime-500']].map(([label, value, percent, color]) => <div key={label as string}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="text-slate-500">{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${color}`} style={{ width: percent as string }} /></div></div>)}</div><button className="mt-7 flex items-center text-sm font-semibold text-green-700">{t('viewFullAnalytics', language)} <ArrowRight size={15} className="ml-1" /></button></div></div>
  {selectedFarmer && <div className="modal-overlay" onClick={() => setSelectedFarmer(null)}><div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="avatar" style={{ width: '44px', height: '44px', fontSize: '14px' }}>{selectedFarmer.name.split(' ').map((word) => word[0]).join('')}</div><div><h3 className="font-display text-xl font-semibold text-forest-950">{selectedFarmer.name}</h3><p className="text-xs text-slate-500">{t('farmerDetails', language)}</p></div></div><button className="icon-button" onClick={() => setSelectedFarmer(null)}><X size={18} /></button></div><div className="farmer-detail-section"><div className="farmer-detail-grid"><div className="farmer-detail-item"><span className="label">{t('crop', language)}</span><span className="value">{selectedFarmer.crop[language]}</span></div><div className="farmer-detail-item"><span className="label">{t('expectedWeight', language)}</span><span className="value">{selectedFarmer.quantityValue} Quintal</span></div><div className="farmer-detail-item"><span className="label">{t('assignedSlot', language)}</span><span className="value">{selectedFarmer.date}</span></div><div className="farmer-detail-item"><span className="label">{t('arrivalTime', language)}</span><span className="value">{selectedFarmer.time}</span></div></div></div><div className="farmer-detail-section"><h4 className="mb-3 text-sm font-semibold text-slate-700">{t('farmerDetails', language)}</h4><div className="farmer-detail-grid"><div className="farmer-detail-item"><span className="label">{t('state', language)}</span><span className="value">{selectedFarmer.state}</span></div><div className="farmer-detail-item"><span className="label">{t('district', language)}</span><span className="value">{selectedFarmer.district}</span></div><div className="farmer-detail-item"><span className="label">{t('tehsil', language)}</span><span className="value">{selectedFarmer.tehsil}</span></div><div className="farmer-detail-item"><span className="label">{t('village', language)}</span><span className="value">{selectedFarmer.village}</span></div><div className="farmer-detail-item"><span className="label">{t('pinCodeLabel', language)}</span><span className="value">{selectedFarmer.pinCode}</span></div><div className="farmer-detail-item"><span className="label">{t('status', language)}</span><span className="value">{selectedFarmer.status === 'checkedIn' ? t('checkedInStatus', language) : t('arrivingStatus', language)}</span></div></div></div><div className="mt-6 flex gap-3"><button onClick={() => setSelectedFarmer(null)} className="primary-button flex-1 justify-center">{t('closeModal', language)}</button></div></div></div>}
  </DashboardLayout>;
}

function ScannerScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const [scanning, setScanning] = useState(false);
  return <DashboardLayout language={language} setLanguage={setLanguage} active="scanner" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('scanPassTitle', language)} onBack={() => setScreen('officer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="panel text-center"><div className="scanner-viewport"><ScanLine size={120} strokeWidth={1} className="text-green-600/40" />{scanning && <div className="scan-line" />}<div className="scanner-corners"><span /><span /><span /><span /></div></div><h2 className="mt-6 font-display text-2xl font-semibold text-forest-950">{scanning ? t('scanning', language) : t('scanPassTitle', language)}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{t('scanSubtitle', language)}</p><button onClick={() => setScanning(!scanning)} className="primary-button mt-6 justify-center">{scanning ? t('scanning', language) : t('startScanning', language)} <ScanLine size={18} /></button></div><div className="mt-6"><h3 className="section-title">{t('recentScans', language)}</h3><div className="mt-4 space-y-3">{recentScans.map((scan) => <div key={scan.name} className="vehicle-card"><div className="vehicle-icon"><QrCode size={21} /></div><div className="min-w-0 flex-1"><p className="font-semibold text-slate-800">{scan.name}</p><p className="mt-1 text-sm text-slate-500">{scan.crop[language]} · {scan.time}</p></div><div className="flex items-center gap-2 text-sm font-semibold text-green-600"><Check size={16} /> {t('verifiedPass', language)}</div></div>)}</div></div></div></DashboardLayout>;
}

function FarmerProfileScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { profile, editing, draft, startEdit, cancelEdit, saveEdit, updateDraft } = useProfileData(role);
  const p = profile as FarmerProfile;
  const d = draft as FarmerProfile | null;
  const data = editing && d ? d : p;
  return <DashboardLayout language={language} setLanguage={setLanguage} active="farmerProfile" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('profileTitle', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="profile-header"><div className="profile-avatar"><UserRound size={48} /></div><div><h2 className="font-display text-2xl font-semibold text-forest-950">{data.name}</h2><p className="mt-1 text-sm text-slate-500">{t('farmerProfile', language)}</p></div></div><div className="mt-6 panel"><div className="grid gap-5 sm:grid-cols-2">{editing ? <><ProfileEditField icon={UserRound} label={t('fullName', language)} value={d!.name} onChange={(v) => updateDraft('name', v)} /><ProfileEditField icon={Phone} label={t('contactNumber', language)} value={d!.phone} onChange={(v) => updateDraft('phone', v)} /><ProfileEditField icon={MapPin} label={t('villageCity', language)} value={d!.village} onChange={(v) => updateDraft('village', v)} /><ProfileEditField icon={MapPin} label={t('state', language)} value={d!.state} onChange={(v) => updateDraft('state', v)} /><ProfileEditField icon={Sprout} label={t('cropsSold', language)} value={d!.cropsSold} onChange={(v) => updateDraft('cropsSold', v)} /><ProfileEditField icon={CalendarDays} label={t('lastVisit', language)} value={d!.lastVisit} onChange={(v) => updateDraft('lastVisit', v)} /></> : <><ProfileInfoRow icon={UserRound} label={t('fullName', language)} value={p.name} /><ProfileInfoRow icon={Phone} label={t('contactNumber', language)} value={p.phone} /><ProfileInfoRow icon={MapPin} label={t('villageCity', language)} value={p.village} /><ProfileInfoRow icon={MapPin} label={t('state', language)} value={p.state} /><ProfileInfoRow icon={CalendarDays} label={t('totalVisits', language)} value={p.totalVisits} /><ProfileInfoRow icon={Sprout} label={t('cropsSold', language)} value={p.cropsSold} /><ProfileInfoRow icon={Clock3} label={t('lastVisit', language)} value={p.lastVisit} /></>}</div></div><div className="mt-5 flex gap-3">{editing ? <><button onClick={cancelEdit} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={saveEdit} className="primary-button flex-1 justify-center"><Check size={18} /> {t('saveChanges', language)}</button></> : <><button onClick={startEdit} className="secondary-button flex-1 justify-center"><UserRound size={18} /> {t('editProfile', language)}</button><button onClick={() => setScreen('farmer')} className="primary-button flex-1 justify-center">{t('backToDashboard', language)} <ArrowRight size={18} /></button></>}</div></div></DashboardLayout>;
}

function OfficerProfileScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const { profile, editing, draft, startEdit, cancelEdit, saveEdit, updateDraft } = useProfileData(role);
  const p = profile as OfficerProfile;
  const d = draft as OfficerProfile | null;
  const data = editing && d ? d : p;
  return <DashboardLayout language={language} setLanguage={setLanguage} active="officerProfile" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('profileTitle', language)} onBack={() => setScreen('officer')} /><div className="mx-auto mt-7 max-w-2xl"><div className="profile-header"><div className="profile-avatar"><UserRound size={48} /></div><div><h2 className="font-display text-2xl font-semibold text-forest-950">{data.name}</h2><p className="mt-1 text-sm text-slate-500">{t('officerProfile', language)}</p></div></div><div className="mt-6 panel"><div className="grid gap-5 sm:grid-cols-2">{editing ? <><ProfileEditField icon={UserRound} label={t('fullName', language)} value={d!.name} onChange={(v) => updateDraft('name', v)} /><ProfileEditField icon={Phone} label={t('contactNumber', language)} value={d!.phone} onChange={(v) => updateDraft('phone', v)} /><ProfileEditField icon={MapPin} label={t('mandiAssigned', language)} value={d!.mandiAssigned} onChange={(v) => updateDraft('mandiAssigned', v)} /><ProfileEditField icon={ShieldCheck} label={t('employeeId', language)} value={d!.employeeId} onChange={(v) => updateDraft('employeeId', v)} /><ProfileEditField icon={Users} label={t('farmersVerified', language)} value={d!.farmersVerified} onChange={(v) => updateDraft('farmersVerified', v)} /><ProfileEditField icon={Clock3} label={t('todayShift', language)} value={d!.todayShift} onChange={(v) => updateDraft('todayShift', v)} /></> : <><ProfileInfoRow icon={UserRound} label={t('fullName', language)} value={p.name} /><ProfileInfoRow icon={Phone} label={t('contactNumber', language)} value={p.phone} /><ProfileInfoRow icon={MapPin} label={t('mandiAssigned', language)} value={p.mandiAssigned} /><ProfileInfoRow icon={ShieldCheck} label={t('employeeId', language)} value={p.employeeId} /><ProfileInfoRow icon={Users} label={t('farmersVerified', language)} value={p.farmersVerified} /><ProfileInfoRow icon={CalendarDays} label={t('totalVisits', language)} value={p.totalVisits} /><ProfileInfoRow icon={Clock3} label={t('todayShift', language)} value={p.todayShift} /></>}</div></div><div className="mt-5 flex gap-3">{editing ? <><button onClick={cancelEdit} className="secondary-button flex-1 justify-center">{t('cancel', language)}</button><button onClick={saveEdit} className="primary-button flex-1 justify-center"><Check size={18} /> {t('saveChanges', language)}</button></> : <><button onClick={startEdit} className="secondary-button flex-1 justify-center"><UserRound size={18} /> {t('editProfile', language)}</button><button onClick={() => setScreen('officer')} className="primary-button flex-1 justify-center">{t('backToDashboard', language)} <ArrowRight size={18} /></button></>}</div></div></DashboardLayout>;
}

function ProgressTracker({ currentStep, language }: { currentStep: number; language: Language }) {
  const steps = [
    { label: t('progressSlotBooked', language) },
    { label: t('progressTractorAssigned', language) },
    { label: t('progressReachedMandi', language) },
    { label: t('progressVerified', language) },
  ];
  const tractorLeft = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  return <div className="tracker">
    <div className="tracker-tractor" style={{ left: `calc(${tractorLeft}% - 14px)` }}><Tractor size={28} className="text-green-700" /></div>
    {steps.map((step, i) => <div key={i} className={`tracker-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}><div className="tracker-dot">{i < currentStep ? <Check size={14} /> : i + 1}</div><span className="tracker-label">{step.label}</span></div>)}
  </div>;
}

function MyBookingsScreen({ setScreen, language, setLanguage, role, onSignOut, bookingData }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void; bookingData: ReturnType<typeof useBookingData> }) {
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [toast, setToast] = useState(false);

  const handleCancel = () => {
    if (cancelTarget) {
      bookingData.cancelBooking(cancelTarget.id);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }
    setCancelTarget(null);
  };

  const active = bookingData.activeBookings;
  const cancelled = bookingData.cancelledBookings;

  return <DashboardLayout language={language} setLanguage={setLanguage} active="myBookings" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('myBookings', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl">
    <h2 className="section-title">{t('activeBookings', language)}</h2>
    {active.length === 0 ? <div className="mt-4 panel text-center"><p className="text-sm text-slate-500">{t('noActiveBookings', language)}</p><button onClick={() => setScreen('book')} className="primary-button mt-5 justify-center"><CalendarDays size={18} /> {t('bookSlotNow', language)}</button></div> : <div className="mt-4 space-y-3">{active.map((b) => <div key={b.id} className="booking-card"><div className="booking-card-header"><div><p className="font-semibold text-slate-800">{cropName(b.crop, language)}</p><p className="mt-1 text-xs text-slate-400">{b.centreName}</p></div><span className="booking-status-badge confirmed"><Check size={13} /> {t('confirmed', language)}</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Info label={t('bookingId', language)} value={b.id} /><Info label={t('date', language)} value={b.date} /><Info label={t('arrivalTime', language)} value={b.time} /><Info label={t('quantity', language)} value={`${b.quantity} ${b.unit}`} /></div><div className="mt-4 rounded-xl bg-[#f7faf6] p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><Navigation size={14} className="text-green-600" /> {t('liveTracking', language)}</div><ProgressTracker currentStep={1} language={language} /></div><div className="mt-4 flex gap-2"><button onClick={() => setScreen('pass')} className="secondary-button flex-1 justify-center text-sm"><QrCode size={16} /> {t('viewPass', language)}</button><button onClick={() => setCancelTarget(b)} className="secondary-button flex-1 justify-center text-sm" style={{ color: '#c0593e' }}><X size={16} /> {t('cancelBooking', language)}</button></div></div>)}</div>}

    <h2 className="section-title mt-10">{t('cancelledBookings', language)}</h2>
    {cancelled.length === 0 ? <p className="mt-3 text-sm text-slate-400">{t('noCancelledBookings', language)}</p> : <div className="mt-4 space-y-3">{cancelled.map((b) => <div key={b.id} className="booking-card opacity-60"><div className="booking-card-header"><div><p className="font-semibold text-slate-800">{cropName(b.crop, language)}</p><p className="mt-1 text-xs text-slate-400">{b.centreName}</p></div><span className="booking-status-badge cancelled">{t('cancelled', language)}</span></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Info label={t('bookingId', language)} value={b.id} /><Info label={t('date', language)} value={b.date} /><Info label={t('arrivalTime', language)} value={b.time} /><Info label={t('quantity', language)} value={`${b.quantity} ${b.unit}`} /></div></div>)}</div>}
  </div>

  {cancelTarget && <div className="modal-overlay" onClick={() => setCancelTarget(null)}><div className="modal-box" onClick={(e) => e.stopPropagation()}><div className="modal-icon"><X size={24} /></div><h3 className="text-center font-display text-xl font-semibold text-forest-950">{t('cancelConfirmTitle', language)}</h3><p className="mt-3 text-center text-sm leading-6 text-slate-500">{t('cancelConfirmDesc', language)}</p><div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm"><p className="font-medium text-slate-700">{cropName(cancelTarget.crop, language)} · {cancelTarget.centreName}</p><p className="mt-1 text-xs text-slate-400">{cancelTarget.date} · {cancelTarget.time}</p></div><div className="mt-6 flex gap-3"><button onClick={() => setCancelTarget(null)} className="secondary-button flex-1 justify-center">{t('keepBooking', language)}</button><button onClick={handleCancel} className="primary-button flex-1 justify-center" style={{ background: '#c0593e' }}>{t('yesCancel', language)}</button></div></div></div>}
  {toast && <div className="toast"><Check size={16} /> {t('bookingCancelled', language)}</div>}
  </DashboardLayout>;
}

function TruckPoolScreen({ setScreen, language, setLanguage, role, onSignOut }: { setScreen: (screen: Screen) => void; language: Language; setLanguage: (value: Language) => void; role: Role; onSignOut: () => void }) {
  const poolData = useTruckPoolData();
  const { userProfile } = useUserProfile();
  const [tab, setTab] = useState<'find' | 'create'>('find');
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => { setToastMsg(msg); setToast(true); setTimeout(() => setToast(false), 2500); };

  const pickupDefault = displayLocation(userProfile) !== t('locationNotSet', language) ? displayLocation(userProfile) : 'Chomu, Jaipur';
  const [createForm, setCreateForm] = useState({ crop: 'Wheat', quantity: '15', pickup: pickupDefault, destination: 'Jaipur Central Mandi', date: availableDates[0], time: availableTimes[0], capacity: '40' });

  const handleCreate = () => {
    poolData.createPool(createForm.crop, `${createForm.quantity} Quintal`, createForm.pickup, createForm.destination, createForm.date, createForm.time, `${createForm.capacity} Quintal`);
    showToast(t('poolJoined', language));
    setTab('find');
  };

  const handleJoin = (poolId: string, qty: string) => {
    poolData.joinPool(poolId, qty);
    showToast(t('poolJoined', language));
  };

  const handleLeave = (poolId: string) => {
    poolData.leavePool(poolId);
    showToast(t('poolLeft', language));
  };

  const statusBadge = (status: PoolStatus) => {
    const labels: Record<PoolStatus, string> = { open: t('poolOpen', language), 'almost-full': t('poolAlmostFull', language), full: t('poolFullLabel', language), completed: t('poolCompleted', language), cancelled: t('poolCancelled', language) };
    return <span className={`pool-status-badge ${status}`}>{labels[status]}</span>;
  };

  return <DashboardLayout language={language} setLanguage={setLanguage} active="truckPool" setScreen={setScreen} role={role} onSignOut={onSignOut}><PageBack title={t('truckPooling', language)} onBack={() => setScreen('farmer')} /><div className="mx-auto mt-7 max-w-2xl"><p className="text-sm leading-6 text-slate-500">{t('truckPoolDesc', language)}</p>
    <div className="pool-tab mt-6"><button className={tab === 'find' ? 'active' : ''} onClick={() => setTab('find')}><Search size={16} /> {t('findPool', language)}</button><button className={tab === 'create' ? 'active' : ''} onClick={() => setTab('create')}><Plus size={16} /> {t('createPool', language)}</button></div>

    {tab === 'find' && <div>{poolData.pools.length === 0 ? <p className="text-sm text-slate-500">{t('noPoolsAvailable', language)}</p> : <div className="space-y-3">{poolData.pools.map((pool) => { const member = poolData.isMember(pool.id); const canJoin = (pool.status === 'open' || pool.status === 'almost-full') && !member; const canLeave = member && pool.status !== 'completed' && pool.status !== 'cancelled'; return <div key={pool.id} className="pool-card"><div className="flex items-start justify-between"><div><p className="font-semibold text-slate-800">{pool.crop}</p><p className="mt-1 text-xs text-slate-400">{t('poolId', language)}: {pool.id}</p></div>{statusBadge(pool.status)}</div><div className="mt-4 grid grid-cols-2 gap-3"><Info label={t('procurementCentre', language)} value={pool.destination} /><Info label={t('pickupLocation', language)} value={pool.pickupLocation} /><Info label={t('preferredDate', language)} value={pool.date} /><Info label={t('preferredTime', language)} value={pool.time} /><Info label={t('availableCapacity', language)} value={pool.availableCapacity} /><Info label={t('members', language)} value={`${pool.members.length}`} /></div>{member && <div className="mt-3"><p className="mb-2 text-xs font-medium text-slate-400">{t('members', language)}:</p><div className="space-y-1">{pool.members.map((m, i) => <div key={i} className="pool-member"><span className="font-medium text-slate-700">{m.name}</span><span className="text-xs text-slate-400">{m.quantity}</span></div>)}</div></div>}<div className="mt-4">{canJoin ? <button onClick={() => handleJoin(pool.id, '10 Quintal')} className="primary-button w-full justify-center"><Users size={18} /> {t('joinPool', language)}</button> : canLeave ? <button onClick={() => handleLeave(pool.id)} className="secondary-button w-full justify-center" style={{ color: '#c0593e' }}><X size={18} /> {t('leavePool', language)}</button> : pool.status === 'full' ? <p className="text-center text-sm font-semibold text-slate-400">{t('poolFull', language)}</p> : null}</div></div>; })}</div>}</div>}

    {tab === 'create' && <div className="form-card"><div className="space-y-4"><div><label className="field-label">{t('cropType', language)}</label><select className="text-input" value={createForm.crop} onChange={(e) => setCreateForm({ ...createForm, crop: e.target.value })}>{allCrops.map((c) => <option key={c.en} value={c.en}>{c[language]}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label">{t('yourQuantity', language)}</label><input className="text-input" value={createForm.quantity} onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value.replace(/\\D/g, '').slice(0, 4) })} placeholder="15" inputMode="numeric" /></div><div><label className="field-label">{t('truckCapacity', language)}</label><input className="text-input" value={createForm.capacity} onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value.replace(/\\D/g, '').slice(0, 4) })} placeholder="40" inputMode="numeric" /></div></div><div><label className="field-label">{t('pickupLocation', language)}</label><input className="text-input" value={createForm.pickup} onChange={(e) => setCreateForm({ ...createForm, pickup: e.target.value })} /></div><div><label className="field-label">{t('destinationCentre', language)}</label><select className="text-input" value={createForm.destination} onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}>{procurementCentres.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label">{t('preferredDate', language)}</label><select className="text-input" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}>{availableDates.map((d) => <option key={d} value={d}>{d}</option>)}</select></div><div><label className="field-label">{t('preferredTime', language)}</label><select className="text-input" value={createForm.time} onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}>{availableTimes.map((tm) => <option key={tm} value={tm}>{tm}</option>)}</select></div></div></div><button onClick={handleCreate} className="primary-button mt-6 w-full justify-center"><Plus size={18} /> {t('createPoolBtn', language)}</button></div>}
  </div>{toast && <div className="toast"><Check size={16} /> {toastMsg}</div>}</DashboardLayout>;
}

function ProfileInfoRow({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="action-icon"><Icon size={18} /></div><div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div></div>;
}

function ProfileEditField({ icon: Icon, label, value, onChange }: { icon: IconType; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="flex items-center gap-3"><div className="action-icon"><Icon size={18} /></div><div className="flex-1"><p className="text-xs text-slate-400">{label}</p><input className="text-input mt-1" value={value} onChange={(event) => onChange(event.target.value)} /></div></div>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const bookingData = useBookingData();
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [bookInitialTime, setBookInitialTime] = useState<string | undefined>(undefined);
  const [bookResetKey, setBookResetKey] = useState(0);

  const updateUserProfile = (updater: (prev: UserProfile) => UserProfile) => setUserProfile(updater);
  const profileContext = useMemo(() => ({ userProfile, setUserProfile: updateUserProfile }), [userProfile]);

  const signOut = () => { setScreen('welcome'); setPhone(''); setRole('farmer'); };
  const dashboardProps = { language, setLanguage, role, onSignOut: signOut };

  return <UserProfileContext.Provider value={profileContext}>
    {screen === 'welcome' && <Welcome language={language} setLanguage={setLanguage} onStart={() => setScreen('phone')} />}
    {screen === 'phone' && <PhoneScreen language={language} setLanguage={setLanguage} onNext={(value) => { setPhone(value); setScreen('otp'); }} onBack={() => setScreen('welcome')} />}
    {screen === 'otp' && <OtpScreen language={language} setLanguage={setLanguage} phone={phone} onNext={() => setScreen('role')} onBack={() => setScreen('phone')} />}
    {screen === 'role' && <RoleScreen language={language} setLanguage={setLanguage} onSelect={(value) => { setRole(value); setScreen('profileSetup'); }} onBack={() => setScreen('otp')} />}
    {screen === 'profileSetup' && <ProfileSetupScreen language={language} setLanguage={setLanguage} role={role} onComplete={() => setScreen(role === 'farmer' ? 'farmer' : 'officer')} onBack={() => setScreen('role')} />}

    {screen === 'farmer' && <FarmerDashboard {...dashboardProps} setScreen={(s) => { if (s === 'book') { setBookInitialTime(undefined); setBookResetKey((k) => k + 1); } setScreen(s); }} onBookRecommended={() => { setBookInitialTime('09:00 AM'); setBookResetKey((k) => k + 1); setScreen('book'); }} />}
    {screen === 'book' && <BookScreen key={bookResetKey} {...dashboardProps} setScreen={setScreen} bookingData={bookingData} initialTime={bookInitialTime} resetKey={bookResetKey} />}
    {screen === 'pass' && <PassScreen {...dashboardProps} setScreen={setScreen} bookingData={bookingData} />}
    {screen === 'myBookings' && <MyBookingsScreen {...dashboardProps} setScreen={setScreen} bookingData={bookingData} />}
    {screen === 'truckPool' && <TruckPoolScreen {...dashboardProps} setScreen={setScreen} />}
    {screen === 'rates' && <RatesScreen {...dashboardProps} setScreen={setScreen} />}
    {screen === 'transport' && <TransportScreen {...dashboardProps} setScreen={setScreen} />}
    {screen === 'tractorPool' && <TractorPoolScreen {...dashboardProps} setScreen={setScreen} />}
    {screen === 'trackPayment' && <TrackPaymentScreen {...dashboardProps} setScreen={setScreen} bookingData={bookingData} />}

    {screen === 'officer' && <OfficerDashboard {...dashboardProps} setScreen={setScreen} />}
    {screen === 'scanner' && <ScannerScreen {...dashboardProps} setScreen={setScreen} />}
    {screen === 'farmerProfile' && <FarmerProfileScreen {...dashboardProps} setScreen={setScreen} />}
    {screen === 'officerProfile' && <OfficerProfileScreen {...dashboardProps} setScreen={setScreen} />}
    {!['welcome', 'phone', 'otp', 'role', 'profileSetup', 'farmer', 'book', 'pass', 'myBookings', 'truckPool', 'rates', 'transport', 'tractorPool', 'trackPayment', 'officer', 'scanner', 'farmerProfile', 'officerProfile'].includes(screen) && <Welcome language={language} setLanguage={setLanguage} onStart={() => setScreen('phone')} />}
  </UserProfileContext.Provider>;
}

export default App;
