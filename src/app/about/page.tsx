import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CHANGELOG = [
  {
    version: "1.0.0",
    date: "2026-01-16",
    changes: [
      "Initial release of Mikhmon Next",
      "Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4",
      "Modern UI with shadcn/ui components",
      "Dark/Light mode support",
      "Responsive design for mobile and desktop",
      "Secure session management with AES-256-GCM encryption",
      "Rate limiting protection on all API routes",
      "Input validation with Zod schemas",
      "Multi-router session management",
      "Hotspot user management (add, generate, edit, delete)",
      "Hotspot profile management",
      "PPP secrets and profiles management",
      "Real-time traffic monitoring with charts",
      "DHCP leases viewer",
      "System scheduler management",
      "Quick print voucher system",
      "Selling report with daily/monthly filter",
      "Hotspot and user activity logs",
      "Voucher template editor",
      "System reboot and shutdown controls",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/sessions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">About</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            MIKHMON Next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Mikhmon Next</strong> adalah versi modern dari Mikhmon yang
            dibangun dengan Next.js, React, dan TypeScript. Aplikasi ini
            dipersembahkan untuk pengusaha hotspot di manapun Anda berada.
            Semoga makin sukses.
          </p>
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 font-semibold">Tech Stack</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Next.js 16 (App Router)</div>
              <div>React 19</div>
              <div>TypeScript</div>
              <div>Tailwind CSS 4</div>
              <div>Prisma ORM</div>
              <div>shadcn/ui</div>
            </div>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>
              Original Author :{" "}
              <a
                href="https://github.com/laksa19"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Laksamadi Guko
              </a>
            </li>
            <li>
              Licence :{" "}
              <a
                href="https://github.com/laksa19/mikhmonv2/blob/master/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GPLv2
              </a>
            </li>
            <li>
              Website :{" "}
              <a
                href="https://laksa19.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                laksa19.github.io
              </a>
            </li>
            <li>
              Facebook :{" "}
              <a
                href="https://fb.com/laksamadi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                fb.com/laksamadi
              </a>
            </li>
          </ul>
          <p className="text-sm">
            Terima kasih untuk semua yang telah mendukung pengembangan MIKHMON.
          </p>
          <div className="text-xs text-muted-foreground">
            Copyright © 2018-{new Date().getFullYear()} Laksamadi Guko
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Changelog - Mikhmon Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {CHANGELOG.map((release) => (
              <div key={release.version} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                    v{release.version}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {release.date}
                  </span>
                </div>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {release.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Mikhmon Original (PHP Version)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Untuk changelog versi PHP original, kunjungi:
          </p>
          <a
            href="https://laksa19.github.io/mikhmonv3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://laksa19.github.io/mikhmonv3
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
