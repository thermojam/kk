export function HeroBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-[45%] -left-[22%] h-[90%] w-[80%] rounded-full bg-primary-500/30 blur-[120px]" />
            <div className="absolute right-[7%] top-[5%] h-[52%] w-[42%] rounded-full bg-accent-300/20 blur-[130px]" />
            <div className="absolute inset-y-0 right-0 w-[36%] bg-[linear-gradient(90deg,transparent,rgba(15,5,30,0.28))]" />
        </div>
    );
}
