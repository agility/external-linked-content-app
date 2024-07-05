import classNames from "classnames"

import "./globals.css"
import "@agility/plenum-ui/dist/tailwind.css"

export const metadata = {
	title: "Agility CMS External Link Picker App",
	description: "Connect your BigCommerce store to Agility CMS",
}

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" className="font-sans h-full bg-white">
			<body className={classNames("bg-white h-full text-black overflow-hidden")}>{children}</body>
		</html>
	)
}
