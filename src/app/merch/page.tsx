export default function MerchPage() {
    return (
        <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-onyx px-4 text-center">
            {/* Glowing background accent */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Icon */}
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-5xl shadow-rose transition-transform hover:scale-110">
                    🛍️
                </div>

                <div className="space-y-4">
                    <h1 className="font-heading text-6xl font-extrabold tracking-tight text-white md:text-8xl">
                        Merch{" "}
                        <span className="bg-gradient-to-r from-primary via-rose-500 to-pink-500 bg-clip-text text-transparent">
                            Soon
                        </span>
                    </h1>

                    <p className="font-sans max-w-lg text-xl font-medium text-zinc-400">
                        Something exciting is on its way. Check back soon for exclusive
                        <span className="text-white font-bold ml-1">Nablascha blummers</span> merch!
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 text-base font-black text-primary animate-pulse">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                    IN THE WORKS
                </div>
            </div>
        </main>
    );
}
