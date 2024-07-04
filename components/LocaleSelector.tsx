import useContainers from "@/hooks/useContainers"
import useLocales from "@/hooks/useLocales"
import {Container} from "@agility/management-sdk"
import {useEffect, useMemo} from "react"

interface LocaleSelectorProps {
	token: string
	guid: string
	onSelect: (locale: string) => void
}

export const LocaleSelector = ({token, guid, onSelect}: LocaleSelectorProps) => {
	const {data: locales, isLoading} = useLocales({token, guid})

	useEffect(() => {
		if (locales.length === 1) {
			onSelect(locales[0].localeCode)
		}
	}, [locales, onSelect])

	if (isLoading) {
		return (
			<div>
				<div>Loading locales...</div>
			</div>
		)
	}

	return (
		<div className="h-full flex flex-col">
			<h2 className="text-lg font-bold py-3 ">Choose a Locale:</h2>
			<div className="flex-1 min-h-0 overflow-auto pr-3">
				<ul>
					{locales?.map((locale: any) => (
						<li key={locale.localeID}>
							<button onClick={() => onSelect(locale.localeCode)}>
								{locale.localeName} ({locale.localeCode})
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
