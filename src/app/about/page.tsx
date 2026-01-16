import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
            Aplikasi ini dipersembahkan untuk pengusaha hotspot di manapun Anda
            berada. Semoga makin sukses.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Author : Laksamadi Guko</li>
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
            Copyright © 2018 Laksamadi Guko
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Changelog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            src="https://laksa19.github.io/mikhmonv3"
            className="h-96 w-full rounded border-0"
          />
        </CardContent>
      </Card>
    </div>
  );
}
