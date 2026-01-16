 # Mikhmon Next
 
 Modern MikroTik Hotspot Monitor built with Next.js 16. A complete rewrite of the popular Mikhmon PHP application.
 
 ![Mikhmon Next](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
 ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
 ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwind-css)
 ![License](https://img.shields.io/badge/License-GPL--2.0-green?style=flat-square)
 
 ## About
 
 Mikhmon Next is a modern web-based MikroTik Hotspot Manager that allows you to manage hotspot users, generate vouchers, monitor traffic, and view sales reports. This version is built with Next.js and provides a modern, responsive UI with real-time capabilities.
 
 ## Credits
 
 This project is a Next.js rewrite inspired by the original **Mikhmon PHP** created by:
 
 **Laksamadi Guko** - Original Mikhmon PHP Author
 - GitHub: [github.com/laksa19](https://github.com/laksa19)
 - Website: [laksa19.github.io](https://laksa19.github.io)
 - Original Repository: [github.com/laksa19/mikhmonv3](https://github.com/laksa19/mikhmonv3)
 
 **Mikhmon Next Author:**
 - **Kacalayar**
 
 ## Features
 
 ### Dashboard
 - Real-time system monitoring (CPU, Memory, Uptime)
 - Traffic monitoring with interactive charts
 - Hotspot statistics (Active users, Hosts, Profiles)
 - Income overview
 - Hotspot log viewer
 
 ### Hotspot Management
 - **Users** - Add, edit, delete, enable/disable hotspot users
 - **Generate Users** - Bulk generate voucher users with customizable options
 - **Active Connections** - View and disconnect active sessions
 - **User Profiles** - Manage hotspot user profiles
 - **Hosts** - View connected hosts (All, Authorized, Bypassed)
 - **IP Bindings** - Manage IP binding rules
 - **Cookies** - View and manage hotspot cookies
 
 ### PPP Management
 - **Secrets** - Manage PPP secrets
 - **Profiles** - View PPP profiles
 - **Active** - Monitor active PPP connections
 
 ### Voucher System
 - View vouchers by profile
 - Print vouchers (Default, QR, Small templates)
 - Quick Print packages
 - Customizable voucher templates (HTML with Mustache syntax)
 
 ### Reports
 - **Sales Report** - Daily/Monthly sales with filtering
 - **Export** - CSV export functionality
 - **Delete** - Delete records by period
 
 ### System
 - **DHCP Leases** - View DHCP server leases
 - **Traffic Monitor** - Real-time interface traffic monitoring
 - **Scheduler** - View and manage system scheduler
 - **Logs** - Hotspot and User logs
 - **Reboot/Shutdown** - System control
 
 ### Settings
 - **Session** - Router session management
 - **Logo** - Upload custom logo
 - **Template** - Customize voucher print templates
 
 ### Multi-Router Support
 - Connect to multiple MikroTik routers
 - Switch between routers easily
 - Secure credential storage
 
 ## Tech Stack
 
 - **Framework**: Next.js 16 (App Router)
 - **Language**: TypeScript
 - **Styling**: Tailwind CSS 4
 - **UI Components**: shadcn/ui
 - **Charts**: Recharts
 - **Tables**: TanStack React Table
 - **Authentication**: NextAuth.js v5
 - **MikroTik API**: node-routeros
 
 ## Requirements
 
 - Node.js 18+
 - MikroTik RouterOS with API enabled (port 8728)
 - MikroTik user with API access permissions
 
 ## Installation
 
 1. Clone the repository:
 ```bash
 git clone https://github.com/kacalayar/mikhmon-next.git
 cd mikhmon-next
 ```
 
 2. Install dependencies:
 ```bash
 npm install
 ```
 
 3. Configure environment variables:
 ```bash
 cp .env.example .env
 ```
 
 Edit `.env` and set your `AUTH_SECRET`:
 ```env
 AUTH_SECRET=your-secret-key-here
 ```
 
 4. Run development server:
 ```bash
 npm run dev
 ```
 
 5. Open [http://localhost:3000](http://localhost:3000)
 
 ## Default Login
 
 - **Username**: `admin`
 - **Password**: `admin`
 
 > Change the default credentials in `data/routers.json` after first login.
 
 ## MikroTik Configuration
 
 Enable API service on your MikroTik:
 ```
 /ip service set api disabled=no port=8728
 ```
 
 For remote access (DDNS/Public IP):
 ```
 /ip service set api address=0.0.0.0/0
 ```
 
 Create API user (recommended):
 ```
 /user add name=mikhmon password=yourpassword group=full
 ```
 
 ## Production Deployment
 
 Build for production:
 ```bash
 npm run build
 npm start
 ```
 
 ### Deploy to Vercel
 
 1. Push your code to GitHub
 2. Import project to [Vercel](https://vercel.com)
 3. Add **Vercel Postgres** from Storage tab:
    - Go to your project dashboard
    - Click "Storage" tab
    - Click "Create Database" → Select "Postgres"
    - Connect to your project
 4. Set environment variables:
    - `AUTH_SECRET` - Generate with `openssl rand -base64 32`
 5. Deploy!
 
 > **Note**: Router data will be stored in Vercel Postgres. For local development, data is stored in `data/routers.json`.
 
 ## Project Structure
 
 ```
 mikhmon-next/
 ├── src/
 │   ├── app/
 │   │   ├── (admin)/        # Admin routes (sessions, router management)
 │   │   ├── (dashboard)/    # Dashboard routes (hotspot, ppp, reports)
 │   │   ├── api/            # API routes
 │   │   └── login/          # Login page
 │   ├── components/         # React components
 │   │   ├── layout/         # Layout components (sidebar, header)
 │   │   └── ui/             # UI components (shadcn/ui)
 │   ├── lib/                # Utilities and helpers
 │   └── types/              # TypeScript types
 ├── data/                   # Data storage (routers.json)
 └── public/                 # Static assets
 ```
 
 ## License
 
 This project is licensed under the **GNU General Public License v2.0** - same as the original Mikhmon PHP.
 
 See [LICENSE](LICENSE) for details.
 
 ## Acknowledgments
 
 - [Laksamadi Guko](https://github.com/laksa19) - Original Mikhmon PHP creator
 - [MikroTik](https://mikrotik.com) - RouterOS
 - [Vercel](https://vercel.com) - Next.js framework
 - [shadcn](https://ui.shadcn.com) - UI components
 
 ## Contributing
 
 Contributions are welcome! Please feel free to submit a Pull Request.
 
 ## Support
 
 If you find this project helpful, please give it a star on GitHub!
