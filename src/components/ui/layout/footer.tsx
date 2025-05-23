export function Footer() {
    return (
        <footer className="bg-[#29487d] border-t border-[#1f355e] text-white shadow-sm">
            <div className="container mx-auto py-6 text-center">
                <p className="text-xl tracking-wide text-[#f5f5f5] ">
                    &copy; {new Date().getFullYear()} <span className="font-semibold text-white">MediScan</span>. All Rights Reserved.
                </p>
                <p className="mt-1 text-xs italic text-[#d1d1d1]">Innovating Health Insights, One Scan at a Time.</p>
            </div>
        </footer>
    );
}
