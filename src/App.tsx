import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import WelcomeModal from "@/components/WelcomeModal";
import ThemeToggle from "@/components/ThemeToggle";
import LoadingScreen from "@/components/LoadingScreen";
import LoginScreen from "@/components/LoginScreen";
import SelectionScreen from "@/components/SelectionScreen";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import Settings from "@/pages/Settings";
import StaffDashboard from "@/pages/StaffDashboard";
import type { PageKey } from "@/lib/nav";
import type { Product, Sale, StockMovement } from "@/types";
import {
  fetchProducts,
  fetchSales,
  fetchStockMovements,
  upsertProduct,
  deleteProduct,
  insertSale,
  insertStockMovement,
  seedSampleData,
  resetAllData,
  getStoreName,
  saveStoreName,
  getTheme,
  saveTheme,
} from "@/lib/storage";
import { Menu, Loader2, Home } from "lucide-react";

function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [storeName, setStoreName] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [route, setRoute] = useState<"select" | "store" | "staff">("select");

  useEffect(() => {
    const theme = getTheme();
    setIsDark(theme === "dark");

    const existing = getStoreName();
    if (!existing) {
      setShowWelcome(true);
    } else {
      setStoreName(existing);
    }

    const isAuth = false;
    setAuthenticated(isAuth);

    loadData();

    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      const [p, s, sm] = await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchStockMovements(),
      ]);

      // If no products exist yet, seed sample data
      if (p.length === 0) {
        const seeded = await seedSampleData();
        setProducts(seeded.products);
        setSales(seeded.sales);
        setStockMovements(seeded.stockMovements);
      } else {
        setProducts(p);
        setSales(s);
        setStockMovements(sm);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function handleThemeToggle() {
    setTransitioning(true);
    document.documentElement.classList.add("theme-transition");
    const newDark = !isDark;
    setIsDark(newDark);
    saveTheme(newDark ? "dark" : "light");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      setTransitioning(false);
    }, 500);
  }

  function handleWelcomeSave(name: string) {
    saveStoreName(name);
    setStoreName(name);
    setShowWelcome(false);
  }

  function handleNavigate(key: PageKey) {
    setPage(key);
    setSidebarOpen(false);
  }

  async function updateProducts(updated: Product[]) {
    const prev = products;
    setProducts(updated);
    try {
      // Upsert changed products + delete removed ones
      const updatedIds = new Set(updated.map((p) => p.id));
      for (const p of updated) {
        await upsertProduct(p);
      }
      for (const old of prev) {
        if (!updatedIds.has(old.id)) {
          await deleteProduct(old.id);
        }
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در ذخیره کالاها");
    }
  }

  async function addSale(sale: Sale) {
    setSales((prev) => [...prev, sale]);
    try {
      await insertSale(sale);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در ثبت فروش");
    }
  }

  async function updateStockMovements(movements: StockMovement[]) {
    const newOnes = movements.filter(
      (m) => !stockMovements.some((existing) => existing.id === m.id)
    );
    setStockMovements(movements);
    try {
      for (const m of newOnes) {
        await insertStockMovement(m);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در ثبت حرکت انبار");
    }
  }

  async function handleReset() {
    try {
      await resetAllData();
      const seeded = await seedSampleData();
      setProducts(seeded.products);
      setSales(seeded.sales);
      setStockMovements(seeded.stockMovements);
      setPage("dashboard");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "خطا در بازنشانی داده‌ها");
    }
  }

  function handleStoreNameChange(name: string) {
    saveStoreName(name);
    setStoreName(name);
  }

  function handleLogout() {
    setAuthenticated(false);
    setRoute("select");
    setPage("dashboard");
    setSidebarOpen(false);
  }

  const titles: Record<PageKey, string> = {
    dashboard: "داشبورد",
    products: "مدیریت کالاها",
    sales: "ثبت فروش",
    inventory: "انبار",
    settings: "تنظیمات",
  };

  if (showSplash) {
    return <LoadingScreen />;
  }

  if (!authenticated) {
    return <LoginScreen onSuccess={() => { setAuthenticated(true); setRoute("select"); }} />;
  }

  if (route === "select") {
    return <SelectionScreen storeName={storeName} onSelect={(mode) => setRoute(mode)} />;
  }

  if (route === "staff") {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center" style={{ color: "var(--text-primary)" }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              در حال بارگذاری...
            </p>
          </div>
        </div>
      );
    }
    return <StaffDashboard products={products} onBack={() => setRoute("select")} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ color: "var(--text-primary)" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            در حال بارگذاری...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen relative"
      style={{ color: "var(--text-primary)" }}
    >
      <WelcomeModal open={showWelcome} onSave={handleWelcomeSave} />

      <Sidebar
        current={page}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        storeName={storeName}
        isDark={isDark}
      />

      <main className="flex-1 min-w-0 relative z-10">
        {/* Mobile top bar */}
        <header
          className="lg:hidden sticky top-0 z-20 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b"
          style={{
            background: "var(--header-bg)",
            borderColor: "var(--header-border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(145deg, #0a0a0a, #1c1c1c)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  lineHeight: 1,
                  background: "linear-gradient(135deg, #ffffff, #94a3b8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                B
              </span>
            </div>
            <span className="text-base font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {storeName}
            </span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span className="text-base" style={{ color: "var(--text-secondary)" }}>
              {titles[page]}
            </span>
          </div>
          <button
            onClick={() => handleNavigate("dashboard")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
            style={{
              color: "var(--text-secondary)",
              background: "var(--surface)",
            }}
            title="بازگشت به داشبورد"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">داشبورد</span>
          </button>
          <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
        </header>

        {/* Desktop header */}
        <header
          className="hidden lg:flex sticky top-0 z-20 backdrop-blur-xl px-8 py-4 items-center justify-between border-b"
          style={{
            background: "var(--header-bg)",
            borderColor: "var(--header-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md"
              style={{
                background: "linear-gradient(145deg, #0a0a0a, #1c1c1c)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.375rem",
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  background: "linear-gradient(135deg, #ffffff, #94a3b8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                B
              </span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
                {storeName}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {titles[page]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate("dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style={{
                color: "var(--text-secondary)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              title="بازگشت به داشبورد"
            >
              <Home className="w-4 h-4" />
              <span>داشبورد</span>
            </button>
            <p className="text-base hidden xl:block" style={{ color: "var(--text-secondary)" }}>
              {new Intl.DateTimeFormat("fa-IR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
            <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {loadError && (
            <div
              className="mb-6 rounded-2xl p-4 text-sm font-medium"
              style={{
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                color: "#e11d48",
              }}
            >
              {loadError}
            </div>
          )}
          {page === "dashboard" && (
            <Dashboard products={products} sales={sales} onNavigate={handleNavigate} />
          )}
          {page === "products" && (
            <Products products={products} onChange={updateProducts} />
          )}
          {page === "sales" && (
            <Sales
              products={products}
              sales={sales}
              onAddSale={addSale}
              onProductsChange={updateProducts}
              onStockChange={updateStockMovements}
              stockMovements={stockMovements}
            />
          )}
          {page === "inventory" && (
            <Inventory
              products={products}
              stockMovements={stockMovements}
              onProductsChange={updateProducts}
              onStockChange={updateStockMovements}
            />
          )}
          {page === "settings" && (
            <Settings
              onReset={handleReset}
              storeName={storeName}
              onStoreNameChange={handleStoreNameChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
