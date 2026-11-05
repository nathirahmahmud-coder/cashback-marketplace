'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import DemoSettings, { BRAND_SETTINGS_STORAGE_KEY, DEFAULT_BRAND_SETTINGS, DEMO_CUSTOMERS, getPresetBrandSettings, isPresetThemeId, LEGACY_BRAND_SETTINGS_STORAGE_KEY, readBrandSettings, THEME_PRESETS, type BrandSettings } from '@/components/demo-settings'
import { MERCHANTS as merchants, type Merchant, type MerchantEventRate } from '@/components/merchant-data'
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowLeftRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Home,
  Menu,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Signal,
  Sparkles,
  UserRound,
  Wifi,
  X,
} from 'lucide-react'

type Screen = 'home' | 'deals' | 'merchant' | 'ledger' | 'transaction' | 'terms'
type CashbackStatus = 'Pending' | 'Approved' | 'Rejected'

const DEFAULT_CUSTOMER_ALLOCATION = 70
const PLATFORM_COMMISSION_SHARE = 70
const WALLET_BALANCE = 856.4

type Transaction = {
  id: string
  merchant: string
  date: string
  description: string
  amount: number
  status: CashbackStatus
  orderId?: string
  purchaseDateTime?: string
  purchaseAmount?: number
  estimatedAmount?: number
  statusUpdatedAt: string
}

