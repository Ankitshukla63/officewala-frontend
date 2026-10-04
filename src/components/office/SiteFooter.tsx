import { Link } from '@tanstack/react-router'

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t-3 border-border bg-forest px-4 py-8 text-primary-foreground rounded-lg">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-display text-3xl">☕ OFFICE WALA</p>
        <p className="font-hand text-2xl text-mustard">Corporate Life, One Clip at a Time 😂</p>

        <div className="mx-auto mt-5 max-w-xl border-y-2 border-mustard/60 py-3 text-sm font-semibold">
          <p className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            <Link to="/manager">Manager</Link> • <Link to="/meetings">Meetings</Link> •{" "}
            <Link to="/deadline">Deadline</Link> • <Link to="/client">Client</Link>
          </p>
          <p className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-1">
            <Link to="/chai">Chai Break</Link> • <Link to="/wfh">WFH</Link> •{" "}
            <Link to="/friday">Friday</Link> • <Link to="/random">Random Clips</Link>
          </p>
        </div>

        <p className="mt-4 font-hand text-2xl text-mustard">
          "Kaam khatam nahi hua... bas laptop band kiya hai." 😎
        </p>
        <p className="mt-3 text-xs opacity-80">
          © 2026 OFFICE WALA • Made for all the corporate warriors 🫡
        </p>
      </div>
    </footer>
  )
}
