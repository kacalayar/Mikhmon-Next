"use client";

import { useState } from "react";
import { FileText, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const TPL_DEFAULT = `<style>
.qrcode { height: 80px; width: 80px; }
</style>
<table class="voucher" style="width: 220px;">
  <tbody>
    <tr>
      <td style="text-align: left; font-size: 14px; font-weight: bold; border-bottom: 1px black solid;">
        <img src="{{logo}}" alt="logo" style="height: 30px; border: 0;">
        {{hotspotname}}
      </td>
    </tr>
    <tr>
      <td>
        <table style="text-align: center; width: 210px; font-size: 12px;">
          <tbody>
            <tr>
              <td>Kode Voucher</td>
            </tr>
            <tr>
              <td style="width: 100%; border: 1px solid black; font-weight: bold; font-size: 16px;">
                {{username}}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="border-top: 1px solid black; font-weight: bold; font-size: 16px">
                {{validity}} {{timelimit}} {{datalimit}} {{price}}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="font-weight: bold; font-size: 12px">
                Login: http://{{dnsname}}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;

const TPL_THERMAL = `<style>
.qrcode { height: 80px; width: 80px; }
</style>
<table class="voucher" style="width: 220px;">
  <tbody>
    <tr>
      <td style="text-align: left; font-size: 14px; font-weight: bold; border-bottom: 1px black solid;">
        <img src="{{logo}}" alt="logo" style="height: 30px; border: 0;">
        {{hotspotname}}
      </td>
    </tr>
    <tr>
      <td>
        <table style="text-align: center; width: 210px; font-size: 12px;">
          <tbody>
            <tr>
              <td>Kode Voucher</td>
            </tr>
            <tr>
              <td style="width: 100%; border: 1px solid black; font-weight: bold; font-size: 16px;">
                {{username}}
              </td>
            </tr>
            <tr>
              <td style="border-top: 1px solid black; font-weight: bold; font-size: 16px">
                {{validity}} {{timelimit}} {{datalimit}} {{price}}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;

const TPL_SMALL = `<style>
.qrcode { height: 60px; width: 60px; }
</style>
<table class="voucher" style="width: 180px;">
  <tbody>
    <tr>
      <td style="text-align: center; font-size: 12px; font-weight: bold; border-bottom: 1px black solid;">
        {{hotspotname}}
      </td>
    </tr>
    <tr>
      <td>
        <table style="text-align: center; width: 100%; font-size: 10px;">
          <tbody>
            <tr>
              <td>Voucher</td>
            </tr>
            <tr>
              <td style="border: 1px solid black; font-weight: bold; font-size: 14px;">
                {{username}}
              </td>
            </tr>
            <tr>
              <td style="font-weight: bold; font-size: 12px">
                {{timelimit}} {{datalimit}}
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>`;

const TEMPLATES: Record<string, string> = {
  default: TPL_DEFAULT,
  thermal: TPL_THERMAL,
  small: TPL_SMALL,
};

export default function TemplateEditorPage() {
  const [template, setTemplate] = useState("default");
  const [code, setCode] = useState(TPL_DEFAULT);

  function handleTemplateChange(value: string) {
    setTemplate(value);
    setCode(TEMPLATES[value] || TPL_DEFAULT);
  }

  function handleSave() {
    toast.success("Template saved successfully");
  }

  function handlePreview() {
    const preview = code
      .replace(/\{\{logo\}\}/g, 'https://via.placeholder.com/150x30?text=LOGO')
      .replace(/\{\{hotspotname\}\}/g, 'WiFi Hotspot')
      .replace(/\{\{username\}\}/g, 'demo123')
      .replace(/\{\{password\}\}/g, 'demo123')
      .replace(/\{\{validity\}\}/g, 'Valid: 1d')
      .replace(/\{\{timelimit\}\}/g, '1h')
      .replace(/\{\{datalimit\}\}/g, '500MB')
      .replace(/\{\{price\}\}/g, 'Rp 5.000')
      .replace(/\{\{profile\}\}/g, '1 Hour')
      .replace(/\{\{dnsname\}\}/g, '10.10.10.1')
      .replace(/\{\{qrcode\}\}/g, '<img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=demo123" class="qrcode">')
      .replace(/\{\{num\}\}/g, '1');

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;background:#f5f5f5;padding:20px}.voucher{background:white;padding:10px}</style></head><body>' + preview + '</body></html>';

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'width=400,height=600');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Template Editor</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>Voucher Template Editor</span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Template</SelectItem>
                  <SelectItem value="thermal">Thermal Template</SelectItem>
                  <SelectItem value="small">Small Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template Code (HTML with Mustache Variables)</Label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm"
                rows={20}
                placeholder="Enter template code..."
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">Available Variables (use double curly braces syntax):</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><code>{'{{logo}}'}</code> - Logo URL</div>
                <div><code>{'{{hotspotname}}'}</code> - Hotspot name</div>
                <div><code>{'{{username}}'}</code> - Username</div>
                <div><code>{'{{password}}'}</code> - Password</div>
                <div><code>{'{{validity}}'}</code> - Validity period</div>
                <div><code>{'{{timelimit}}'}</code> - Time limit</div>
                <div><code>{'{{datalimit}}'}</code> - Data limit</div>
                <div><code>{'{{price}}'}</code> - Price</div>
                <div><code>{'{{profile}}'}</code> - Profile name</div>
                <div><code>{'{{dnsname}}'}</code> - DNS name</div>
                <div><code>{'{{qrcode}}'}</code> - QR code image</div>
                <div><code>{'{{num}}'}</code> - Voucher number</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