const transactions: Transaction[] = [
  { id: 'trip-approved', merchant: 'Trip.com', date: '12 Oct 2026', description: 'Hotels', amount: 12, status: 'Approved', orderId: 'TC2026101201', purchaseDateTime: '12 Oct 2026, 9:20 AM', purchaseAmount: 200, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
  { id: 'klook-approved', merchant: 'Klook', date: '2 Oct 2026', description: 'Activities', amount: 8, status: 'Approved', orderId: 'KL2026100204', purchaseDateTime: '2 Oct 2026, 2:14 PM', purchaseAmount: 200, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
  { id: 'agoda-pending', merchant: 'Agoda', date: '28 Sep 2026', description: 'Hotels', amount: 8.75, estimatedAmount: 8.75, status: 'Pending', orderId: 'AG2026092808', purchaseDateTime: '28 Sep 2026, 10:45 AM', purchaseAmount: 500, statusUpdatedAt: '25 Oct 2026, 10:30 AM' },
  { id: 'zalora-rejected', merchant: 'ZALORA', date: '28 Sep 2026', description: 'Fashion', amount: 0, status: 'Rejected', orderId: 'ZL20260928', purchaseDateTime: '28 Sep 2026, 10:45 AM', purchaseAmount: 250, statusUpdatedAt: '27 Oct 2026, 4:45 PM' },
  { id: 'shopee-approved', merchant: 'Shopee', date: '8 Sep 2026', description: 'Online Shopping', amount: 4, status: 'Approved', orderId: 'SH2026090802', purchaseDateTime: '8 Sep 2026, 11:05 AM', purchaseAmount: 100, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
  { id: 'lazada-approved', merchant: 'Lazada', date: '22 Aug 2026', description: 'Online Shopping', amount: 10, status: 'Approved', orderId: 'LZ2026082210', purchaseDateTime: '22 Aug 2026, 4:30 PM', purchaseAmount: 250, statusUpdatedAt: '26 Oct 2026, 2:15 PM' },
]

const statusMeta: Record<CashbackStatus, { className: string }> = {
  Approved: { className: 'status-approved' },
  Pending: { className: 'status-pending' },
  Rejected: { className: 'status-rejected' },
}
const merchantFor = (name: string) => merchants.find((merchant) => merchant.name === name) ?? merchants[0]
const effectiveEventRate = (eventRate: MerchantEventRate) => eventRate.advertiserCommissionRate * (PLATFORM_COMMISSION_SHARE / 100) * ((eventRate.customerAllocation ?? DEFAULT_CUSTOMER_ALLOCATION) / 100)
const merchantCashbackRate = (merchant: Merchant) => Math.max(...merchant.eventRates.map(effectiveEventRate))
const estimatedCashbackFor = (transaction: Transaction) => {
  if (transaction.purchaseAmount === undefined) return transaction.estimatedAmount ?? transaction.amount
  const merchant = merchantFor(transaction.merchant)
  const eventRate = merchant.eventRates.find((item) => item.category === transaction.description)
  const rate = eventRate ? effectiveEventRate(eventRate) : merchantCashbackRate(merchant)
  return Number(((transaction.purchaseAmount * rate) / 100).toFixed(2))
}
const formatRate = (rate: number) => Number(rate.toFixed(2)).toString()
const formatRM = (amount: number) => `RM ${amount.toFixed(2)}`

function BrandLogo({ merchant, compact = false }: { merchant: Merchant; compact?: boolean }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const showWordmark = !merchant.logoPath || logoFailed || !merchant.logoIncludesWordmark

  return (
    <div className={`brand-logo brand-logo-${merchant.id} ${compact ? 'brand-logo-compact' : ''}`}>
      {merchant.logoPath && !logoFailed && <img src={merchant.logoPath} alt="" aria-hidden="true" onError={() => setLogoFailed(true)} />}
      {showWordmark && <span className="brand-wordmark">{merchant.name}</span>}
    </div>
  )
}

function PhoneStatusBar({ dark }: { dark: boolean }) {
  return (
    <div className={`phone-status ${dark ? 'phone-status-dark' : ''}`} aria-label="9:41, mobile signal, Wi-Fi, battery">
      <span>9:41</span>
      <div className="phone-status-icons" aria-hidden="true">
        <Signal size={16} strokeWidth={2.7} />
        <Wifi size={18} strokeWidth={2.7} />
        <span className="battery-icon"><span /></span>
      </div>
    </div>
  )
}

function ScreenHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <header className="screen-header">
      <button className="icon-button" aria-label="Go back" onClick={onBack}><ChevronLeft size={23} /></button>
      <h1>{title}</h1>
      <div className="header-right">{right ?? <span className="header-spacer" />}</div>
    </header>
  )
}

function CashbackPrototype() {
  const [screen, setScreen] = useState<Screen>('home')
  const [history, setHistory] = useState<Screen[]>([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Name (A–Z)')
  const [transactionFilter, setTransactionFilter] = useState('All')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedMerchantName, setSelectedMerchantName] = useState('Trip.com')
  const [selectedTransactionId, setSelectedTransactionId] = useState(transactions[0].id)
  const [branding, setBranding] = useState<BrandSettings>(DEFAULT_BRAND_SETTINGS)
  const [brandingReady, setBrandingReady] = useState(false)
  const [storageAvailable, setStorageAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const themeParam = new URLSearchParams(window.location.search).get('theme')
    let savedBranding: BrandSettings | null = null

    try {
      savedBranding = readBrandSettings(window.localStorage.getItem(BRAND_SETTINGS_STORAGE_KEY))
      window.localStorage.removeItem(LEGACY_BRAND_SETTINGS_STORAGE_KEY)
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }

    if (isPresetThemeId(themeParam)) setBranding(getPresetBrandSettings(themeParam, savedBranding ?? DEFAULT_BRAND_SETTINGS))
    else if (savedBranding) setBranding(savedBranding)
    setBrandingReady(true)
  }, [])

  useEffect(() => {
    if (!brandingReady) return
    try {
      window.localStorage.setItem(BRAND_SETTINGS_STORAGE_KEY, JSON.stringify(branding))
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }
  }, [branding, brandingReady])

  const navigate = (next: Screen) => {
    setHistory((previous) => [...previous, screen])
    setScreen(next)
  }
  const goBack = () => {
    setHistory((previous) => {
      if (!previous.length) {
        setScreen('home')
        return previous
      }
      setScreen(previous[previous.length - 1])
      return previous.slice(0, -1)
    })
  }
  const toast = (message = "This action isn't available right now.") => {
    setToastMessage(message)
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 2200)
  }
  const copyDemoLink = async () => {
    if (branding.themeId === 'custom' || !navigator.clipboard) return false
    const url = new URL(window.location.href)
    url.pathname = '/'
    url.search = ''
    url.searchParams.set('theme', branding.themeId)
    url.hash = ''
    try {
      await navigator.clipboard.writeText(url.toString())
      return true
    } catch {
      return false
    }
  }

  const filteredMerchants = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    const filtered = merchants.filter((merchant) =>
      (category === 'All' || merchant.categories.some((item) => item.toLowerCase() === category.toLowerCase())) &&
      (!searchTerm || [merchant.name, merchant.description, ...merchant.categories].some((item) => item.toLowerCase().includes(searchTerm))),
    )
    if (sort === 'Highest Cashback Rate') return filtered.sort((a, b) => merchantCashbackRate(b) - merchantCashbackRate(a) || a.name.localeCompare(b.name))
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [category, search, sort])

  const selectedMerchant = merchantFor(selectedMerchantName)
  const selectedTransaction = transactions.find((transaction) => transaction.id === selectedTransactionId) ?? transactions[0]
  const palette = THEME_PRESETS[branding.baseThemeId]

  const openMerchant = (name: string) => {
    const merchant = merchantFor(name)
    setSelectedMerchantName(merchant.name)
    navigate(merchant.detailRoute)
  }
  const openTransaction = (transaction: (typeof transactions)[number]) => {
    setSelectedMerchantName(transaction.merchant)
    setSelectedTransactionId(transaction.id)
    navigate('transaction')
  }

  return (
    <main
      className="prototype-stage"
      data-theme={branding.baseThemeId}
      style={{ '--theme-primary': branding.primary, '--theme-secondary': branding.secondary, '--theme-navy': palette.navy, '--theme-soft': palette.soft, '--theme-background': palette.background, '--theme-strong': branding.themeId === 'custom' ? `color-mix(in srgb, ${branding.primary} 76%, ${palette.navy})` : palette.strong } as React.CSSProperties}
    >
      <DemoSettings
        settings={branding}
        storageAvailable={storageAvailable}
        onChange={setBranding}
        onReset={() => setBranding(DEFAULT_BRAND_SETTINGS)}
        onCopyDemoLink={copyDemoLink}
      />
      <div className="device-shell">
        <div className="device-camera" aria-hidden="true" />
        <PhoneStatusBar dark={false} />
        <div key={screen} className="screen-viewport screen-light">
          {screen === 'home' && <HomeScreen branding={branding} customerName={DEMO_CUSTOMERS[branding.customerId].name} onOpenDeals={() => navigate('deals')} onToast={toast} />}
          {screen === 'deals' && <DealsScreen cashbackName={branding.cashbackName} category={category} setCategory={setCategory} search={search} setSearch={setSearch} sort={sort} setSort={setSort} visibleMerchants={filteredMerchants} onBack={goBack} onSelect={openMerchant} onOpenLedger={() => navigate('ledger')} />}
          {screen === 'merchant' && <MerchantScreen cashbackName={branding.cashbackName} merchant={selectedMerchant} onBack={goBack} onTerms={() => navigate('terms')} />}
          {screen === 'ledger' && <LedgerScreen cashbackName={branding.cashbackName} filter={transactionFilter} setFilter={setTransactionFilter} onBack={goBack} onBrowse={() => navigate('deals')} onSelectTransaction={openTransaction} />}
          {screen === 'transaction' && <TransactionScreen cashbackName={branding.cashbackName} transaction={selectedTransaction} merchant={selectedMerchant} onBack={goBack} onTerms={() => navigate('terms')} />}
          {screen === 'terms' && <TermsScreen cashbackName={branding.cashbackName} merchant={selectedMerchant} onBack={goBack} onReturn={goBack} returnLabel={history[history.length - 1] === 'merchant' ? `Back to ${selectedMerchant.name}` : 'Back to transaction details'} />}
        </div>
        {showToast && <div className="app-toast" role="status">{toastMessage}</div>}
      </div>
    </main>
  )
}

