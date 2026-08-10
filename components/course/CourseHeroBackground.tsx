export function CourseHeroBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-[12%] -bottom-[30%] h-[70%] w-[55%] rounded-full bg-primary-500/20 blur-[120px]" />
            <div className="absolute -left-[8%] top-0 h-[45%] w-[38%] rounded-full bg-accent-300/15 blur-[130px]" />
        </div>
    );
}
