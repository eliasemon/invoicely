import Link from 'next/link';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import { getProfile } from '@/app/actions/profileActions';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';

export default async function LandingPage() {
  let defaultCurrency = 'USD';
  let defaultCurrencySymbol: string | undefined = undefined;
  
  try {
    const profile = await getProfile();
    if (profile) {
      defaultCurrency = profile.default_currency || 'USD';
      defaultCurrencySymbol = profile.currency_symbol || undefined;
    }
  } catch (e) {
    // User not authenticated or no profile, use defaults
  }

  return (
    <div className="bg-background text-on-background font-body-md antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* TopAppBar */}
      <nav className="absolute top-0 w-full z-50 pt-2 md:pt-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-16 px-margin-mobile md:px-margin-desktop">
          <div className="flex items-center gap-xs">
            <MaterialIcon icon="account_balance_wallet" filled className="text-primary" />
            <span className="text-headline-md font-headline-md tracking-tight text-primary dark:text-primary-fixed-dim">Invoicely</span>
          </div>
          <Link href="/dashboard" className="bg-primary text-on-primary font-label-sm text-label-sm px-sm py-xs rounded-lg hover:bg-primary-container transition-colors duration-200 active:scale-95 flex items-center gap-base h-10 px-md">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-xl">
        {/* Hero Section */}
        <section 
          className="px-margin-mobile md:px-margin-desktop py-[120px] md:py-[160px] relative overflow-hidden flex flex-col md:flex-row items-center gap-xl min-h-[795px] md:min-h-screen"
          style={{ background: 'linear-gradient(135deg, #f7f9fb 0%, #e0e3e5 100%)' }}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-fixed/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary-fixed/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="flex-1 flex flex-col justify-center items-center z-10 pt-lg md:pt-0">
            <div className="flex flex-col items-start text-left gap-md">
              <div className="inline-flex items-center gap-base bg-surface-container-highest px-sm py-xs rounded-full mb-xs">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">New Release V2.0</span>
              </div>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight max-w-[15ch]">
                Invoicing at the Speed of Business.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[40ch]">
                Create, send, and track professional invoices in seconds. Built for modern businesses demanding precision and clarity.
              </p>
              <div className="flex flex-col sm:flex-row gap-sm mt-sm">
                <Link href="/dashboard" className="bg-primary text-on-primary font-body-md text-body-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors duration-200 active:scale-95 shadow-md flex items-center justify-center gap-xs h-12 w-full sm:w-auto">
                  Get Started - Free
                  <MaterialIcon icon="arrow_forward" className="text-[18px]" />
                </Link>
                <button className="bg-transparent border border-outline-variant text-primary font-body-md text-body-md px-md py-sm rounded-lg hover:bg-surface-container transition-colors duration-200 active:scale-95 flex items-center justify-center gap-xs h-12 w-full sm:w-auto">
                  <MaterialIcon icon="visibility" className="text-[18px]" />
                  Try Live Preview
                </button>
              </div>
              
              <div className="mt-md flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">JD</div>
                  <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">AK</div>
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">SM</div>
                </div>
                <span>Join 10,000+ professionals</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 flex justify-center mt-xl md:mt-0">
            <div className="relative w-full max-w-[320px] aspect-[1/2]">
              {/* 3D Phone Render Placeholder */}
              <div className="absolute inset-0 rounded-[40px] shadow-2xl bg-surface-container-lowest border-8 border-primary-container overflow-hidden ring-1 ring-white/20">
                <img 
                  alt="3D render of a sleek smartphone displaying a modern digital invoice interface." 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc_B3LZ7i0x2cwDC4GuPbmNj0vwTLWsRcGhX-j5eKPr22KKMZf1dtywyYkBg4Ru3pTy_NTTl9tgUEgYhzP0QKq3bVXqpoyQ3BT302IdGwhcVyqeFfexta2_lTAUn3t9x-83OAusdt4Zv5PrNqhg0BgPphJlIEvrKNDHDE4SSYqg6yaH9GSrFR9qMP4e__R8CU8lBXJ-sXEGLsylCrEfhHfTXfVByNTfctH6drkbiuQxc33uY6X-_uL0oaulTcf6L1DcC2mf2D6avHM"
                />
                {/* Overlay UI Elements to simulate app */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
                <div 
                  className="absolute top-8 left-4 right-4 rounded-xl p-4 shadow-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 8px 32px 0 rgba(4, 22, 39, 0.05)'
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-caps text-label-caps text-primary">Invoice #INV-2024</span>
                    <span className="bg-tertiary-fixed/20 text-on-tertiary-container px-2 py-1 rounded text-[10px] font-bold">PAID</span>
                  </div>
                  <div className="font-mono text-xl font-bold text-primary">
                    <CurrencyDisplay amount={4250.00} currency={defaultCurrency} currencySymbol={defaultCurrencySymbol} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="border-y border-outline-variant/20 bg-surface-container-lowest py-lg overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            <p className="text-center font-label-caps text-label-caps text-on-surface-variant mb-md uppercase tracking-widest">Trusted by 10k+ businesses worldwide</p>
            <div className="flex justify-center md:justify-between items-center gap-lg flex-wrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="h-8 flex items-center font-headline-md text-headline-md text-primary font-bold">Acme Corp</div>
              <div className="h-8 flex items-center font-headline-md text-headline-md text-primary font-bold">Globex</div>
              <div className="h-8 flex items-center font-headline-md text-headline-md text-primary font-bold hidden sm:flex">Soylent</div>
              <div className="h-8 flex items-center font-headline-md text-headline-md text-primary font-bold hidden md:flex">Initech</div>
              <div className="h-8 flex items-center font-headline-md text-headline-md text-primary font-bold hidden lg:flex">Umbrella</div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="bg-surface-container-lowest py-xl">
          <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
            <div className="mb-lg text-center md:text-left">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-xs">Engineered for Precision</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[60ch] mx-auto md:mx-0">Advanced tooling designed to eliminate friction in your billing workflow.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md auto-rows-[240px]">
              {/* Card 1: A4 Optimized */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-secondary-container/30 rounded-full blur-2xl group-hover:bg-secondary-container/50 transition-colors"></div>
                <div className="z-10">
                  <MaterialIcon icon="description" className="text-primary mb-sm bg-surface-container p-2 rounded-lg" />
                  <h3 className="font-headline-md text-headline-md text-primary mb-xs">A4 Optimized</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Professional templates perfectly scaled for print and PDF generation.</p>
                </div>
                <div className="mt-auto z-10 flex items-center text-primary font-label-sm text-label-sm group-hover:translate-x-1 transition-transform cursor-pointer">
                  Explore templates <MaterialIcon icon="arrow_forward" className="text-[16px] ml-1" />
                </div>
              </div>

              {/* Card 2: Scan to Pay */}
              <div className="bg-primary-container text-on-primary-container border border-primary-container rounded-xl p-md shadow-md flex flex-col justify-between md:col-span-2 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
                <div className="flex flex-col md:flex-row gap-md h-full z-10">
                  <div className="flex-1 flex flex-col justify-center">
                    <MaterialIcon icon="qr_code_scanner" className="text-tertiary-fixed mb-sm bg-surface/10 w-fit p-2 rounded-lg" />
                    <h3 className="font-headline-md text-headline-md text-surface-container-lowest mb-xs">Scan to Pay</h3>
                    <p className="font-body-md text-body-md text-on-primary-container max-w-[30ch]">Generate secure QR codes directly on your invoices for instant, frictionless settlement.</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center md:justify-end relative">
                    <div className="w-32 h-32 bg-surface-container-lowest rounded-xl p-2 shadow-xl transform group-hover:scale-105 transition-transform flex flex-col items-center justify-center gap-2">
                      <div className="w-full h-full border-4 border-primary rounded-lg p-1 flex flex-wrap gap-1">
                        <div className="w-6 h-6 bg-primary rounded-sm"></div>
                        <div className="w-6 h-6 bg-primary rounded-sm ml-auto"></div>
                        <div className="w-full flex-1 bg-surface-variant rounded-sm flex items-center justify-center font-mono text-[8px] text-on-surface-variant overflow-hidden">DATA</div>
                        <div className="w-6 h-6 bg-primary rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Global Ready */}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-md shadow-sm flex flex-col justify-between md:col-span-3 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-center gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <MaterialIcon icon="public" className="text-primary bg-surface-container p-2 rounded-lg" />
                      <h3 className="font-headline-md text-headline-md text-primary">Global Ready</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-[40ch]">Multi-currency support with real-time symbol mapping and dynamic exchange rate calculations.</p>
                  </div>
                  <div className="flex-1 w-full flex gap-xs flex-wrap justify-center md:justify-end">
                    <span className="px-sm py-xs bg-surface border border-outline-variant/30 rounded-full font-mono text-label-sm text-primary flex items-center gap-1">
                      <span className="text-on-surface-variant">{defaultCurrency}</span> 
                      <CurrencyDisplay amount={0} currency={defaultCurrency} currencySymbol={defaultCurrencySymbol} className="hidden" />
                      {defaultCurrencySymbol || (
                        (() => {
                          try {
                            const parts = new Intl.NumberFormat('en', { style: 'currency', currency: defaultCurrency, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
                            return parts.find(p => p.type === 'currency')?.value || defaultCurrency;
                          } catch {
                            return defaultCurrency;
                          }
                        })()
                      )}
                    </span>
                    <span className="px-sm py-xs bg-surface border border-outline-variant/30 rounded-full font-mono text-label-sm text-primary flex items-center gap-1"><span className="text-on-surface-variant">EUR</span> €</span>
                    <span className="px-sm py-xs bg-surface border border-outline-variant/30 rounded-full font-mono text-label-sm text-primary flex items-center gap-1"><span className="text-on-surface-variant">GBP</span> £</span>
                    <span className="px-sm py-xs bg-surface border border-outline-variant/30 rounded-full font-mono text-label-sm text-primary flex items-center gap-1"><span className="text-on-surface-variant">JPY</span> ¥</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-xl px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-[800px] mx-auto text-center flex flex-col items-center">
            <MaterialIcon icon="format_quote" filled className="text-tertiary-fixed-dim text-4xl mb-sm" />
            <p className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-md italic leading-tight">
              &quot;Invoicely reduced our late payments by 40% in the first quarter. The interface is exceptionally clean, and the automated QR codes are a game-changer for client settlement.&quot;
            </p>
            <div className="flex items-center gap-sm mt-sm">
              <img 
                alt="Sarah Jenkins" 
                className="w-12 h-12 rounded-full border-2 border-surface object-cover shadow-sm" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd6trtq619gzex6kDnzICnJuGe1HQ983Y3ax8ELCEITtUh4D55WeyPpZ9-n2RIjQsM1L1C5zZ0xlDw8kv4ZfWXbK0P4aDKF2Om-kK-mrkCKbyO2mIRd_UzWuuieQRmbUVWITPWTp_mVv_o5n4xd2XFerFreH0_foZm9wtwbnRNRzcFJx9L6p0AoGW7DtzJn-k6gKiO6YDIs2gezruwgExqK4uILLENZOE1L2TG0h8Lh-dFlKCC3H5DSWfm2cnsukkgfPVb2ZEPk39D"
              />
              <div className="text-left">
                <div className="font-label-sm text-label-sm font-bold text-primary">Sarah Jenkins</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">CFO, TechFlow Solutions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-surface-container-lowest py-xl">
          <div className="px-margin-mobile md:px-margin-desktop text-center max-w-[800px] mx-auto">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-sm">Ready to streamline your billing?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md max-w-[50ch] mx-auto">Join thousands of businesses prioritizing speed, precision, and professional aesthetics.</p>
            <Link href="/dashboard" className="bg-primary text-on-primary font-body-md text-body-md px-xl py-sm rounded-lg hover:bg-primary-container transition-colors duration-200 active:scale-95 shadow-md inline-flex items-center gap-xs h-12">
              Start your first invoice
              <MaterialIcon icon="rocket_launch" className="text-[18px]" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full py-lg border-t border-outline-variant/20 mt-auto">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-md px-margin-mobile md:px-margin-desktop">
          <div className="font-headline-md text-headline-md text-primary flex items-center gap-xs">
            <MaterialIcon icon="account_balance_wallet" filled /> Invoicely
          </div>
          <nav className="flex flex-wrap justify-center gap-md">
            <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Product</Link>
            <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Features</Link>
            <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Security</Link>
            <Link href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          </nav>
          <div className="font-label-sm text-label-sm text-on-surface-variant text-center md:text-right">
            © 2024 Invoicely Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