function HomeScreen({ branding, customerName, onOpenDeals, onToast }: { branding: BrandSettings; customerName: string; onOpenDeals: () => void; onToast: () => void }) {
  const quickActions = [
    { label: 'Scan', icon: QrCode }, { label: 'Pay', icon: CreditCard }, { label: 'Transfer', icon: ArrowLeftRight }, { label: 'Bills', icon: ReceiptText },
    { label: 'Top Up', icon: ArrowDownUp }, { label: 'Parking', icon: Clock3 }, { label: 'Insurance', icon: ShieldCheck },
  ]
  const featured = merchants.slice(0, 3)
  const partnerName = branding.partnerName.trim()
  return (
    <div className="screen-content home-content">
      <div className={`home-greeting-row${branding.logoDataUrl || partnerName ? '' : ' home-greeting-row-unbranded'}`}>
        {(branding.logoDataUrl || partnerName) && <div className="partner-lockup">
          {branding.logoDataUrl && <img className="partner-logo-image" src={branding.logoDataUrl} alt={`${partnerName || 'Partner'} logo`} />}
          {partnerName && <span className="partner-lockup-copy"><strong>{partnerName}</strong><small>Digital wallet</small></span>}
        </div>}
        <div className="home-profile-actions">
          <button className="notification-button" aria-label="Notifications" onClick={onToast}><Bell size={23} /><span>3</span></button>
          <button className="profile-button" aria-label={`Profile for ${customerName}`} onClick={onToast}><UserRound size={26} /></button>
        </div>
      </div>
      <div className="home-greeting-copy"><p className="user-greeting">{`Good morning, ${customerName}!`}</p></div>

      <section className="balance-banner" aria-label={`Available Balance ${formatRM(WALLET_BALANCE)}`}>
        <div><span className="balance-label">Available Balance</span><strong>{formatRM(WALLET_BALANCE)} <Eye size={19} /></strong></div>
        <button className="button-primary balance-add" onClick={onToast}><span>+</span> Add money</button>
      </section>

      <button className="home-campaign" onClick={onOpenDeals} aria-label={`Explore ${branding.cashbackName} deals`}>
        <div className="campaign-copy"><span className="campaign-kicker">{branding.cashbackName} Deals · PARTNER OFFERS</span><strong>Shop online.<br />Get more back.</strong><p>Discover offers from favourite brands and earn on eligible purchases.</p><span className="campaign-button">Explore deals <ChevronRight size={16} /></span></div>
        <div className="campaign-photo" role="img" aria-label="Suitcase, sun hat and sunglasses ready for a trip"><Image src="/images/cashback-travel.png" alt="" fill sizes="(max-width: 480px) 58vw, 240px" priority /></div>
      </button>

      <section className="quick-grid" aria-label="Wallet services">
        {quickActions.map(({ label, icon: Icon }) => <button className="quick-action" key={label} onClick={onToast}><span><Icon size={22} /></span><small>{label}</small></button>)}
        <button className="quick-action cashback-shortcut" onClick={onOpenDeals}>
          <span><ShoppingBag size={24} /></span><small>{branding.cashbackName}<br />Deals</small><b>Explore</b>
        </button>
      </section>

      <div className="section-heading home-featured-heading"><h2>Featured merchants</h2><button onClick={onOpenDeals}>See all <ChevronRight size={16} /></button></div>
      <div className="featured-scroll">
        {featured.map((merchant) => <button key={merchant.name} className="featured-card" aria-label={`${merchant.name}, up to ${formatRate(merchantCashbackRate(merchant))}% ${branding.cashbackName}`} onClick={onOpenDeals}><span className="featured-scene" aria-hidden="true"><Image src={merchant.bannerPath} alt="" fill sizes="120px" /></span><BrandLogo merchant={merchant} /><strong>Up to {formatRate(merchantCashbackRate(merchant))}%</strong><span>{branding.cashbackName}</span></button>)}
      </div>

      <nav className="bottom-tabs" aria-label="Primary navigation">
        <button className="active" aria-current="page"><Home size={20} fill="currentColor" /><span>Home</span></button>
        <button onClick={onToast}><Sparkles size={20} /><span>Rewards</span></button>
        <button onClick={onToast}><QrCode size={21} /><span>Scan</span></button>
        <button onClick={onToast}><Menu size={21} /><span>More</span></button>
      </nav>
    </div>
  )
}

