export default function MerchPage() {
    return (
        <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-black px-4 text-center">
            {/* Glowing background accent */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-96 w-96 rounded-full bg-rose-600/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-4xl">
                    🛍️
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                    Merch{" "}
                    <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
                        Coming Soon
                    </span>
                </h1>

                <p className="max-w-md text-lg text-zinc-400">
                    Something exciting is on its way. Check back soon for exclusive
                    Nablascha blummers merch!
                </p>

                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-5 py-2 text-sm text-rose-400">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                    </span>
                    In the works
                </div>
            </div>
        </main>
    );
}
