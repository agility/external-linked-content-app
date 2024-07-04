/* eslint-disable @next/next/no-img-element */
import {useCallback, useEffect, useMemo, useState} from "react"
import {debounce} from "underscore"
import Loader from "./Loader"

import {Container, ContentItem} from "@agility/management-sdk"
import useItemListing from "@/hooks/useItemListing"

import ItemRow from "./ItemRow"
import {Button, TextInput} from "@agility/plenum-ui"

interface Props {
	token: string
	guid?: string
	container: Container
	locale?: string
	onSelectItem: (item: any) => void
}

export default function ItemListing({token, guid, container, locale, onSelectItem}: Props) {
	const [cursor, setCursor] = useState<string>("")
	const [filter, setFilter] = useState("")
	const [filterValueBounced, setfilterValueBounced] = useState<string>("")

	const setfilterValueAndDebounce = (val: string) => {
		setFilter(val)
		debouncefilterValue(val)
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncefilterValue = useCallback(
		//handle the search change - use debounce to limit how many times per second this is called
		debounce((value: string) => {
			//clear out the pagination cursor
			setCursor("")

			//set the filter
			setfilterValueBounced(value.toLowerCase())
		}, 250),
		[]
	)

	const [skip, setSkip] = useState(0)
	const take = 10

	const {isLoading, error, data} = useItemListing({
		token,
		guid,
		container,
		locale,
		skip,
		take,
		filter: filterValueBounced,
	})

	const items = useMemo(() => {
		if (!data || !data.items || !data.items[0]) return []
		return data?.items[0]
	}, [data])

	const totalItems = data?.totalCount

	return (
		<div className=" flex flex-col h-full">
			<div className="flex items-center gap-4">
				<div className="p-1 flex-1">
					<TextInput
						placeholder="Search"
						type="search"
						value={filter}
						handleChange={(value) => setfilterValueAndDebounce(value.trim())}
					/>
				</div>
				{data && data.items && data.items.length > 0 ? (
					<div className="text-gray-500 text-sm">
						{skip + 1} <span>to</span> {skip + items.length} of {totalItems ?? "?"} items
					</div>
				) : (
					<div className="text-gray-500 text-sm">Loading...</div>
				)}
				<div className="p-1 flex gap-2"></div>
			</div>
			{isLoading && (
				<div className="flex flex-col flex-1 h-full justify-center items-center min-h-0">
					<div className="flex gap-2 items-center text-gray-500">
						<Loader className="!h-6 !w-6 " />
						<div>Loading...</div>
					</div>
				</div>
			)}
			{error && <div>Error? {`${error}`}</div>}
			{!isLoading && !error && data && (
				<div className="min-h-0 flex-1 py-4">
					<div className="h-full overflow-auto scroll-black">
						<table className="min-w-full divide-y divide-gray-300">
							<thead className="bg-gray-50 sticky top-0 z-10 ">
								<tr>
									{container.columns.map((col) => (
										<th
											key={col.fieldName}
											scope="col"
											className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 "
										>
											{col.label}
										</th>
									))}

									<th scope="col" className=""></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 bg-white">
								{items.map((item: any) => (
									<ItemRow
										key={item.itemContainerID}
										item={item}
										container={container}
										onSelect={() => {
											onSelectItem(item)
										}}
									/>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
			<div className="flex justify-between gap-2 p-1">
				<Button
					actionType="alternative"
					label="Previous"
					icon="IconChevronLeft"
					className={skip > 0 ? "" : "invisible"}
					onClick={() => {
						setSkip(Math.max(0, skip - take))
					}}
				/>
				<Button
					actionType="alternative"
					label="Next"
					icon="IconChevronRight"
					className={skip + take < totalItems ? "" : "invisible"}
					onClick={() => {
						setSkip(skip + take)
					}}
				/>
			</div>
		</div>
	)
}