function DealsScreen({ cashbackName, category, setCategory, search, setSearch, sort, setSort, visibleMerchants, onBack, onSelect, onOpenLedger }: {
  cashbackName: string; category: string; setCategory: (value: string) => void; search: string; setSearch: (value: string) => void; sort: string; setSort: (value: string) => void; visibleMerchants: Merchant[]; onBack: () => void; onSelect: (name: string) => void; onOpenLedger: () => void
}) {
  const categories = ['All', 'Hotels', 'Flights', 'Car Rentals', 'Activities', 'Attractions', 'Homes', 'Fashion', 'Lifestyle', 'Online Shopping', 'Sports']
  return (
    <div className="screen-content deals-content">
      <ScreenHeader title={`${cashbackName} Deals`} onBack={onBack} right={<button className="icon-button" aria-label="Find offers" onClick={() => document.getElementById('merchant-search')?.focus()}><Search size={21} /></button>} />
      <nav className="cashback-section-nav" role="tablist" aria-label={`${cashbackName} section`}>
        <button type="button" role="tab" aria-selected="true" className="selected">{cashbackName} Deals</button>
        <button type="button" role="tab" aria-selected="false" onClick={onOpenLedger}><ReceiptText size={15} /> My {cashbackName}</button>
      </nav>
      <label className="search-field"><Search size={19} /><input id="merchant-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search merchants or offers" aria-label="Search merchants or offers" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</label>
      <div className="category-pills" aria-label="Filter by category">
        {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'selected' : ''} aria-pressed={category === item}>{item}</button>)}
      </div>
      <div className="section-heading deals-list-heading"><h2>{category === 'All' ? 'Explore offers' : `${category} offers`}</h2><label className="sort-select"><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort offers"><option value="Name (A–Z)">Name (A–Z)</option><option value="Highest Cashback Rate">Highest {cashbackName} Rate</option></select><ChevronDown size={15} /></label></div>
      <div className="merchant-list">
        {visibleMerchants.map((merchant) => <button className="merchant-row" key={merchant.name} onClick={() => onSelect(merchant.name)}>
          <div className="merchant-logo-box"><BrandLogo merchant={merchant} /></div>
          <div className="merchant-info"><strong>{merchant.name}</strong><span>{merchant.categories.slice(0, 2).join(' · ')}</span></div>
          <div className="merchant-rate"><strong>Up to {formatRate(merchantCashbackRate(merchant))}%</strong><span>{cashbackName}</span></div><ChevronRight className="merchant-chevron" size={19} />
        </button>)}
        {!visibleMerchants.length && <div className="empty-search"><Search size={22} /><strong>No offers found</strong><span>Try another search or browse all offers.</span><button className="empty-state-button" onClick={() => { setSearch(''); setCategory('All') }}>Browse all offers</button></div>}
      </div>
    </div>
  )
}

