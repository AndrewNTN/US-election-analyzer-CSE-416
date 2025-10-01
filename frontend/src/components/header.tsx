import { Link } from "@tanstack/react-router";
import capitolIcon from "@/assets/united-states-capitol-3-svgrepo-com.svg";

export default function Header() {
  return (
    <header className="w-full text-white shadow-lg relative z-50 bg-slate-900 border-b border-slate-700">
      {/* Purple top bar */}
      <div
        className="w-full h-1"
        style={{
          background:
            "linear-gradient(to right, oklch(0.606 0.25 292.717), oklch(0.506 0.25 292.717))",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-5 hover:opacity-90 transition-opacity"
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(to right, oklch(0.606 0.25 292.717), oklch(0.506 0.25 292.717))",
                }}
              >
                <img
                  src={capitolIcon}
                  alt="US Capitol"
                  className="w-6 h-6"
                  style={{
                    filter: "brightness(0) saturate(100%) invert(100%)",
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  US Election Analyzer
                </h1>
                <p className="text-xs opacity-70 -mt-0.5">
                  Data-Driven Election Insights
                </p>
              </div>
            </Link>
          </div>
          <div className="text-sm font-medium px-3 py-1 rounded-full text-white">
            Team Lakers
          </div>
        </div>
      </div>
    </header>
  );
}
