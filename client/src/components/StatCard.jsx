function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-cyan-500/40">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
          <Icon size={22} />
        </div>

      </div>

      <p className="mt-4 text-xs font-medium text-emerald-400">
        {trend}
      </p>

    </div>
  );
}

export default StatCard;