function MerchantScreen({ cashbackName, merchant, onBack, onTerms }: { cashbackName: string; merchant: Merchant; onBack: () => void; onTerms: () => void }) {
  const shopUrl = merchant.affiliateUrl ?? merchant.officialWebsite
  const isBooking = merchant.categories.some((category) => ['Hotels', 'Homes', 'Flights', 'Car Rentals', 'Activities', 'Attractions'].includes(category))
  const purchase = isBooking ? 'booking' : 'purchase'
  const about = merchant.about.replace(/cashback/gi, cashbackName)
  return (
    <div className="screen-content trip-content">
      <ScreenHeader title={merchant.name} onBack={onBack} />
      <figure className="merchant-banner">
        <Image src={merchant.bannerPath} alt={merchant.bannerAlt} fill sizes="(max-width: 480px) 100vw, 384px" />
        <figcaption>Illustrative category photography · not an official merchant campaign</figcaption>
      </figure>
      <section className="merchant-profile">
        <div className="merchant-profile-logo"><BrandLogo merchant={merchant} /></div>
        <div className="trip-headline"><h2><em>Up to {formatRate(merchantCashbackRate(merchant))}%</em> {cashbackName}</h2><p>{merchant.description}</p></div>
      </section>
      <div className="service-tags" aria-label="Merchant categories">{merchant.categories.map((item) => <span key={item}>{item}</span>)}</div>
      <section className="about-section"><h3>About {merchant.name}</h3><p>{about}</p></section>
      <section className="rates-card"><div className="rates-card-heading"><h3>{cashbackName} rates</h3><b>Up to {formatRate(merchantCashbackRate(merchant))}%</b></div>
        {merchant.eventRates.map((eventRate) => <div className="rate-line" key={eventRate.category}><span>{eventRate.category}</span><strong>Up to {formatRate(effectiveEventRate(eventRate))}%</strong></div>)}
      </section>
      <section className="steps-section"><h3>How to earn {cashbackName.toLowerCase()}</h3>
        <Step number="1" title="Select Shop Now" description="Opens the merchant’s website. Cashback depends on eligible purchases and successful tracking under the offer terms." />
        <Step number="2" title={`Complete your ${purchase}`} description={`Complete an eligible ${purchase} and follow the merchant’s offer terms.`} />
        <Step number="3" title={`Check your ${cashbackName}`} description={`Visit My ${cashbackName} to review your ${purchase} and its status.`} />
      </section>
      <div className="trip-sticky-cta"><a className="button-primary shop-now-button" href={shopUrl} target="_blank" rel="noopener noreferrer">Shop Now <ExternalLink size={17} /></a><p className="cashback-disclosure">This link opens the merchant’s website; cashback depends on eligible transaction tracking and merchant terms.</p></div>
      <button className="list-link" onClick={onTerms}><FileText size={20} /><span>View terms &amp; conditions</span><ChevronRight size={19} /></button>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="instruction-step"><span className="step-number">{number}</span><div><strong>{title}</strong><p>{description}</p></div></div>
}

function LedgerScreen({ cashbackName, filter, setFilter, onBack, onBrowse, onSelectTransaction }: { cashbackName: string; filter: string; setFilter: (value: string) => void; onBack: () => void; onBrowse: () => void; onSelectTransaction: (transaction: Transaction) => void }) {
  const filters: Array<'All' | CashbackStatus> = ['All', 'Pending', 'Approved', 'Rejected']
  const visible = transactions.filter((transaction) => filter === 'All' || transaction.status === filter)
  const pendingCashback = transactions.filter((transaction) => transaction.status === 'Pending').reduce((total, transaction) => total + estimatedCashbackFor(transaction), 0)
  const approvedCashback = transactions.filter((transaction) => transaction.status === 'Approved').reduce((total, transaction) => total + transaction.amount, 0)
  return (
    <div className="screen-content ledger-content">
      <ScreenHeader title={`My ${cashbackName}`} onBack={onBack} right={<button className="icon-button" aria-label="Filter transactions" onClick={() => setFilter(filter === 'All' ? 'Pending' : 'All')}><Filter size={19} /></button>} />
      <div className="ledger-filters" role="tablist" aria-label={`${cashbackName} status`}>
        {filters.map((item) => <button key={item} role="tab" aria-selected={filter === item} className={`status-filter status-filter-${item.toLowerCase()} ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <section className="summary-card"><div><span>Pending {cashbackName}</span><strong>{formatRM(pendingCashback)}</strong><small>Estimated, awaiting merchant approval.</small></div><div><span>Approved {cashbackName}</span><strong>{formatRM(approvedCashback)}</strong><small>Merchant-approved; wallet credit is separate.</small></div></section>
      <div className="section-heading ledger-list-heading"><h2>Transaction History</h2></div>
      <div className="transaction-list">
        {visible.map((transaction) => {
          const merchant = merchantFor(transaction.merchant)
          const cashbackAmount = transaction.status === 'Pending' ? estimatedCashbackFor(transaction) : transaction.amount
          const cashbackLabel = transaction.status === 'Pending' ? `Estimated ${cashbackName}` : `Approved ${cashbackName}`
          return <button className="transaction-row" key={transaction.id} onClick={() => onSelectTransaction(transaction)}>
            <div className="transaction-logo"><BrandLogo merchant={merchant} compact /></div>
            <div className="transaction-description"><strong>{merchant.name}</strong><span>{transaction.orderId ? `Order ID ${transaction.orderId} · ` : ''}Purchase date {transaction.date}</span><small>Order amount {formatRM(transaction.purchaseAmount ?? 0)} · {transaction.description}</small></div>
            <div className="transaction-money">{transaction.status !== 'Rejected' && <><strong>{formatRM(cashbackAmount)}</strong><small>{cashbackLabel}</small></>}<span className={`status-pill ${statusMeta[transaction.status].className}`}>{transaction.status}</span></div><ChevronRight size={18} className="merchant-chevron" />
          </button>
        })}
        {!visible.length && <div className="empty-search"><Filter size={21} /><strong>{filter === 'All' ? `No ${cashbackName.toLowerCase()} transactions yet` : `No ${filter.toLowerCase()} transactions`}</strong><span>{filter === 'All' ? 'Your purchases will appear here once they have been recorded.' : "There's nothing to show here yet."}</span></div>}
      </div>
      <button className="button-primary browse-button" onClick={onBrowse}>Explore Deals <ChevronRight size={19} /></button>
    </div>
  )
}

function TransactionScreen({ cashbackName, transaction, merchant, onBack, onTerms }: { cashbackName: string; transaction: Transaction; merchant: Merchant; onBack: () => void; onTerms: () => void }) {
  const orderRows: string[][] = []
  if (transaction.orderId) orderRows.push(['Order ID', transaction.orderId])
  if (transaction.purchaseDateTime ?? transaction.date) orderRows.push(['Purchase date', transaction.purchaseDateTime ?? transaction.date])
  if (transaction.purchaseAmount !== undefined) orderRows.push(['Order amount', formatRM(transaction.purchaseAmount)])

  const cashbackRows: string[][] = []
  if (transaction.status === 'Pending') {
    const eventRate = merchant.eventRates.find((item) => item.category === transaction.description) ?? merchant.eventRates.reduce((highest, item) => effectiveEventRate(item) > effectiveEventRate(highest) ? item : highest)
    cashbackRows.push([`${cashbackName} rate`, `${formatRate(effectiveEventRate(eventRate))}%`])
    cashbackRows.push([`Estimated ${cashbackName}`, formatRM(transaction.estimatedAmount ?? transaction.amount), 'pending'])
  } else if (transaction.status === 'Approved') {
    cashbackRows.push([`Approved ${cashbackName}`, formatRM(transaction.amount), 'positive'])
  } else {
    cashbackRows.push([cashbackName, 'RM0.00'])
  }

  const statusInformation = {
    Pending: { heading: 'Cashback pending', description: 'Your cashback is being reviewed.' },
    Approved: { heading: 'Cashback approved', description: 'Your cashback has been approved. This does not mean it has been credited to your wallet.' },
    Rejected: { heading: 'Cashback rejected', description: 'This transaction is not eligible for cashback.' },
  }[transaction.status]

  return (
    <div className="screen-content transaction-content">
      <ScreenHeader title="Transaction Details" onBack={onBack} />
      <section className="transaction-merchant-card"><div className="transaction-merchant-logo"><BrandLogo merchant={merchant} /></div><div className="transaction-merchant-name"><strong>{merchant.name}</strong><span>{merchant.description}</span></div><span className={`status-pill ${statusMeta[transaction.status].className}`}>{transaction.status}</span></section>
      <DataSection title="Order Information" rows={orderRows} />
      <DataSection title={`${cashbackName} details`} rows={cashbackRows} />
      <DataSection title="Transaction Status" rows={[["Status", transaction.status, `status-${transaction.status.toLowerCase()}`], ["Last updated", transaction.statusUpdatedAt]]} />
      <section className="transaction-status-note" data-status={transaction.status.toLowerCase()}><h2>{statusInformation.heading}</h2><p>{statusInformation.description}</p></section>
      <div className="detail-links"><button onClick={onTerms}><FileText size={21} /><span>View terms &amp; conditions</span><ChevronRight size={18} /></button></div>
      <section className="support-card"><CircleHelp size={22} /><div><h2>Need help with this purchase?</h2><p>If your {cashbackName.toLowerCase()} is missing or incorrect, contact Customer Support with your order number and proof of purchase.</p><p>Missing cashback claims should normally be submitted within 30 days of purchase, unless the merchant’s terms specify otherwise. For travel bookings, the applicable claim period may depend on completion of your stay, flight or activity.</p></div></section>
    </div>
  )
}

function DataSection({ title, rows }: { title: string; rows: string[][] }) {
  return <section className="data-section"><h2>{title}</h2><div className="data-card">{rows.map(([label, value, tone]) => <div className="data-row" key={label}><span>{label}</span><strong className={tone?.startsWith('status-') ? `status-pill ${tone}` : tone}>{value}</strong></div>)}</div></section>
}

function TermsScreen({ cashbackName, merchant, onBack, onReturn, returnLabel }: { cashbackName: string; merchant: Merchant; onBack: () => void; onReturn: () => void; returnLabel: string }) {
  const feature = cashbackName.toLowerCase()
  const topics = [
    { title: 'Eligible purchases', icon: ShoppingBag, lines: [`Shop Now opens the merchant’s website. Cashback is available only for purchases recorded through an eligible offer.`, `Rates and eligibility depend on the merchant’s current terms.`, `Eligibility may vary by purchase category.`] },
    { title: 'Exclusions', icon: FileText, lines: [`Cancelled, refunded or otherwise ineligible purchases may not qualify for ${feature}.`, 'Using promotional codes that are not approved under an offer may affect eligibility.', `Purchases that are not tracked may not qualify for ${feature}.`, 'Additional merchant-specific exclusions may apply.', ...merchant.terms] },
    { title: `How to qualify for ${feature}`, icon: ArrowLeftRight, lines: [`Start from an eligible Cashback Deals offer and complete your purchase under the merchant’s terms.`, 'Avoid switching between promotional links during checkout, as this may affect tracking.', 'Only purchases confirmed by the merchant qualify.'] },
    { title: `${cashbackName} approval`, icon: Clock3, lines: [`Pending amounts are estimates until a merchant review is complete.`, `Approved means the merchant has approved the amount; it does not mean the cashback has been credited to your wallet.`, `The final ${feature} amount may change following review.`, 'Wallet crediting is handled separately under the applicable wallet terms.'] },
    { title: `Missing or rejected ${feature}`, icon: CircleHelp, lines: [`Contact Customer Support with your order details and proof of purchase.`, 'Claim windows and eligibility depend on merchant terms.', `${cashbackName} claims are subject to the merchant’s eligibility rules and review outcome.`, 'Submitting proof of purchase does not guarantee approval.', `Rejected ${feature} is not eligible for payment unless the merchant approves an adjustment.`] },
  ]
  return (
    <div className="screen-content terms-content">
      <ScreenHeader title={`${cashbackName} Terms & Conditions`} onBack={onBack} />
      <div className="terms-brand-banner"><div><BrandLogo merchant={merchant} /><span>{merchant.description}</span></div></div>
      <div className="terms-topic-list">{topics.map(({ title, icon: Icon, lines }, index) => <section className="terms-topic" key={title}>
        <div className="terms-topic-symbol"><span>{index + 1}</span><div><Icon size={25} /></div></div>
        <div className="terms-topic-copy"><h2>{title}</h2><ul>{lines.map((line, lineIndex) => <li key={`${title}-${lineIndex}`}>{line}</li>)}</ul></div>
      </section>)}</div>
      <button className="terms-return" onClick={onReturn}>{returnLabel} <ChevronRight size={20} /></button>
    </div>
  )
}

export default CashbackPrototype
