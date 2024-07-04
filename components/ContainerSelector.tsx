import useContainers from "@/hooks/useContainers"
import {Container} from "@agility/management-sdk"
import {useMemo} from "react"

interface ContainerSelectorProps {
	token: string
	guid: string
	onSelect: (container: Container) => void
}

export const ContainerSelector = ({token, guid, onSelect}: ContainerSelectorProps) => {
	const {data, isLoading} = useContainers({token, guid})

	const sharedContainers = useMemo(() => {
		if (!data) return []

		return data.filter((container) => container.isShared || container.isDynamicPageList)
	}, [data])

	if (isLoading) {
		return (
			<div>
				<div>Loading lists...</div>
			</div>
		)
	}

	return (
		<div className="h-full flex flex-col">
			<h2 className="text-lg font-bold py-3 ">Choose a List to Select an Item from:</h2>
			<div className="flex-1 min-h-0 overflow-auto pr-3">
				<ul>
					{sharedContainers?.map((container) => (
						<li key={container.contentViewName}>
							<button onClick={() => onSelect(container)}>{container.contentViewName}</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
